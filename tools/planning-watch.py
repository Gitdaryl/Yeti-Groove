#!/usr/bin/env python3
"""
Township planning commission watcher: the primary prospect source for
Signature Films.

EGLE only sees projects big enough to need a permit, which means projects big
enough to have a marketing department (see tools/egle-watch.py). Township
planning commissions see everything else, which is where the actual buyer is:
a local owner developing lakefront land who has to sell it themselves.

Measured Aug 2026 across the Irish Hills lake corridor: Columbia Township
alone had a development item in 11 of its last 13 meetings, with named local
applicants in most of them. That is roughly an order of magnitude more signal
than the whole EGLE feed produced across eight counties.

What it does: reads each township's planning commission minutes archive,
downloads anything new, extracts the text, and reports meetings that contain a
site plan review, PUD, plat, special land use, condominium, or rezoning,
together with the applicant names it can find.

Needs pdftotext (poppler):  brew install poppler

Usage:
  python3 tools/planning-watch.py                 # new since last run
  python3 tools/planning-watch.py --all           # rescan everything
  python3 tools/planning-watch.py --since 2025    # only documents from 2025 on
  python3 tools/planning-watch.py --json
"""

import argparse, concurrent.futures as cf, gzip, io, json, os, re, ssl
import subprocess, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".planning-cache")
STATE = os.path.join(HERE, ".planning-seen.json")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

# Confirmed working archives: each posts dated minutes PDFs going back years.
# Lake-corridor townships first, because that is the niche.
SOURCES = [
    ("Columbia Twp (Clark Lake / Brooklyn)",
     "https://twp.columbia.mi.us/planning-commission-minutes/"),
    ("Grass Lake Charter Twp",
     "https://www.grasslaketownship.gov/planning-commission-minutes/"),
    ("Henrietta Twp",
     "https://henriettatownshipmi.gov/planning-commission-minutes/"),
    ("Rives Twp",
     "https://rivestownshipmi.com/planning-commission-minutes/"),
]

# Cambridge is Devils Lake and Manitou Beach, so it matters more than anything
# else on the list. Its archive is real (83 planning documents back to 2021)
# but hidden behind revize accordions that only render under JS, which is why a
# plain fetch makes the page look empty. Needs playwright.
#
# Half of it is readable: AGENDAS have a text layer, MINUTES are scanned images
# with none. That is the good half, because an agenda is the leading indicator.
# It says what is being heard before the meeting; minutes only say what already
# happened. To recover the minutes later: tesseract is installed, so
# `pdftoppm -r 300 -png in.pdf p && tesseract p-1.png -` would work.
#
# Cambridge PC meets the last Wednesday of the month at 7:00 PM, on Zoom,
# view-only with no public comment through Zoom. Chairman Rick Streams,
# streamsrick@gmail.com, township office 517-467-2104.
#
# Reality check as of Aug 2026: every readable 2025-2026 Cambridge agenda is
# ordinance housekeeping (lot coverage in the Lake District Overlay, metal
# frame structures). Zero development applications. The home township is quiet,
# which is exactly why the pipeline has to reach into Clark Lake and beyond.
ACCORDION_SOURCES = [
    ("Cambridge Twp (Devils Lake / Manitou Beach)",
     "https://www.cambridgetownshipmi.gov/notices/index.php"),
]

# Townships whose planning pages post only a single "Latest Agenda" PDF that is
# overwritten each month, or that publish nothing at all. No archive means no
# scraping; these are a calendar reminder, not a feed.
MANUAL = [
    ("Rollin Twp (Devils Lake / Round Lake)",
     "https://www.rollintownship.org/departments/planning_commission.php",
     "publishes only the master plan and zoning maps, no agendas or minutes. "
     "PC meets 1st Thursday 4:00pm, 730 Manitou Rd. 517-547-7786, "
     "clerk@rollintownship.gov"),
    ("Woodstock Twp (Sand Lake)",
     "https://www.woodstocktownship.com/planning-minutes.html",
     "single 'Latest Agenda' PDF, overwritten monthly"),
    ("Norvell Twp (Wamplers Lake)",
     "https://norvelltwp-mi.gov/planning-commission/",
     "single current packet PDF, overwritten monthly"),
    ("Liberty Twp",
     "https://www.libertytwp.us/minutes-planning.html",
     "single 'Latest Agenda' PDF, overwritten monthly"),
    ("Village of Brooklyn",
     "https://www.villageofbrooklyn.com/planning-minutes.html",
     "single 'Latest Agenda' PDF, overwritten monthly"),
    ("Blackman Twp",
     "https://blackmantwp.com/",
     "posts named CASE files per meeting, but scanned images with no text layer"),
]

# What a prospect looks like in a set of minutes.
SIGNALS = {
    "PUD": r"planned\s*unit\s*development|\bPUD\b",
    "site plan": r"site\s*plan\s*(review|approval)",
    "plat": r"(preliminary|final)\s*plat",
    "condominium": r"\bcondominium\b",
    "subdivision": r"\bsubdivision\b",
    "special land use": r"special\s*(land\s*)?use",
    "rezoning": r"\brezon\w+",
}
# Weighted: a PUD or a plat is somebody building a community. A special land
# use is often a guy putting a workshop in his pole barn.
STRONG = {"PUD", "site plan", "plat", "condominium", "subdivision"}

# The label is case-insensitive, the NAME deliberately is not. Do not put a
# global (?i) on this: it makes [A-Z] match lowercase and the capture starts
# swallowing prose like "Applicant addressed concerns regarding...".
APPLICANT = re.compile(
    r"(?:[Oo]wner\s*/\s*[Aa]pplicant|[Aa]pplicant\s*/\s*[Oo]wner"
    r"|[Aa]pplicant|[Oo]wner)\s*:\s*"
    r"([A-Z][\w.'&-]+(?:\s+[A-Z][\w.'&-]+){0,5}"
    r"(?:\s*/\s*[A-Z][\w.'&,-]+(?:\s+[A-Z][\w.'&,-]+){0,5})?)")
COMPANY = re.compile(
    r"\b([A-Z][\w'&.-]+(?:\s+[A-Z][\w'&.-]+){0,4},?\s*"
    r"(?:LLC|L\.L\.C\.|Ltd\.?|Inc\.?|LP|Properties|Development))\b")
ADDRESS = re.compile(
    r"\b(\d{2,6}\s+[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,4}\s*"
    r"(?:Rd|Road|St|Street|Ave|Avenue|Dr|Drive|Ln|Lane|Hwy|Highway|Blvd)\b[^\n,]{0,40})")
ACRES = re.compile(r"(?i)\b((?:approximately\s+)?[\d.]+\s*acres?)\b")


def fetch(url, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                               "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
        return r.geturl(), raw


def index_pdfs(url):
    final, raw = fetch(url)
    html = raw.decode("utf-8", "replace")
    out, seen = [], set()
    for m in re.finditer(r'<a[^>]+href="([^"#]+\.pdf)"[^>]*>(.*?)</a>',
                         html, re.S | re.I):
        full = urllib.parse.urljoin(final, m.group(1))
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.group(2))).strip()
        blob = urllib.parse.unquote(full) + " " + text
        if not re.search(r"(?i)(minute|agenda|packet)", blob):
            continue
        if full in seen:
            continue
        seen.add(full)
        out.append({"label": text or os.path.basename(full), "url": full,
                    "year": (re.findall(r"20[12]\d", blob) or [None])[0]})
    return out


def index_pdfs_js(url):
    """Same as index_pdfs, but for revize document centers whose folders only
    exist after JS clicks every h3.docs-toggle open."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("! playwright not installed, skipping Cambridge "
              "(pip install playwright && playwright install chromium)",
              file=sys.stderr)
        return []
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        try:
            pg.goto(url, wait_until="networkidle", timeout=60000)
            pg.wait_for_timeout(2000)
            pg.evaluate("document.querySelectorAll('h3.docs-toggle')"
                        ".forEach(h => h.click())")
            pg.wait_for_timeout(2500)
            links = pg.evaluate(
                "Array.from(document.querySelectorAll('a'))"
                ".map(a => [a.innerText.trim().replace(/\\s+/g,' '), a.href])")
        except Exception as e:
            print(f"! {url}: {type(e).__name__}", file=sys.stderr)
            links = []
        finally:
            b.close()
    for text, href in links:
        if not re.search(r"(?i)\.(pdf)(\?|$)", href):
            continue
        blob = urllib.parse.unquote(href) + " " + text
        # "pc agenda-Sep252024.pdf" and "p.c. minutes-june 26, 2024.pdf" are
        # planning; "agenda & packet-jan 8, 2025.pdf" is the township board.
        if not re.search(r"(?i)\bp\.?\s?c\.?\b|planning", blob):
            continue
        out.append({"label": text or os.path.basename(href), "url": href,
                    "year": (re.findall(r"20[12]\d", blob) or [None])[0]})
    seen, ded = set(), []
    for d in out:
        if d["url"] in seen:
            continue
        seen.add(d["url"])
        ded.append(d)
    return ded


def text_of(url):
    os.makedirs(CACHE, exist_ok=True)
    name = re.sub(r"[^A-Za-z0-9]+", "_", url)[-120:] + ".pdf"
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        try:
            _, raw = fetch(url)
            with open(path, "wb") as f:
                f.write(raw)
        except Exception:
            return ""
    try:
        r = subprocess.run(["pdftotext", "-layout", path, "-"],
                           capture_output=True, timeout=90)
        return r.stdout.decode("utf-8", "replace")
    except FileNotFoundError:
        print("pdftotext not found. brew install poppler", file=sys.stderr)
        sys.exit(2)
    except Exception:
        return ""


def analyze(txt):
    found = [k for k, pat in SIGNALS.items() if re.search(pat, txt, re.I)]
    if not found:
        return None
    names, companies = [], []
    for m in APPLICANT.finditer(txt):
        v = " ".join(m.group(1).split())
        # Minutes are full of prose like "Applicant explained that..."
        if len(v) < 4 or len(v) > 70:
            continue
        if re.match(r"(?i)^(presentation|acknowledg|confirm|estimat|explain|"
                    r"address|chose|must|is|was|shall|has|had|will|also|then|"
                    r"stated|noted|agreed|and|the)\b", v):
            continue
        names.append(v)
    for m in COMPANY.finditer(txt):
        companies.append(" ".join(m.group(1).split()))
    return {
        "signals": found,
        "strong": bool(set(found) & STRONG),
        "applicants": sorted(set(names))[:5],
        "companies": sorted(set(companies))[:5],
        "addresses": sorted(set(" ".join(a.split())
                                for a in ADDRESS.findall(txt)))[:3],
        "acres": sorted(set(a.strip() for a in ACRES.findall(txt)))[:3],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--since", type=int, default=2025,
                    help="ignore documents older than this year")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strong-only", action="store_true",
                    help="only PUD / site plan / plat / condo / subdivision")
    args = ap.parse_args()

    seen = set()
    if os.path.exists(STATE) and not args.all:
        try:
            seen = set(json.load(open(STATE)).get("urls", []))
        except Exception:
            pass

    todo, scanned = [], 0
    indexes = ([(n, u, index_pdfs) for n, u in SOURCES] +
               [(n, u, index_pdfs_js) for n, u in ACCORDION_SOURCES])
    for name, url, reader in indexes:
        try:
            docs = reader(url)
        except Exception as e:
            print(f"! {name}: index unreachable ({type(e).__name__})",
                  file=sys.stderr)
            continue
        for d in docs:
            scanned += 1
            if d["year"] and int(d["year"]) < args.since:
                continue
            if d["url"] in seen:
                continue
            todo.append((name, d))

    results = []
    with cf.ThreadPoolExecutor(max_workers=6) as ex:
        for (name, d), txt in zip(todo, ex.map(lambda t: text_of(t[1]["url"]), todo)):
            if not txt.strip():
                continue
            a = analyze(txt)
            if not a:
                continue
            if args.strong_only and not a["strong"]:
                continue
            results.append({"township": name, "meeting": d["label"],
                            "url": d["url"], **a})

    json.dump({"urls": sorted(seen | {d["url"] for _, d in todo})},
              open(STATE, "w"))

    # The township hall address appears in every set of minutes for that
    # township. Anything showing up in most meetings is the venue, not a site.
    per_township = {}
    for r in results:
        per_township.setdefault(r["township"], []).append(r)
    for name, rs in per_township.items():
        counts = {}
        for r in rs:
            for a in set(r["addresses"]):
                counts[a] = counts.get(a, 0) + 1
        venues = {a for a, c in counts.items() if len(rs) > 2 and c > len(rs) / 2}
        for r in rs:
            r["addresses"] = [a for a in r["addresses"] if a not in venues]

    results.sort(key=lambda r: (not r["strong"], r["township"], r["meeting"]))

    if args.json:
        print(json.dumps(results, indent=2))
        return 0

    if not results:
        print(f"Nothing new. (Scanned {scanned} documents across "
              f"{len(SOURCES) + len(ACCORDION_SOURCES)} archives.)")
    else:
        print(f"{len(results)} meetings with development items "
              f"(from {len(todo)} new documents)\n")
        for r in results:
            flag = "CALL" if r["strong"] else "look"
            print(f"[{flag}] {r['township']} · {r['meeting']}")
            print(f"       {', '.join(r['signals'])}")
            for k, label in (("applicants", "who"), ("companies", "co"),
                             ("addresses", "at"), ("acres", "size")):
                if r[k]:
                    print(f"       {label:>4}: {'; '.join(r[k])[:110]}")
            print(f"       {r['url']}")
            print()

    print(f"Not scrapeable, check these by hand or by calendar reminder:")
    for name, url, why in MANUAL:
        print(f"  - {name}: {why}")
        print(f"    {url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
