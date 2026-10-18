// Field Office feature scenes.
//
// Every scene is a plain SVG string driven by one CSS number, --p, from 0 to 1.
// The same scene loops on a timer inside a feature card and follows the scroll
// in the storm-day story. With no script (or Reduce Motion) --p sits at the
// scene's `still`, a frame that tells the story on its own.
//
// Works in the browser and in Node (tools/field-office-sync.mjs prerenders it).

// Progress of --p through the window [a, b], as a CSS number from 0 to 1.
const S = (a, b) => `clamp(0, (var(--p) - ${a}) / ${(b - a).toFixed(3)}, 1)`;
const fade = (a, b = a + 0.06) => `opacity:${S(a, b)};`;
const win = (a, z, f = 0.05) => `opacity:min(${S(a, a + f)}, 1 - ${S(z, z + f)});`;
const from = (a, b, dx, dy) =>
  `transform:translate(calc((1 - ${S(a, b)}) * ${dx}px), calc((1 - ${S(a, b)}) * ${dy}px));`;
const draw = (a, b) => `stroke-dasharray:1;stroke-dashoffset:calc(1 - ${S(a, b)});`;
const pop = (a, b = a + 0.08) => `transform:scale(calc(.6 + .4 * ${S(a, b)}));opacity:${S(a, b)};`;

let uid = 0;
const svg = (body, label = '') =>
  `<svg class="fo-svg" viewBox="0 0 320 180" aria-hidden="true" focusable="false"${label ? ` data-scene="${label}"` : ''}>${body}</svg>`;
const rr = (x, y, w, h, r, cls, style = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" class="${cls}"${style ? ` style="${style}"` : ''}/>`;
const tx = (x, y, s, cls = '', style = '', anchor = '') =>
  `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''}${anchor ? ` text-anchor="${anchor}"` : ''}${style ? ` style="${style}"` : ''}>${s}</text>`;
const path = (d, cls, style = '', extra = '') =>
  `<path d="${d}" class="${cls}"${style ? ` style="${style}"` : ''}${extra}/>`;
const line = (x1, y1, x2, y2, cls, style = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${style ? ` style="${style}"` : ''}/>`;
const circ = (cx, cy, r, cls, style = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"${style ? ` style="${style}"` : ''}/>`;
const g = (inner, style = '', cls = '') =>
  `<g${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}>${inner}</g>`;
const check = (x, y, s, style, cls = 'gs') =>
  path(`M${x} ${y} l${s * 0.35} ${s * 0.35} l${s * 0.65} ${-s * 0.7}`, cls, style, ' pathLength="1"');
const phone = (x, y, w, h) => rr(x, y, w, h, 16, 'sf st') + rr(x + w / 2 - 14, y + 6, 28, 4, 2, 'mf');

// 24-unit line icons, used by the fallback scene and the tiles.
export const ICONS = {
  handshake: '<path d="M2 11l4-4 4 2 3-2 4 0 5 5-6 6-2-1-2 2-3-2-2 1z"/><path d="M10 9l-3 3 2 2 3-2"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  rule: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  truck: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  wrench: '<path d="M15 4a5 5 0 0 0-5 6l-7 7 4 4 7-7a5 5 0 0 0 6-5l-3 3-3-1-1-3z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 13h18"/>',
  doc: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 2 6 5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  tap: '<path d="M9 12V6a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v4c0 4-3 7-7 7-3 0-5-2-6-5l-1-2a2 2 0 0 1 4-1l1 2"/><path d="M16 3a6 6 0 0 1 4 4"/>',
  snow: '<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h1M4 12h1M4 18h1"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h1M12 12h1M16 12h1M8 16h1M12 16h1M16 16h1"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/>',
};
const icon = (name, x, y, s = 1, cls = 'ic') =>
  `<g class="${cls}" transform="translate(${x} ${y}) scale(${s})">${ICONS[name] || ICONS.box}</g>`;

const photoGlyph = (x, y, w, h) =>
  rr(x, y, w, h, 4, 'sf2') + path(`M${x + 4} ${y + h - 4} l${w * 0.3} ${-h * 0.45} l${w * 0.2} ${h * 0.25} l${w * 0.15} ${-h * 0.15} l${w * 0.27} ${h * 0.35}`, 'ln');

export const SCENES = {
  // Storm watch: radar sweep, hail crosses the towns, posts get drafted.
  radar: { still: 0.92, render() {
    const cx = 96, cy = 90;
    const towns = [[70, 60, 1], [122, 72, 1], [88, 114, 1], [134, 110, 0], [52, 98, 0], [108, 38, 0]];
    let b = circ(cx, cy, 74, 'sf') + circ(cx, cy, 25, 'st') + circ(cx, cy, 50, 'st') + circ(cx, cy, 74, 'st');
    b += line(cx - 74, cy, cx + 74, cy, 'st') + line(cx, cy - 74, cx, cy + 74, 'st');
    b += g(path(`M${cx} ${cy}L${cx} ${cy - 74}A74 74 0 0 1 ${cx + 52} ${cy - 52}Z`, 'sweep'),
      `transform-origin:${cx}px ${cy}px;transform:rotate(calc(var(--p) * 1080deg));`);
    b += g(circ(60, 74, 13, 'hail') + circ(76, 66, 10, 'hail') + circ(70, 86, 9, 'hail') +
      circ(64, 72, 2, 'cf') + circ(72, 80, 2, 'cf') + circ(80, 70, 2, 'cf'),
      `transform:translate(calc(${S(0, 0.7)} * 70px - 30px), calc(${S(0, 0.7)} * 22px - 8px));`);
    towns.forEach(([x, y, hit], i) => {
      b += circ(x, y, 4, 'mf');
      if (hit) {
        b += circ(x, y, 4.5, 'gf', fade(0.26 + i * 0.07));
        b += circ(x, y, 11, 'gs', `transform-box:fill-box;transform-origin:center;${win(0.26 + i * 0.07, 0.6)}`);
      }
    });
    b += tx(196, 22, 'Storm watch', 'tg tb');
    [0, 1, 2].forEach((i) => {
      const y = 32 + i * 46;
      b += g(rr(196, y, 112, 38, 8, 'sf st') + rr(204, y + 8, 22, 22, 4, 'gd') +
        rr(232, y + 10, 66, 6, 3, 'mf') + tx(232, y + 30, `Post ${i + 1} drafted`, 'tm t10'),
        fade(0.4 + i * 0.1) + from(0.4 + i * 0.1, 0.5 + i * 0.1, 0, 12));
    });
    return b;
  } },

  // A call is missed on the roof; a text goes back; the lead appears.
  'missed-call': { still: 1, render() {
    let b = phone(16, 10, 128, 160);
    b += circ(80, 52, 15, 'sf2') + icon('people', 70, 42, 0.85);
    b += g(tx(80, 88, 'Incoming call', 'tm', '', 'middle') +
      circ(80, 52, 22, 'gs') + circ(80, 52, 30, 'st'), win(-1, 0.24));
    b += g(tx(80, 88, 'Missed call', 'tg tb', '', 'middle'), fade(0.25));
    b += g(rr(26, 102, 108, 42, 12, 'gf') + tx(36, 119, 'Sorry we missed', 'tk') + tx(36, 135, 'you. Address?', 'tk'),
      fade(0.42) + from(0.42, 0.52, 0, 14));
    b += line(150, 90, 176, 90, 'gs dash', fade(0.66));
    b += g(rr(182, 58, 124, 66, 10, 'sf st') + rr(182, 58, 5, 66, 2, 'gf') +
      tx(196, 82, 'New lead', 'tb t13') + tx(196, 100, 'Missed call', 'tm') + tx(196, 115, 'Voicemail typed', 'tg t10'),
      fade(0.7) + from(0.7, 0.8, -18, 0));
    return b;
  } },

  // Form, text, call and email all flow into one list.
  'every-door': { still: 1, render() {
    const doors = [['doc', 'Form'], ['chat', 'Text'], ['tap', 'Call'], ['mail', 'Email']];
    let b = rr(190, 14, 116, 152, 12, 'sf st') + tx(204, 36, 'Leads', 'tb t13');
    doors.forEach(([ic, label], i) => {
      const y = 18 + i * 38, a = 0.06 + i * 0.17, ry = 48 + i * 28;
      b += rr(16, y, 30, 30, 8, 'gd st') + icon(ic, 19, y + 3, 1, 'ic');
      b += tx(54, y + 20, label, 'tm');
      b += line(96, y + 15, 188, ry + 11, 'st dash');
      b += circ(96, y + 15, 4.5, 'gf',
        `${win(a, a + 0.13)}transform:translate(calc(${S(a, a + 0.12)} * 92px), calc(${S(a, a + 0.12)} * ${ry + 11 - y - 15}px));`);
      b += g(rr(200, ry, 96, 22, 6, 'sf2') + circ(211, ry + 11, 4, 'gf') + rr(221, ry + 8, 62 - i * 8, 6, 3, 'mf'),
        fade(a + 0.12) + from(a + 0.12, a + 0.2, 10, 0));
    });
    return b;
  } },

  // Measure the roof; pitch, layers and decking feed the price.
  measure: { still: 1, render() {
    let b = rr(40, 92, 140, 54, 3, 'sf') + path('M26 94L110 32L194 94Z', 'sf2 st');
    b += rr(98, 116, 24, 30, 2, 'mf');
    b += path('M28 82L108 23', 'gs', draw(0.04, 0.24), ' pathLength="1"');
    b += tx(46, 46, '8/12', 'tg tb', fade(0.2));
    b += path('M40 158H180M40 153v10M180 153v10', 'gs', draw(0.24, 0.4), ' pathLength="1"');
    b += tx(110, 176, '38 ft', 'tg tb', fade(0.36), 'middle');
    ['Pitch', 'Layers', 'Decking'].forEach((s, i) => {
      const y = 46 + i * 28, a = 0.42 + i * 0.12;
      b += rr(214, y - 11, 15, 15, 4, 'st') + check(217, y - 3, 10, draw(a, a + 0.06)) + tx(238, y, s, '');
    });
    b += g(rr(208, 122, 100, 28, 8, 'gf') + tx(258, 140, 'Estimate ready', 'tk tb t11', '', 'middle'),
      `transform-box:fill-box;transform-origin:center;${pop(0.8)}`);
    return b;
  } },

  // Good, better, best: the customer taps the middle one, adds two extras and signs.
  options: { still: 1, render() {
    const names = ['Good', 'Better', 'Best'];
    let b = '';
    names.forEach((n, i) => {
      const x = 14 + i * 100, rec = i === 1;
      b += rr(x, 16, 92, 104, 10, 'sf st') + tx(x + 10, 40 + (rec ? 10 : 0), n, 'tb t12');
      b += rr(x + 10, 52 + (rec ? 8 : 0), 64, 5, 2.5, 'mf') + rr(x + 10, 63 + (rec ? 8 : 0), 50, 5, 2.5, 'mf');
      if (i > 0) b += rr(x + 10, 74 + (rec ? 8 : 0), 58, 5, 2.5, 'mf');
      if (i > 1) b += rr(x + 10, 85, 44, 5, 2.5, 'mf');
      b += rr(x + 8, 98, 76, 16, 6, 'sf2') + tx(x + 46, 110, 'Choose', 't10', '', 'middle');
    });
    b += path('M114 26a10 10 0 0 1 10-10h72a10 10 0 0 1 10 10v4H114z', 'gf') + tx(160, 27, 'Recommended', 'tk tb t10', '', 'middle');
    b += rr(114, 16, 92, 104, 10, 'gs', fade(0.4));
    b += g(rr(122, 98, 76, 16, 6, 'gf') + tx(160, 110, 'Chosen', 'tk tb t10', '', 'middle'), fade(0.4));
    b += circ(160, 106, 14, 'gs', `transform-box:fill-box;transform-origin:center;${win(0.36, 0.48)}`);
    b += g(circ(160, 106, 7, 'finger'),
      `${win(0.16, 0.7)}transform:translate(calc((1 - ${S(0.16, 0.36)}) * 60px + ${S(0.46, 0.56)} * -88px + ${S(0.6, 0.68)} * 92px), calc((1 - ${S(0.16, 0.36)}) * 50px + ${S(0.46, 0.56)} * 32px));`);
    [['+ Warranty', 32, 0.56], ['+ Upgrade', 220, 0.68]].forEach(([t, x, a]) => {
      b += rr(x, 128, 70, 20, 10, 'sf2 st') + tx(x + 35, 142, t, 't10', '', 'middle');
      b += g(rr(x, 128, 70, 20, 10, 'gf') + tx(x + 35, 142, t, 'tk tb t10', '', 'middle'), fade(a));
    });
    b += tx(160, 142, 'Add-ons', 'tm t10', '', 'middle');
    b += line(70, 170, 250, 170, 'st');
    b += path('M86 167c6-11 12 4 18-3s9-10 13 0 10 4 16-4 9 6 22 0', 'gs', draw(0.76, 0.92), ' pathLength="1"');
    b += tx(250, 164, 'Signed', 'tg tb t10', fade(0.92), 'end');
    return b;
  } },

  // The job cannot land inside the 3-day cancel window.
  'cancel-window': { still: 1, render() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let b = path('M17 50v-8h122v8', 'gs') + tx(78, 34, '3-day cancel window', 'tg tb', '', 'middle');
    days.forEach((d, i) => {
      const x = 17 + i * 42;
      b += rr(x, 60, 38, 54, 6, i < 3 ? 'gd dashb' : 'sf');
      b += tx(x + 19, 76, d, 'tm t10', '', 'middle');
    });
    const shake = `sin(calc(${S(0.2, 0.34)} * 25.13)) * 4px`;
    b += g(rr(147, 86, 30, 22, 5, 'gf') + tx(162, 101, 'Crew', 'tk tb t10', '', 'middle'),
      `transform:translate(calc(-84px * (1 - ${S(0.36, 0.5)}) + ${shake}), calc(-68px * (1 - ${S(0.04, 0.18)}) - 48px * ${S(0.36, 0.5)} + 48px * ${S(0.5, 0.62)}));`);
    b += path('M72 124l10 10M82 124l-10 10', 'gs', win(0.2, 0.42));
    b += tx(77, 152, 'Not yet', 'tm', win(0.2, 0.44), 'middle');
    b += check(152, 126, 14, draw(0.64, 0.72));
    b += tx(162, 156, 'Scheduled', 'tg tb', fade(0.7), 'middle');
    return b;
  } },

  // Rain on the forecast; the job moves a day in one tap.
  'rain-move': { still: 1, render() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let b = '';
    days.forEach((d, i) => { b += tx(92 + i * 46, 24, d, 'tm t10', '', 'middle'); });
    ['Crew 1', 'Crew 2', 'Crew 3'].forEach((c, r) => {
      const y = 34 + r * 44;
      b += tx(14, y + 22, c, 'tm t10');
      days.forEach((_, i) => { b += rr(70 + i * 46, y, 42, 36, 6, 'sf'); });
    });
    b += rr(116, 78, 42, 36, 6, 'mf') + rr(162, 122, 42, 36, 6, 'mf') + rr(70, 122, 42, 36, 6, 'mf');
    b += g(path('M197 52a9 9 0 0 1 17-4 7 7 0 1 1 3 14h-21a6 6 0 0 1 1-10z', 'cloud') +
      path('M200 66l-3 7M208 66l-3 7M216 66l-3 7', 'rain'), win(0.08, 0.66) + from(0.08, 0.16, 0, -10));
    b += g(rr(208, 34, 42, 36, 6, 'gf') + tx(229, 56, 'Roof', 'tk tb t10', '', 'middle'),
      `transform:translateX(calc((1 - ${S(0.5, 0.64)}) * -46px));`);
    b += circ(208, 52, 14, 'gs', `transform-box:fill-box;transform-origin:center;${win(0.38, 0.5)}`);
    b += g(circ(208, 52, 7, 'finger'), win(0.3, 0.6) + from(0.3, 0.4, 30, 40));
    b += tx(229, 172, 'Moved to Fri', 'tg tb', fade(0.68), 'middle');
    return b;
  } },

  // One message, English then Spanish.
  translate: { still: 0.72, render() {
    let b = rr(28, 14, 264, 152, 14, 'sf st');
    b += tx(142, 44, 'EN', 'tb', '', 'middle') + tx(178, 44, 'ES', 'tb', '', 'middle');
    b += rr(128, 52, 28, 3, 1.5, 'gf', `transform:translateX(calc(${S(0.42, 0.5)} * 36px - ${S(0.92, 0.98)} * 36px));`);
    b += rr(46, 68, 228, 64, 14, 'gf');
    b += g(tx(62, 95, 'Tear-off starts at 7.', 'tk tb t12') + tx(62, 115, 'Dumpster in the driveway.', 'tk t12'),
      `opacity:max(1 - ${S(0.4, 0.46)}, ${S(0.94, 0.99)});`);
    b += g(tx(62, 95, 'El desmonte empieza a las 7.', 'tk tb t12') + tx(62, 115, 'Contenedor en la entrada.', 'tk t12'),
      `opacity:min(${S(0.46, 0.52)}, 1 - ${S(0.9, 0.95)});`);
    b += check(62, 148, 10, draw(0.55, 0.62)) + tx(80, 152, 'Each person reads it in their language', 'tm t10', fade(0.55));
    return b;
  } },

  // Text the crew once; each phone gets it in its language; see who read it.
  'team-text': { still: 1, render() {
    let b = tx(16, 52, 'You', 'tm t10') + rr(14, 60, 122, 56, 12, 'gf') +
      tx(26, 84, 'Rain tomorrow.', 'tk tb t12') + tx(26, 102, 'Start at 9.', 'tk t12');
    const ph = [[180, 12, 'EN'], [248, 12, 'ES'], [180, 96, 'ES'], [248, 96, 'EN']];
    ph.forEach(([x, y, lang], i) => {
      const a = 0.12 + i * 0.08, s = 0.42 + i * 0.12;
      b += line(136, 88, x, y + 36, 'st dash');
      b += circ(136, 88, 4, 'gf', `${win(a - 0.08, a)}transform:translate(calc(${S(a - 0.08, a)} * ${x - 136}px), calc(${S(a - 0.08, a)} * ${y + 36 - 88}px));`);
      b += rr(x, y, 58, 72, 10, 'sf st') + tx(x + 9, y + 17, lang, 'tm t10 tb');
      b += rr(x + 8, y + 24, 42, 16, 6, 'gf', fade(a));
      b += check(x + 10, y + 56, 9, draw(s, s + 0.06)) + tx(x + 24, y + 61, 'Seen', 'tg t10', fade(s));
    });
    return b;
  } },

  // Two-way team messages: the crew speaks Spanish, the office reads English, and the reply goes back in Spanish.
  'two-way-chat': { still: 1, render() {
    let b = phone(10, 6, 130, 168) + phone(180, 6, 130, 168);
    b += tx(24, 32, 'Miguel', 'tb t11') + tx(126, 32, 'ES', 'tm t10 tb', '', 'end');
    b += tx(194, 32, 'Office', 'tb t11') + tx(296, 32, 'EN', 'tm t10 tb', '', 'end');
    // the mic, with a voice wave while he talks
    b += circ(75, 150, 13, 'gf') + path('M72 144a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM68 150a7 7 0 0 0 14 0M75 157v3', 'ks');
    let wave = '';
    for (let i = 0; i < 6; i++) {
      const x = 22 + i * 7;
      wave += rr(x, 142, 4, 16, 2, 'gf', `transform-box:fill-box;transform-origin:center;transform:scaleY(calc(.25 + .75 * (1 + sin(calc(var(--p) * 90 + ${i * 1.7}))) / 2));`);
    }
    b += g(wave, win(0.02, 0.22));
    // crew sends in Spanish
    b += g(rr(34, 42, 96, 38, 10, 'gf') + tx(44, 58, 'Necesitamos 4', 'tk tb t11') + tx(44, 73, 'hojas más.', 'tk t11'),
      fade(0.22) + from(0.22, 0.3, 0, 10));
    b += circ(130, 61, 4, 'gf', `${win(0.3, 0.4)}transform:translateX(calc(${S(0.3, 0.4)} * 60px));`);
    // office reads English
    b += g(rr(190, 42, 96, 38, 10, 'sf2 st') + tx(200, 58, 'We need 4', 'tb t11') + tx(200, 73, 'more sheets.', 't11'),
      fade(0.4) + from(0.4, 0.48, 0, 10));
    b += tx(194, 94, 'From Spanish', 'tm t10', fade(0.44));
    // office answers in English
    b += g(rr(214, 104, 82, 26, 10, 'gf') + tx(255, 121, 'On the way.', 'tk tb t11', '', 'middle'),
      fade(0.58) + from(0.58, 0.66, 0, 10));
    b += circ(214, 117, 4, 'gf', `${win(0.66, 0.76)}transform:translateX(calc(${S(0.66, 0.76)} * -96px));`);
    // crew reads Spanish
    b += g(rr(20, 92, 94, 26, 10, 'sf2 st') + tx(67, 109, 'Van en camino.', 'tb t11', '', 'middle'), fade(0.76) + from(0.76, 0.84, 0, 10));
    b += check(198, 140, 10, draw(0.86, 0.92)) + tx(214, 145, 'Got it', 'tg tb t10', fade(0.88));
    return b;
  } },

  // A buzzing alert; nobody taps Got it; a text goes out; someone answers.
  'push-alert': { still: 1, render() {
    let inner = phone(96, 6, 128, 168);
    inner += g(rr(106, 22, 108, 42, 10, 'sf2 st') + tx(116, 39, 'Leak reported', 'tb t11') + tx(116, 55, 'Miller job', 'tm t10'),
      fade(0.04) + from(0.04, 0.14, 0, -26));
    inner += circ(160, 108, 22, 'sf2') + tx(160, 112, 'Got it', 'tb t10', '', 'middle');
    inner += circ(160, 108, 27, 'gs', `stroke-dasharray:1;stroke-dashoffset:${S(0.3, 0.6)};transform-box:fill-box;transform-origin:center;transform:rotate(-90deg);${win(0.28, 0.8)}`, ' pathLength="1"');
    inner += g(circ(160, 108, 22, 'gf') + check(151, 108, 16, '', 'ks'), fade(0.82));
    inner += g(rr(106, 142, 108, 22, 8, 'gf') + tx(160, 157, 'Text sent too', 'tk tb t10', '', 'middle'), fade(0.6) + from(0.6, 0.68, 0, 10));
    return g(inner, `transform:translateX(calc(sin(calc(var(--p) * 220)) * 3px * (${S(0.12, 0.14)} - ${S(0.28, 0.3)})));`);
  } },

  // No signal: photos wait on the phone, then send themselves.
  offline: { still: 1, render() {
    let b = phone(20, 6, 128, 168);
    const bars = [0, 1, 2, 3].map((i) => rr(116 + i * 6, 30 - i * 3, 4, 6 + i * 3, 1, 'gf')).join('');
    b += g(bars, `opacity:max(1 - ${S(0.08, 0.12)}, ${S(0.58, 0.62)});`);
    b += g([0, 1, 2, 3].map((i) => rr(116 + i * 6, 30 - i * 3, 4, 6 + i * 3, 1, 'mf')).join('') + line(113, 36, 139, 18, 'gs'), win(0.1, 0.58));
    b += tx(34, 34, 'No signal', 'tm t10', win(0.12, 0.58)) + tx(34, 34, 'Back online', 'tg t10 tb', fade(0.6));
    [0, 1, 2].forEach((i) => {
      const y = 48 + i * 40, a = 0.16 + i * 0.1, f = 0.64 + i * 0.06;
      b += g(photoGlyph(34, y, 46, 30) + rr(86, y + 6, 40, 6, 3, 'mf') +
        circ(128, y + 22, 6, 'st') + path(`M128 ${y + 18}v4h3`, 'ln'),
        `opacity:min(${S(a, a + 0.06)}, 1 - ${S(f + 0.08, f + 0.12)});transform:translate(calc(${S(f, f + 0.12)} * 190px), calc(${S(f, f + 0.12)} * ${40 - y}px));`);
    });
    b += path('M236 74a14 14 0 0 1 27-6 11 11 0 1 1 5 21h-34a10 10 0 0 1 2-15z', 'gs');
    b += check(246, 78, 12, draw(0.86, 0.94));
    b += tx(256, 112, '3 photos sent', 'tg tb t10', fade(0.88), 'middle');
    return b;
  } },

  // Stage buttons light in turn; each one adds a photo; Problem alerts the office.
  'photo-stages': { still: 1, render() {
    const st = ['Before', 'Tear-off', 'Progress', 'Done', 'Problem'];
    let b = rr(60, 46, 200, 96, 10, 'sf') + path('M70 130l50-50 40 30 30-20 60 40', 'ln');
    st.forEach((s, i) => {
      const x = 8 + i * 61, a = 0.04 + i * 0.17;
      b += rr(x, 12, 57, 24, 8, 'sf2') + tx(x + 28.5, 28, s, 't10', '', 'middle');
      b += g(rr(x, 12, 57, 24, 8, 'gf') + tx(x + 28.5, 28, s, 'tk tb t10', '', 'middle'), win(a, a + 0.15));
      b += rr(60, 46, 200, 96, 10, 'cf', `opacity:calc(min(${S(a + 0.03, a + 0.04)}, 1 - ${S(a + 0.05, a + 0.09)}) * .55);`);
      b += g(photoGlyph(60 + i * 42, 150, 36, 24) + (i === 4 ? rr(60 + i * 42, 150, 36, 24, 4, 'gs') : ''), fade(a + 0.06));
    });
    b += g(icon('chat', 274, 108, 1, 'ic') + tx(286, 144, 'Office', 'tg t10', '', 'middle'), fade(0.8) + from(0.8, 0.86, 0, 8));
    return b;
  } },

  // A decking photo becomes a change order the homeowner signs.
  decking: { still: 1, render() {
    let b = '';
    for (let i = 0; i < 6; i++) b += rr(18, 24 + i * 22, 136, 18, 2, 'sf2');
    b += path('M70 66c10-8 30-6 38 4s4 26-8 32-30 4-36-6-4-24 6-30z', 'rot');
    b += g(path('M22 28h18M22 28v18M150 28h-18M150 28v18M22 152h18M22 152v-18M150 152h-18M150 152v-18', 'gs'),
      `transform-origin:86px 90px;transform:scale(calc(1.18 - .18 * ${S(0.04, 0.2)}));`);
    b += rr(18, 24, 136, 130, 4, 'cf', `opacity:calc(min(${S(0.2, 0.21)}, 1 - ${S(0.22, 0.28)}) * .6);`);
    b += g(rr(176, 22, 128, 140, 8, 'paper') + tx(190, 46, 'Change order', 'tk tb t12') +
      tx(190, 72, '+ 4 sheets of decking', 'tk t10', fade(0.44)) + tx(190, 90, 'Before the work', 'ts t10', fade(0.5)) +
      line(190, 140, 290, 140, 'inkl') +
      path('M196 136c6-12 12 4 18-3s10-10 14 0 10 4 16-4 8 6 20 0', 'ink', draw(0.6, 0.82), ' pathLength="1"') +
      tx(290, 154, 'Signed', 'tgi tb t10', fade(0.84), 'end'),
      fade(0.3) + from(0.3, 0.42, 22, 0));
    return b;
  } },

  // The balance runs down; PAID lands; the receipt goes out.
  paid: { still: 1, render() {
    let b = rr(80, 10, 160, 162, 8, 'paper') + tx(96, 36, 'Invoice', 'tk tb t13');
    [60, 92, 76].forEach((w, i) => { b += rr(96, 50 + i * 14, w, 6, 3, 'pl'); });
    b += tx(96, 112, 'Balance due', 'ts t10');
    b += rr(96, 118, 128, 10, 5, 'pl');
    b += rr(96, 118, 128, 10, 5, 'gf', `transform-box:fill-box;transform-origin:0 50%;transform:scaleX(calc(1 - ${S(0.14, 0.5)}));`);
    b += tx(224, 112, '$0.00', 'tk tb t11', fade(0.5), 'end');
    b += g(rr(-52, -19, 104, 38, 6, 'stamp') + tx(0, 10, 'PAID', 'tgi tb t24', '', 'middle'),
      `opacity:${S(0.55, 0.6)};transform:translate(164px, 74px) rotate(-12deg) scale(calc(1.8 - .8 * ${S(0.55, 0.62)}));`);
    b += g(icon('mail', 96, 140, 0.7, 'ici') + tx(116, 154, 'Receipt emailed', 'ts t10'), fade(0.74));
    return b;
  } },

  // Contract against costs; what is left over; only the owner sees it.
  margin: { still: 1, render() {
    let b = tx(20, 28, 'Miller roof', 'tb t13');
    b += tx(20, 54, 'Contract', 'tm t10') + rr(20, 60, 280, 18, 5, 'gd');
    b += tx(20, 100, 'Costs', 'tm t10');
    const segs = [[20, 104, 'c1', 'Materials'], [124, 56, 'c2', 'Labor'], [180, 18, 'c3', ''], [198, 10, 'c4', '']];
    segs.forEach(([x, w, c], i) => {
      const a = 0.08 + i * 0.12;
      b += rr(x, 106, w, 18, 3, c, `transform-box:fill-box;transform-origin:0 50%;transform:scaleX(${S(a, a + 0.1)});`);
    });
    b += tx(24, 138, 'Materials, labor, dumpster, permit', 'tm t10', fade(0.5));
    b += rr(208, 106, 92, 18, 5, 'gf', fade(0.6));
    b += tx(300, 98, 'Left over 31%', 'tg tb t12', fade(0.64), 'end');
    b += g(rr(196, 146, 104, 26, 8, 'sf2 st') + icon('lock', 204, 150, 0.75) + tx(226, 163, 'Owner only', 't10'), fade(0.8));
    return b;
  } },

  // Snap a paper receipt; store, total and job fill in.
  receipt: { still: 1, render() {
    let zz = 'M24 18h104v128';
    for (let i = 0; i < 6; i++) zz += 'l-8.67 7l-8.67 -7';
    zz += 'Z';
    let b = path(zz, 'paper');
    [70, 50, 80, 60, 40].forEach((w, i) => { b += rr(36, 32 + i * 18, w, 6, 3, 'pl'); });
    b += rr(36, 124, 80, 8, 3, 'pk');
    b += g(path('M16 12h16M16 12v16M136 12h-16M136 12v16M16 160h16M16 160v-16M136 160h-16M136 160v-16', 'gs'),
      `transform-origin:76px 86px;transform:scale(calc(1.15 - .15 * ${S(0.04, 0.18)}));`);
    b += path(zz, 'flash', `opacity:calc(min(${S(0.2, 0.21)}, 1 - ${S(0.22, 0.28)}) * .7);`);
    [['Store', 'Supply Co.'], ['Total', '$184.20'], ['Job', 'Miller roof']].forEach(([k, v], i) => {
      const y = 36 + i * 46, a = 0.34 + i * 0.15;
      b += tx(156, y, k, 'tm t10') + tx(156, y + 20, v, 'tb t13', fade(a));
      b += path(`M156 ${y + 28}H304`, 'gs', draw(a - 0.04, a + 0.06), ' pathLength="1"');
    });
    return b;
  } },

  // The homeowner's private link fills in as the job moves.
  'customer-link': { still: 1, render() {
    let b = phone(96, 4, 128, 172) + tx(160, 32, 'Your new roof', 'tb t12', '', 'middle');
    const xs = [114, 160, 206];
    b += line(114, 52, 206, 52, 'st');
    b += path('M114 52H206', 'gs', draw(0.1, 0.52), ' pathLength="1"');
    ['Booked', 'Started', 'Done'].forEach((s, i) => {
      b += circ(xs[i], 52, 7, 'sf2 st') + circ(xs[i], 52, 7, 'gf', fade(0.08 + i * 0.22));
      b += tx(xs[i], 74, s, 'tm t10', '', 'middle');
    });
    [[108, 86], [164, 86], [108, 126], [164, 126]].forEach(([x, y], i) => {
      b += g(photoGlyph(x, y, 48, 34), `transform-box:fill-box;transform-origin:center;${pop(0.6 + i * 0.07)}`);
    });
    return b;
  } },

  // Good reviews post; a low one becomes a call to make it right.
  'review-guard': { still: 1, render() {
    const star = (x, y, cls, style = '') =>
      path(`M${x} ${y - 9}l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z`, cls, style);
    let b = '';
    for (let i = 0; i < 5; i++) {
      b += star(28 + i * 22, 44, 'mf') + star(28 + i * 22, 44, 'gf', fade(0.04 + i * 0.04));
      b += star(28 + i * 22, 126, 'mf') + (i < 2 ? star(28 + i * 22, 126, 'gf', fade(0.44 + i * 0.04)) : '');
    }
    b += path('M140 44H192', 'gs', draw(0.26, 0.34), ' pathLength="1"');
    b += g(rr(198, 28, 106, 30, 8, 'sf2 st') + icon('chat', 206, 31, 1) + tx(236, 48, 'Thank them', 'tb t11'), fade(0.34));
    b += line(16, 86, 304, 86, 'st');
    b += path('M140 126H192', 'gs', draw(0.54, 0.62), ' pathLength="1"');
    b += g(rr(198, 110, 106, 32, 8, 'gf') + tx(251, 130, 'Call them today', 'tk tb t10', '', 'middle'),
      `transform-box:fill-box;transform-origin:center;${pop(0.62)}`);
    b += tx(18, 164, '3 stars or less: someone calls', 'tm t10', fade(0.5));
    return b;
  } },

  // A plow route: the truck reaches each lot; check, photo, salt.
  'snow-route': { still: 1, render() {
    const P = [[40, 124], [122, 46], [204, 114], [278, 44]];
    let b = rr(8, 8, 304, 164, 12, 'map');
    b += path('M8 90H312M160 8V172M8 40L312 150', 'road');
    b += path(`M${P.map((p) => p.join(' ')).join('L')}`, 'route', draw(0.02, 0.92), ' pathLength="1"');
    const at = [0.04, 0.32, 0.62, 0.92];
    P.forEach(([x, y], i) => {
      b += rr(x - 12, y - 12, 24, 24, 5, 'lot');
      b += g(rr(x - 12, y - 12, 24, 24, 5, 'gd') + check(x - 6, y, 12, ''), fade(at[i]));
      b += circ(x, y, 18, 'cf', `opacity:calc(min(${S(at[i], at[i] + 0.01)}, 1 - ${S(at[i] + 0.02, at[i] + 0.06)}) * .45);`);
    });
    const seg = [[0.05, 0.3], [0.35, 0.6], [0.65, 0.9]];
    const dx = seg.map(([a, z], i) => `${P[i + 1][0] - P[i][0]}px * ${S(a, z)}`).join(' + ');
    const dy = seg.map(([a, z], i) => `${P[i + 1][1] - P[i][1]}px * ${S(a, z)}`).join(' + ');
    b += g(circ(40, 124, 8, 'gf') + circ(40, 124, 3, 'kf'), `transform:translate(calc(${dx}), calc(${dy}));`);
    for (let i = 0; i < 14; i++) {
      const x = 14 + ((i * 53) % 292), o = ((i * 37) % 100) / 100;
      b += circ(x, 0, 1.6, 'flake', `transform:translateY(calc(mod(var(--p) * 2 + ${o}, 1) * 176px));`);
    }
    b += g(rr(214, 144, 92, 22, 8, 'gf') + tx(260, 159, '4 lots done', 'tk tb t10', '', 'middle'), fade(0.94));
    return b;
  } },

  // 7:30 am: the sun comes up, the list arrives, items get sent.
  'morning-list': { still: 1, render() {
    let b = g(circ(76, 78, 18, 'gf'), `opacity:${S(0, 0.16)};transform:translateY(calc((1 - ${S(0, 0.24)}) * 30px));`);
    b += rr(10, 78, 140, 40, 0, 'bg') + line(16, 78, 140, 78, 'st');
    b += tx(76, 108, '7:30 am', 'tb t16', fade(0.2), 'middle');
    b += g(icon('mail', 64, 120, 1), fade(0.28) + from(0.28, 0.38, 0, -14));
    b += rr(160, 12, 146, 156, 12, 'sf st') + tx(174, 34, 'To send today', 'tb t11');
    ['Start reminder', 'Photo update', 'Payment due', 'Thank-you'].forEach((s, i) => {
      const y = 60 + i * 28, a = 0.44 + i * 0.11;
      b += rr(174, y - 11, 15, 15, 4, 'st') + check(177, y - 3, 10, draw(a, a + 0.06)) + tx(198, y, s, 't10');
    });
    return b;
  } },

  // A draft waits; a person taps Send; it is delivered.
  'draft-send': { still: 1, render() {
    let b = rr(36, 12, 248, 156, 14, 'sf st') + tx(52, 36, 'Miller job', 'tb t12') + tx(52, 54, 'Draft, from Sam', 'tm t10');
    b += rr(52, 64, 216, 54, 12, 'dashb');
    b += tx(66, 87, 'Crew arrives Tuesday at 8.', 't11') + tx(66, 105, 'Questions? Just reply.', 't11');
    b += g(rr(52, 64, 216, 54, 12, 'gf') + tx(66, 87, 'Crew arrives Tuesday at 8.', 'tk t11') + tx(66, 105, 'Questions? Just reply.', 'tk t11'), fade(0.5));
    b += rr(200, 128, 68, 28, 8, 'sf2') + tx(234, 146, 'Send', 'tb t11', '', 'middle');
    b += g(rr(200, 128, 68, 28, 8, 'gf') + tx(234, 146, 'Sent', 'tk tb t11', '', 'middle'), fade(0.47));
    b += g(circ(234, 142, 7, 'finger'), win(0.22, 0.56) + from(0.22, 0.44, -60, 30));
    b += g(check(54, 142, 10, '') + tx(70, 146, 'Delivered', 'tg tb t10'), fade(0.68));
    return b;
  } },

  // The ? opens a short clip of exactly that screen.
  'help-clip': { still: 0.7, render() {
    let b = rr(20, 12, 280, 156, 14, 'sf st');
    [0, 1, 2, 3].forEach((i) => { b += rr(36, 36 + i * 28, 150 - i * 20, 10, 4, 'mf'); });
    b += circ(276, 36, 18, 'gs', `transform-box:fill-box;transform-origin:center;opacity:calc((1 - mod(var(--p) * 5, 1)) * (1 - ${S(0.2, 0.24)}));transform:scale(calc(1 + mod(var(--p) * 5, 1) * .5));`);
    b += circ(276, 36, 12, 'gf') + tx(276, 41, '?', 'tk tb t13', '', 'middle');
    b += g(circ(276, 36, 7, 'finger'), win(0.1, 0.28) + from(0.1, 0.2, -30, 40));
    b += g(rr(56, 40, 208, 116, 10, 'vid') + path('M150 72l20 12-20 12z', 'gf') +
      tx(160, 124, 'Tap Move it for rain', 't10', '', 'middle') +
      rr(76, 136, 168, 4, 2, 'mf') + rr(76, 136, 168, 4, 2, 'gf', `transform-box:fill-box;transform-origin:0 50%;transform:scaleX(${S(0.4, 0.95)});`),
      `transform-origin:276px 36px;opacity:${S(0.25, 0.3)};transform:scale(calc(.1 + .9 * ${S(0.25, 0.36)}));`);
    return b;
  } },

  // The heartbeat drops; it rewinds itself; it is fine before anyone wakes.
  watchdog: { still: 1, render() {
    const id = `fo-clip-${++uid}`;
    let ecg = 'M0 86';
    for (let i = 0; i < 8; i++) ecg += 'h30l6-22l6 36l6-24l4 10h28';
    let b = `<defs><clipPath id="${id}"><rect x="16" y="34" width="288" height="96"/></clipPath></defs>`;
    b += tx(16, 24, 'Checked every 5 minutes', 'tm t10');
    b += rr(16, 34, 288, 96, 10, 'sf');
    b += `<g clip-path="url(#${id})">` +
      g(path(ecg, 'ecg'), `opacity:max(1 - ${S(0.36, 0.4)}, ${S(0.7, 0.74)});transform:translateX(calc(var(--p) * -240px));`) +
      path('M16 86H304', 'flat', win(0.38, 0.7)) + '</g>';
    b += g(path('M148 74a12 12 0 1 1-2 10M148 74v8h8', 'gs'),
      `transform-origin:160px 82px;transform:rotate(calc(${S(0.46, 0.68)} * -720deg));${win(0.44, 0.68)}`);
    b += tx(16, 156, 'Problem found 2:13 am', 'tm t11', win(0.4, 0.68));
    b += tx(16, 156, 'Fixed itself 2:14 am', 'tg tb t11', fade(0.72));
    b += tx(304, 156, 'Studio told', 'tm t10', fade(0.8), 'end');
    return b;
  } },

  // Scan the code on the iPad; apply for monthly payments.
  financing: { still: 1, render() {
    let b = rr(14, 14, 172, 152, 14, 'sf st');
    const N = 7, sz = 12, ox = 58, oy = 34;
    let m = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const finder = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      const on = finder || ((r * 31 + c * 17 + r * c * 7) % 5 < 2);
      if (on) m += rr(ox + c * sz, oy + r * sz, sz - 2, sz - 2, 2, 'cf', fade(0.04 + ((r + c) % 4) * 0.05));
    }
    b += m + tx(100, 134, 'Pay monthly', 'tm t10', '', 'middle');
    b += rr(54, 36, 92, 3, 1.5, 'gf', `${win(0.48, 0.7)}transform:translateY(calc(${S(0.5, 0.68)} * 80px));`);
    b += g(phone(206, 30, 96, 144) + tx(220, 70, 'Payments', 'tb t11') +
      rr(220, 82, 64, 6, 3, 'mf') + rr(220, 96, 50, 6, 3, 'mf') +
      check(222, 136, 12, draw(0.72, 0.8)) + tx(240, 140, 'Applied', 'tg tb t10', fade(0.74)),
      from(0.32, 0.48, 50, 0) + fade(0.32));
    return b;
  } },
};

SCENES['two-options'] = SCENES.options; // older manifests

// Anything without its own scene gets its icon on a quiet pulse.
export function fallbackScene(iconName) {
  let b = '';
  for (let i = 0; i < 2; i++) {
    b += circ(160, 90, 54, 'st', `transform-box:fill-box;transform-origin:center;opacity:calc(1 - mod(var(--p) * 2 + ${i * 0.5}, 1));transform:scale(calc(.8 + mod(var(--p) * 2 + ${i * 0.5}, 1) * .6));`);
  }
  b += rr(116, 46, 88, 88, 24, 'gd st') + icon(iconName, 130, 60, 2.5, 'ic big');
  return svg(b);
}

export function sceneFor(anim, iconName) {
  const s = SCENES[anim];
  if (!s) return { svg: fallbackScene(iconName), still: 0.25 };
  return { svg: svg(s.render(), anim), still: s.still };
}

export const sceneNames = Object.keys(SCENES);
