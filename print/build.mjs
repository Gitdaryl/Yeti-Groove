// Studio NFC pieces. cd print && npm install && node build.mjs  ->  out/*.pdf (press, no guides), *-proof.png, review-qr.png
// Not deployed: .vercelignore keeps print/ off yetigroove.com. Steps for ordering and writing the chips: README.md.
import { chromium } from 'playwright-core';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');

// www is the primary host; the bare domain adds a 307 hop
export const LINKS = {
  cardTap: 'https://www.yetigroove.com/card/tap',
  cardQr: 'https://www.yetigroove.com/card/qr',
  reviewTap: 'https://www.yetigroove.com/review/tap',
  reviewQr: 'https://www.yetigroove.com/review/qr',
};
const EMAIL = 'daryl@yetigroove.com';
const PHONE = ''; // printed and in the vCard only once Yeti picks a number

function qr(text, dark = '#080807') {
  const q = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = q.modules.size, d = q.modules.data;
  let p = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[y * n + x]) p += `M${x} ${y}h1v1h-1z`;
  return { version: q.version, svg: `<svg viewBox="-4 -4 ${n + 8} ${n + 8}" shape-rendering="crispEdges" style="display:block;width:100%;height:100%"><rect x="-4" y="-4" width="${n + 8}" height="${n + 8}" fill="#fff"/><path d="${p}" fill="${dark}"/></svg>` };
}

const CONTACTLESS = (c) => `<svg viewBox="12 8 66 84" style="display:block;width:100%;height:100%">${[12, 22, 32, 42].map(r => {
  const a = 50 * Math.PI / 180, x = (20 + r * Math.cos(a)).toFixed(2), y1 = (50 - r * Math.sin(a)).toFixed(2), y2 = (50 + r * Math.sin(a)).toFixed(2);
  return `<path d="M${x} ${y1}A${r} ${r} 0 0 1 ${x} ${y2}" fill="none" stroke="${c}" stroke-width="6.5" stroke-linecap="round"/>`;
}).join('')}</svg>`;

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500&display=block" rel="stylesheet">';
const BASE = `:root{--k:#080807;--g:#C9A55A;--c:#F0EDE6;--m:#B0A390}
*{box-sizing:border-box;margin:0;padding:0}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:'DM Sans',sans-serif;color:var(--c)}
.page{position:relative;overflow:hidden;background:var(--k);break-after:page}
.abs{position:absolute}.serif{font-family:'Playfair Display',serif;font-weight:700}
.guides{display:none}.proof .guides{display:block}
.g-trim{position:absolute;border:1px solid #00B7FF}.g-safe{position:absolute;border:1px dashed #E0007A}`;

/* ---------------- CONTACT CARD, CR80 3.375 x 2.125 landscape, NFC PVC ----------------
   The studio keeps this card: they tap it, the contact lands on their phone, the card goes back in the wallet. */
function contactCard() {
  const B = 0.125, TW = 3.375, TH = 2.125, W = TW + 2 * B, H = TH + 2 * B;
  const q = qr(LINKS.cardQr);
  const css = `${BASE}@page{size:${W}in ${H}in;margin:0}.page{width:${W}in;height:${H}in}`;
  const guides = `<div class="guides"><div class="g-trim" style="left:${B}in;top:${B}in;width:${TW}in;height:${TH}in"></div>
    <div class="g-safe" style="left:${B + .125}in;top:${B + .125}in;width:${TW - .25}in;height:${TH - .25}in"></div></div>`;
  const x = (v) => B + v, y = (v) => B + v; // trim coordinates -> page
  const front = `<div class="page">
    <img class="abs" src="assets/yeti-head.webp" style="left:${x(.2)}in;top:${y(.3)}in;width:1.6in;height:auto">
    <div class="abs" style="left:${x(1.86)}in;top:${y(.42)}in;width:1.3in">
      <div style="font-size:5.6pt;letter-spacing:.16em;color:var(--g);white-space:nowrap">DEVILS LAKE · MICHIGAN</div>
      <div class="serif" style="font-size:17pt;line-height:1.05;margin-top:.07in">Yeti Groove</div>
      <div class="serif" style="font-size:17pt;line-height:1.05;font-style:italic;color:var(--g)">Media</div>
      <div style="height:1px;background:rgba(201,165,90,.5);margin:.13in 0 .12in;width:1.1in"></div>
      <div style="display:flex;align-items:center;gap:.07in">
        <div style="width:.22in;height:.26in;flex:none">${CONTACTLESS('#C9A55A')}</div>
        <div style="font-size:6.6pt;line-height:1.25">Tap your phone here<br><span style="color:var(--m)">to save our contact</span></div>
      </div>
    </div>
    ${guides}</div>`;
  const back = `<div class="page">
    <div class="abs" style="left:${x(.3)}in;top:${y(.36)}in;width:1.4in;height:1.4in">${q.svg}</div>
    <div class="abs" style="left:${x(1.9)}in;top:${y(.4)}in;width:1.3in">
      <div class="serif" style="font-size:11pt;color:var(--g);line-height:1.15">No tap?<br>Scan it.</div>
      <div style="font-size:6.8pt;line-height:1.55;margin-top:.12in">${EMAIL}<br>yetigroove.com${PHONE ? `<br>${PHONE}` : ''}</div>
      <div style="font-size:5.6pt;line-height:1.35;color:var(--m);margin-top:.14in">Worked with us?<br>yetigroove.com/review</div>
    </div>
    ${guides}</div>`;
  return { name: 'contact-card', W, H, css, pages: [front, back], qr: { back: q.version } };
}

const browser = await chromium.launch({ executablePath: CHROME });
for (const job of [contactCard()]) {
  for (const proof of [false, true]) {
    const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${job.css}</style></head><body${proof ? ' class="proof"' : ''}>${job.pages.join('')}</body></html>`;
    const file = path.join(HERE, `.${job.name}${proof ? '-proof' : ''}.html`);
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: Math.round(job.W * 96), height: Math.round(job.H * 96) }, deviceScaleFactor: proof ? 3 : 1 });
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (!proof) await page.pdf({ path: path.join(OUT, `${job.name}.pdf`), width: `${job.W}in`, height: `${job.H}in`, printBackground: true, preferCSSPageSize: true });
    else {
      const els = await page.$$('.page');
      for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(OUT, `${job.name}-${['front', 'back'][i]}-proof.png`) });
    }
    await page.close();
    fs.unlinkSync(file);
  }
  console.log(job.name, 'QR versions', JSON.stringify(job.qr));
}

// The review QR as a phone image: for the rare phone that will not read the case sticker, open Photos and show this.
const rq = qr(LINKS.reviewQr);
const page = await browser.newPage({ viewport: { width: 390, height: 520 }, deviceScaleFactor: 3 });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{background:#080807;width:390px;height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center}
  </style></head><body><div class="serif" style="font-size:26px;color:#C9A55A">Tell Google how we did</div>
  <div style="width:280px;height:280px">${rq.svg}</div>
  <div style="font-size:17px;color:#F0EDE6">Yeti Groove Media</div></body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(OUT, 'review-qr.png') });
console.log('review-qr QR version', rq.version);
await browser.close();
