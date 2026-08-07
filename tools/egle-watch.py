#!/usr/bin/env python3
"""
EGLE public notice watcher: finds pre-construction developers in Yeti Groove's
territory before they start marketing.

Michigan EGLE publishes every permit application that requires a public notice.
Anything touching wetlands, inland lakes, streams, or needing its own
wastewater plant shows up here, with the applicant's name and the site address,
months before there is anything to photograph. That is the window.

The feed is the same JSON the MiEnviro public notice search runs on:
  https://mienviro.michigan.gov/ncore/external/publicnotice/search

Usage:
  python3 tools/egle-watch.py              # new notices since last run
  python3 tools/egle-watch.py --all        # everything currently posted
  python3 tools/egle-watch.py --counties Lenawee,Jackson
  python3 tools/egle-watch.py --json       # machine-readable

State lives in tools/.egle-seen.json so a weekly run only shows what changed.

KNOWN LIMIT, learned the hard way on the first run. The permits big enough to
trip a public notice skew toward national builders, and an LLC name hides it:
"Fosdick Glen Development, LLC" is Toll Brothers, "RD Michigan Property Owner I
LLC" is Related Digital. Both scored CALL here and neither is a real prospect,
because national builders market in-house. Always search the applicant name
before you pick up the phone.

The corollary matters more than the tool: your actual buyer is a local
developer whose project is too small to need its own wastewater plant but big
enough to need selling. Devils Lake Cove was exactly that, and it probably
never appeared in this feed. Township planning commission agendas are the
primary source. This is the cheap secondary that runs itself.
"""

import argparse, gzip, io, json, os, re, sys, urllib.request

FEED = ("https://mienviro.michigan.gov/ncore/ss/publicnoticeslist"
        "?includeMetadataInResponse=false&loadChildren=false"
        "&queryParams=%7B%22filter%22:%5B%7B%7D%5D%7D")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

# Drive time from Devils Lake. Widen at your own peril; every county you add is
# another county you have to actually follow up on.
COUNTIES = ["Lenawee", "Jackson", "Washtenaw", "Hillsdale",
            "Monroe", "Branch", "Calhoun", "Ingham"]

STATE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".egle-seen.json")

# A private entity building its own infrastructure is the whole signal. Public
# bodies file constantly and never commission a film.
NOT_A_PROSPECT = re.compile(
    r"\b(city of|village of|county|township|twp|drain commissioner|"
    r"school district|intermediate school|department of transportation|mdot|"
    r"road commission|state of michigan|dnr|egle|authority|university)\b", re.I)

# Names that read like someone building something to sell.
DEVELOPER = re.compile(
    r"\b(development|developers|properties|property|homes|communities|"
    r"estates|land|marina|harbor|resort|ventures|partners|holdings|"
    r"builders|construction|realty|investments|capital|group|llc|lp|inc)\b", re.I)

STRONG = re.compile(
    r"\b(development|developers|communities|estates|marina|harbor|resort|"
    r"homes|builders|land)\b", re.I)


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "application/json",
        "Accept-Encoding": "gzip",
    })
    with urllib.request.urlopen(req, timeout=45) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
    return json.loads(raw.decode("utf-8"))


def score(row):
    """Return (tier, why). Tier 1 is worth a call, 3 is noise."""
    who = (row.get("contactNameApplicant") or "") + " " + (row.get("siteName") or "")
    prog = row.get("programAreaDescription") or ""
    site = (row.get("siteName") or "")

    if NOT_A_PROSPECT.search(who):
        return 3, "public body"
    if not who.strip():
        return 3, "no applicant named"

    # Its own wastewater plant means a community large enough to need one.
    # That is a subdivision, not a cottage.
    if re.search(r"\bWWTP\b|wastewater", site, re.I) and DEVELOPER.search(who):
        return 1, "private entity building its own wastewater plant"

    if STRONG.search(who):
        return 1, "developer-shaped applicant"

    # Wetland / inland lake / stream work by a private company.
    if "Resources" in prog and DEVELOPER.search(who):
        return 2, "private company doing water or wetland work"

    if "Resources" in prog:
        return 3, "likely an individual property owner"

    return 3, "routine permit"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--counties", default=",".join(COUNTIES))
    ap.add_argument("--all", action="store_true", help="ignore the seen list")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--tier", type=int, default=2, help="max tier to show (1=best)")
    args = ap.parse_args()

    counties = {c.strip().lower() for c in args.counties.split(",") if c.strip()}

    try:
        rows = fetch(FEED)["queryResults"]
    except Exception as e:
        print(f"EGLE feed unreachable: {e}", file=sys.stderr)
        return 1

    seen = set()
    if os.path.exists(STATE) and not args.all:
        try:
            seen = set(json.load(open(STATE)).get("ids", []))
        except Exception:
            pass

    out = []
    for r in rows:
        if (r.get("countyDescription") or "").lower() not in counties:
            continue
        tier, why = score(r)
        if tier > args.tier:
            continue
        key = r.get("submissionRefNumber") or r.get("id")
        if key in seen:
            continue
        out.append({
            "tier": tier, "why": why, "id": key,
            "applicant": r.get("contactNameApplicant") or "-",
            "site": r.get("siteName") or "-",
            "address": " ".join(x for x in [r.get("address1"), r.get("city"),
                                            r.get("zipCode")] if x) or "-",
            "county": r.get("countyDescription"),
            "program": r.get("programAreaDescription"),
            "type": r.get("publicNotificationTypeDescription"),
            "opened": (r.get("startDate") or "")[:10],
            "comment_closes": (r.get("endDate") or "")[:10],
            "contact_at_egle": r.get("assignedUserName"),
            "phone": r.get("assignedPhone"),
            "map": (f"https://www.google.com/maps?q={r['latitude']},{r['longitude']}"
                    if r.get("latitude") else None),
            "profile": r.get("siteProfileUrl"),
        })

    out.sort(key=lambda x: (x["tier"], x["opened"]))

    # Record everything scanned, not just what was shown, so raising --tier
    # later does not replay months of old notices as if they were new.
    all_ids = [r.get("submissionRefNumber") or r.get("id") for r in rows
               if (r.get("countyDescription") or "").lower() in counties]
    json.dump({"ids": sorted(set(all_ids) | seen)}, open(STATE, "w"))

    if args.json:
        print(json.dumps(out, indent=2))
        return 0

    if not out:
        print("No new notices worth a call. "
              f"(Scanned {len(all_ids)} in {len(counties)} counties.)")
        return 0

    print(f"{len(out)} to look at, from {len(all_ids)} notices "
          f"across {len(counties)} counties\n")
    for o in out:
        flag = "CALL" if o["tier"] == 1 else "look"
        print(f"[{flag}] {o['applicant']}")
        print(f"       {o['site']}")
        print(f"       {o['address']}  ({o['county']} County)")
        print(f"       {o['why']} · {o['program']} · posted {o['opened']}, "
              f"comment closes {o['comment_closes']}")
        if o["map"]:
            print(f"       {o['map']}")
        if o["profile"]:
            print(f"       {o['profile']}")
        if o["tier"] == 1:
            print("       ^ search this name first. If it is a national "
                  "builder, it is not a prospect.")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
