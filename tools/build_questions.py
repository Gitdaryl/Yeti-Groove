#!/usr/bin/env python3
"""Builds the answer-first question pages: /questions/<slug>.html and the /questions hub.

Content lives in tools/questions_data.py. Run from the repo root:  python3 tools/build_questions.py
Pages use the Lost Customer Check report look (self-hosted fonts in /fonts/fonts.css) and each one
ends by pointing at the leak it belongs to and at /streamline.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from questions_data import QUESTIONS, LEAKS  # noqa: E402

SITE = 'https://www.yetigroove.com'
ORG = {'@type': 'Organization', '@id': SITE + '/#studio', 'name': 'YetiGroove Studio', 'url': SITE + '/'}


def plain(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s))


CSS = """
:root{
  --paper:#F4F7F7; --card:#FFFFFF; --ink:#10303A; --muted:#566B72; --line:#D5E0E2;
  --lake:#1C6B7A; --lake-hover:#155663; --lake-soft:#E1EEF0; --amber:#E3A21A; --amber-soft:#FBF0D6; --amber-ink:#7A5200;
  --on-lake:#FFFFFF; --on-lake-soft:#DDF1F5;
  --display:'Bricolage Grotesque','Avenir Next','Segoe UI',sans-serif;
  --body:'Atkinson Hyperlegible','Helvetica Neue',Arial,sans-serif;
  color-scheme:light;
}
@media (prefers-color-scheme: dark){
  :root{
    color-scheme:dark;
    --paper:#0D1C21; --card:#132830; --ink:#E6F0F1; --muted:#9DB3B8; --line:#24414A;
    --lake:#5EC1D2; --lake-hover:#7DD0DE; --lake-soft:#173A43; --amber:#F2B83A; --amber-soft:#3A2F14; --amber-ink:#F6CF77;
    --on-lake:#06272E; --on-lake-soft:#0B3A44;
  }
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);font-size:18px;line-height:1.6;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));
  padding-top:max(24px,env(safe-area-inset-top,0px));padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))}
.wrap{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:40px}
h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0;line-height:1.12}
h1{font-size:clamp(34px,6vw,54px);font-weight:800;letter-spacing:-.02em}
h2{font-size:clamp(24px,3.6vw,30px);font-weight:800;letter-spacing:-.01em}
h3{font-size:20px;font-weight:600}
p{margin:0}
a{color:var(--lake)}
a:hover{color:var(--lake-hover)}
a:focus-visible{outline:2px solid var(--lake);outline-offset:3px;border-radius:4px}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--lake)}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-family:var(--display);font-weight:800;font-size:19px;color:var(--ink);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
.top-links{display:flex;gap:18px;flex-wrap:wrap}
.top-links a{font-weight:700;font-size:15px;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
header{display:flex;flex-direction:column;gap:16px}
.answer{font-size:clamp(20px,2.4vw,23px);line-height:1.5;background:var(--card);border:1.5px solid var(--line);border-left:6px solid var(--lake);border-radius:14px;padding:20px 22px}
.answer b{display:block;font-size:13px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--lake);margin-bottom:6px}
.meta{font-size:14px;color:var(--muted)}
article{display:flex;flex-direction:column;gap:34px}
section{display:flex;flex-direction:column;gap:14px}
section p{max-width:65ch}
section ul,section ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:10px;max-width:62ch}
blockquote{margin:0;padding:12px 18px;border-left:4px solid var(--amber);background:var(--amber-soft);border-radius:0 10px 10px 0;color:var(--ink);max-width:62ch}
blockquote cite{display:block;font-style:normal;font-size:14px;color:var(--amber-ink);margin-top:6px}
.check{background:var(--lake);color:var(--on-lake);border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.check .eyebrow{color:var(--on-lake-soft)}
.check h2{color:var(--on-lake)}
.check p{color:var(--on-lake-soft);max-width:60ch}
.check a.btn{display:inline-flex;align-items:center;min-height:50px;padding:0 22px;border-radius:999px;background:var(--on-lake);color:var(--lake);font-weight:700;text-decoration:none}
.check a.btn:focus-visible{outline:3px solid var(--on-lake-soft);outline-offset:2px}
.sources{border-top:1px solid var(--line);padding-top:22px}
.sources ol{font-size:15px;color:var(--muted)}
.sources a{word-break:break-word}
.more ul{list-style:none;padding:0;display:grid;gap:10px}
.more li a{display:block;background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:14px 16px;text-decoration:none;font-weight:700;color:var(--ink)}
.more li a:hover{border-color:var(--lake)}
.hub{list-style:none;padding:0;margin:0;display:grid;gap:14px}
.hub a{display:flex;flex-direction:column;gap:8px;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:20px 22px;text-decoration:none;color:var(--ink)}
.hub a:hover{border-color:var(--lake)}
.hub .tag{font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--lake)}
.hub strong{font-family:var(--display);font-size:22px;line-height:1.2}
.hub span.a{color:var(--muted);font-size:16px}
footer{font-size:14px;color:var(--muted);border-top:1px solid var(--line);padding-top:18px}
"""


def shell(path, title, desc, body, ld, og_type='article'):
    url = f'{SITE}/{path}'
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{title}</title>
<meta name="description" content="{html.escape(desc, quote=True)}" />
<link rel="canonical" href="{url}" />
<meta property="og:title" content="{html.escape(plain(title), quote=True)}" />
<meta property="og:description" content="{html.escape(desc, quote=True)}" />
<meta property="og:type" content="{og_type}" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{SITE}/media/streamline/story/poster.jpg" />
<link rel="icon" href="/brand/yeti-head-256.png" />
<link rel="preload" href="/fonts/bricolage-grotesque-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/atkinson-hyperlegible-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/fonts/fonts.css" />
{lds}<style>{CSS}</style>
</head>
<body>
<div class="wrap">
<div class="topbar">
  <a class="brand" href="/">YetiGroove</a>
  <span class="top-links"><a href="/questions">All questions</a><a href="/streamline">The Lost Customer Check</a></span>
</div>
{body}
<footer>YetiGroove Studio &middot; Made in lake country, Michigan &middot; <a href="mailto:daryl@yetigroove.com">daryl@yetigroove.com</a></footer>
</div>
</body>
</html>
"""


def para(x):
    if isinstance(x, tuple) and x[0] == 'quote':
        _, text, cite = x
        return f'  <blockquote>{text}<cite>{cite}</cite></blockquote>\n'
    if isinstance(x, tuple) and x[0] == 'list':
        return '  <ul>' + ''.join(f'<li>{i}</li>' for i in x[1]) + '</ul>\n'
    return f'  <p>{x}</p>\n'


def question_page(q):
    path = f'questions/{q["slug"]}'
    url = f'{SITE}/{path}'
    leak = LEAKS[q['leak']]
    secs = ''.join(f'<section>\n  <h2>{h}</h2>\n' + ''.join(para(x) for x in paras) + '</section>\n' for h, paras in q['sections'])
    check = (f'<aside class="check">\n  <span class="eyebrow">{leak["name"]} &middot; part of The Lost Customer Check</span>\n'
             f'  <h2>{q["check_h"]}</h2>\n  <p>{q["check_p"]}</p>\n  <a class="btn" href="/streamline">See what the check covers</a>\n</aside>\n')
    src = ''
    if q.get('sources'):
        src = ('<section class="sources">\n  <span class="eyebrow">Sources</span>\n  <ol>' + ''.join(
            f'<li><a href="{u}" rel="noopener" target="_blank">{t}</a></li>' for t, u in q['sources']) + '</ol>\n'
            f'  <p class="meta">Quotes checked against each source on {q["checked"]}.</p>\n</section>\n')
    others = [x for x in QUESTIONS if x['slug'] != q['slug']]
    more = ('<section class="more">\n  <span class="eyebrow">More questions owners ask us</span>\n  <ul>' + ''.join(
        f'<li><a href="/questions/{x["slug"]}">{x["q"]}</a></li>' for x in others) + '</ul>\n</section>\n')
    body = (f'<header>\n  <span class="eyebrow">{leak["name"]}</span>\n  <h1>{q["q"]}</h1>\n'
            f'  <p class="answer"><b>Short answer</b>{q["answer"]}</p>\n'
            f'  <p class="meta">YetiGroove Studio &middot; Updated {q["checked"]}</p>\n</header>\n'
            f'<article>\n{secs}{check}{src}{more}</article>')
    ld = [
        {'@context': 'https://schema.org', '@type': 'Article', '@id': url + '#article', 'headline': plain(q['q']), 'url': url,
         'mainEntityOfPage': url, 'datePublished': q['date'], 'dateModified': q.get('modified', q['date']),
         'description': plain(q['answer']), 'author': ORG, 'publisher': ORG},
        {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': plain(q['q']), 'acceptedAnswer': {'@type': 'Answer', 'text': plain(q['answer'])}}]},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': 'Questions', 'item': SITE + '/questions'},
            {'@type': 'ListItem', 'position': 3, 'name': plain(q['q']), 'item': url}]},
    ]
    return shell(path, q['title'], q['desc'], body, ld)


def hub():
    url = SITE + '/questions'
    items = ''.join(f'<li><a href="/questions/{q["slug"]}"><span class="tag">{LEAKS[q["leak"]]["name"]}</span>'
                    f'<strong>{q["q"]}</strong><span class="a">{q["answer"]}</span></a></li>' for q in QUESTIONS)
    body = ('<header>\n  <span class="eyebrow">Questions &middot; Michigan small business</span>\n'
            '  <h1>Straight answers for small business owners</h1>\n'
            '  <p class="answer"><b>What this is</b>The questions owners type into Google about getting found, answering customers and '
            'running the business, answered in plain words with the sources listed.</p>\n</header>\n'
            f'<ul class="hub">{items}</ul>\n'
            '<aside class="check">\n  <span class="eyebrow">Rather we checked yours?</span>\n'
            '  <h2>The Lost Customer Check</h2>\n  <p>One day. We check how you get found, how fast you answer, and what is still done by hand, '
            'then switch one fix on before we leave. $750, counted toward the fix.</p>\n'
            '  <a class="btn" href="/streamline">See what the check covers</a>\n</aside>')
    ld = [{'@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url + '#page', 'name': 'Straight answers for small business owners',
           'url': url, 'publisher': ORG,
           'hasPart': [{'@type': 'Article', 'headline': plain(q['q']), 'url': f'{SITE}/questions/{q["slug"]}'} for q in QUESTIONS]},
          {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
              {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
              {'@type': 'ListItem', 'position': 2, 'name': 'Questions', 'item': url}]}]
    return shell('questions', 'Small Business Questions, Answered Straight | YetiGroove',
                 'Plain answers to what Michigan small business owners ask: showing up on Google Maps and ChatGPT, getting reviews, '
                 'getting leads, after-hours calls, and running the business with less hand work.', body, ld, og_type='website')


def main():
    qdir = ROOT / 'questions'
    qdir.mkdir(exist_ok=True)
    for f in qdir.glob('*.html'):
        f.unlink()
    for q in QUESTIONS:
        (qdir / f'{q["slug"]}.html').write_text(question_page(q))
    (ROOT / 'questions.html').write_text(hub())
    print(f'built {len(QUESTIONS)} question pages + hub')


if __name__ == '__main__':
    main()
