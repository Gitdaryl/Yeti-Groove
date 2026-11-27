#!/usr/bin/env python3
"""Stamps the one studio nav bar into every page, between the YGNAV markers.

    python3 tools/site_nav.py           rewrite the marked blocks
    python3 tools/site_nav.py --check   exit 1 if any page has drifted

The link row is the same on every page. Only the gold button changes, so each page
keeps its own next step. To change the menu, edit LINKS here, run this, and run
tools/build_questions.py (it imports render() for the question pages).
Left out on purpose: admin, fix, card, social, lakeaccess and partners/ (tools,
order forms and co-branded or private pages).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LINKS = [
    ('work', '/#reel', 'The Work'),
    ('reviews', '/#proof', 'Reviews'),
    ('check', '/streamline', 'Lost Customer Check'),
    ('office', '/field-office', 'Field Office'),
    ('films', '/signature', 'Signature Films'),
    ('questions', '/questions', 'Questions'),
]
EMAIL = 'daryl@yetigroove.com'

# Gold button: (href, full label, phone label, extra attributes)
CONTACT = ('/#contact', 'Contact', 'Contact', '')
BOOK = ('/streamline#start', 'Book the check', 'Book', '')

# page file -> (highlighted link, gold button)
PAGES = {
    'index.html': (None, ('#contact', 'Contact', 'Contact', '')),
    'streamline.html': ('check', ('#start', 'Book the check', 'Book', '')),
    'streamline-sample.html': ('check', BOOK),
    'streamline-thanks.html': ('check', CONTACT),
    'field-office.html': ('office', ('#demo', 'See the demo', 'Demo', '')),
    'signature.html': ('films', ('#inquire', 'Commission a Film', 'Commission', ' data-inquire data-tier="Signature Film"')),
    'architects.html': ('films', ('#send', 'Send Plans', 'Send Plans', '')),
    'platform.html': (None, CONTACT),
    'privacy.html': (None, CONTACT),
    'terms.html': (None, CONTACT),
    'sms-policy.html': (None, CONTACT),
}

START, END = '<!-- YGNAV:start (tools/site_nav.py) -->', '<!-- YGNAV:end -->'
BLOCK = re.compile(re.escape(START) + r'.*?' + re.escape(END), re.S)


def render(active=None, cta=CONTACT, exact=True):
    """exact=False marks a child of the highlighted section rather than the page itself."""
    href, full, short, extra = cta
    mark = ' aria-current="%s"' % ('page' if exact else 'true')
    links = ''.join(
        f'    <a class="ygn-link" href="{url}"{mark if key == active else ""}>{label}</a>\n'
        for key, url, label in LINKS)
    return (
        f'{START}\n'
        '<nav class="ygn" aria-label="Main">\n'
        '  <a class="ygn-brand" href="/" aria-label="Yeti Groove Media home"><img src="/brand/yeti-head-256.png" alt="" width="30" height="27" />'
        '<span class="ygn-name">Yeti Groove<span class="ygn-media"> Media</span></span></a>\n'
        '  <div class="ygn-links" id="ygnLinks">\n'
        f'{links}'
        f'    <a class="ygn-link ygn-mail" href="mailto:{EMAIL}">{EMAIL}</a>\n'
        '  </div>\n'
        f'  <a class="ygn-cta" href="{href}"{extra}><span class="ygn-full">{full}</span><span class="ygn-short">{short}</span></a>\n'
        '  <button class="ygn-toggle" type="button" aria-expanded="false" aria-controls="ygnLinks">Menu</button>\n'
        '</nav>\n'
        '<script src="/site-nav.js"></script>\n'
        f'{END}'
    )


def main():
    check = '--check' in sys.argv
    exact_pages = {'streamline.html', 'field-office.html', 'signature.html'}
    bad = []
    for name, (active, cta) in PAGES.items():
        path = ROOT / name
        text = path.read_text()
        if len(BLOCK.findall(text)) != 1 or '/site-nav.css' not in text:
            bad.append(f'{name}: needs one YGNAV block and the /site-nav.css link')
            continue
        new = BLOCK.sub(lambda _: render(active, cta, name in exact_pages), text)
        if new != text:
            if check:
                bad.append(f'{name}: nav differs from tools/site_nav.py')
            else:
                path.write_text(new)
                print('updated', name)
    if bad:
        print('\n'.join(bad))
        sys.exit(1)
    print(f'nav ok on {len(PAGES)} pages (question pages come from build_questions.py)')


if __name__ == '__main__':
    main()
