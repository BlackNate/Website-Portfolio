// ───────────────────────────────────────────────────────────────────────────
//  Engine: palette, easing, paper texture, paint blobs, type, icons, Maya.
//  Everything is procedural & deterministic: frame(t) always draws the same.
// ───────────────────────────────────────────────────────────────────────────
const W = 1920, H = 1080;

const C = {
  paper: '#F4F1E8', navy: '#1C2459', ink: '#1C2459', navy2: '#2E3A86',
  yellow: '#FFD45C', sun: '#FBD780', orange: '#FF9A3D', peach: '#FFC59A',
  purple: '#9C7CF4', lilac: '#D8B6F7', pink: '#EF7896', rose: '#F7B1C3',
  cyan: '#5FCDEF', sky: '#C3EBF8', green: '#62CF95', mint: '#C3EFD6',
  red: '#EE4A55', white: '#FFFFFF', cream: '#FFF9EC', grey: '#9097B3', fog: '#E4E1D6',
  skin: '#B5764F', skinS: '#9C6140', hair: '#2A1B33', gold: '#F5B83D',
};

// ── math ───────────────────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, t0, d = 1) => clamp((t - t0) / d);
const E = {
  lin: t => t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  in: t => t * t * t,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 9 - .75) * (2 * Math.PI) / 3) + 1,
  sine: t => .5 - Math.cos(Math.PI * t) / 2,
};
function rng(seed) { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const TAU = Math.PI * 2;

// ── sound-effect event log (collected while rendering, mixed in audio.py) ──
const SFX = { offset: 0, events: new Map(), add(kind, t) { const at = +(this.offset + t).toFixed(3); this.events.set(kind + '@' + at, { kind, t: at }); } };

// ── paper background ───────────────────────────────────────────────────────
let PAPER = null;
function makePaper() {
  const sw = W / 2, sh = H / 2;
  const c = document.createElement('canvas'); c.width = sw; c.height = sh;
  const g = c.getContext('2d'); const img = g.createImageData(sw, sh); const d = img.data;
  const r = rng(7); const pts = [];
  for (let i = 0; i < 46; i++) pts.push({ x: r() * sw, y: r() * sh, s: (r() - .5) });
  const base = [244, 241, 232];
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    let b1 = 1e9, b2 = 1e9, bi = 0;
    for (let i = 0; i < pts.length; i++) { const dx = x - pts[i].x, dy = y - pts[i].y; const dd = dx * dx + dy * dy; if (dd < b1) { b2 = b1; b1 = dd; bi = i; } else if (dd < b2) b2 = dd; }
    const edge = Math.sqrt(b2) - Math.sqrt(b1); // distance to crease
    let v = pts[bi].s * 6 + (edge < 2.2 ? (2.2 - edge) * -2.4 : 0) + (r() - .5) * 7;
    v += Math.sin(x * .013 + y * .007) * 1.5;
    const k = (y * sw + x) * 4;
    d[k] = base[0] + v; d[k + 1] = base[1] + v; d[k + 2] = base[2] + v * .9; d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const full = document.createElement('canvas'); full.width = W; full.height = H;
  const f = full.getContext('2d'); f.imageSmoothingQuality = 'high'; f.drawImage(c, 0, 0, W, H);
  // vignette
  const vg = f.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,50,30,0.13)');
  f.fillStyle = vg; f.fillRect(0, 0, W, H);
  PAPER = full;
}
let GRAIN = null;
function makeGrain() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  const img = g.createImageData(256, 256); const r = rng(3);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 26; }
  g.putImageData(img, 0, 0); GRAIN = c;
}

// ── basic paths ────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); }
function ink(ctx, lw = 5, col = C.navy) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
function fs(ctx, fill, lw = 5) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ink(ctx, lw); ctx.stroke(); } }
function poly(ctx, pts, close = true) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
function line(ctx, x1, y1, x2, y2, lw = 5, col = C.navy) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ink(ctx, lw, col); ctx.stroke(); }

// smooth closed curve through points
function smoothClosed(ctx, pts) {
  ctx.beginPath(); const n = pts.length;
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let s = m(pts[n - 1], pts[0]); ctx.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); ctx.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
  ctx.closePath();
}

// ── paint blob (pastel, organic, like the reference) ──────────────────────
function blob(ctx, x, y, r, color, { seed = 1, p = 1, t = 0, wob = .13, n = 11, alpha = 1 } = {}) {
  if (p <= 0) return; const R = rng(seed); const base = []; for (let i = 0; i < n; i++) base.push(1 + (R() - .5) * 2 * wob);
  const rad = r * E.back(clamp(p));
  const make = (k, j) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + seed; const rr2 = rad * base[i] * (1 + Math.sin(t * .9 + i * 1.7 + seed) * .025) * k; pts.push([x + Math.cos(a) * rr2 + j, y + Math.sin(a) * rr2 * .96]); } return pts; };
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.globalAlpha *= .45; smoothClosed(ctx, make(1.035, 3)); ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha /= .45;
  smoothClosed(ctx, make(1, 0)); ctx.fillStyle = color; ctx.fill();
  // dry-brush texture inside
  ctx.save(); ctx.clip(); ctx.globalAlpha *= .5; ctx.globalCompositeOperation = 'multiply';
  if (GRAIN) { const pat = ctx.createPattern(GRAIN, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(x - rad * 1.2, y - rad * 1.2, rad * 2.4, rad * 2.4); }
  ctx.restore(); ctx.restore();
}

// brush stroke (drawn on), pts in absolute coords
function brush(ctx, pts, color, width, p = 1, { alpha = 1 } = {}) {
  if (p <= 0) return; const total = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); total.push(d); L += d; }
  let want = L * clamp(p); ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && want > 0; i++) { const d = total[i - 1]; const f = Math.min(1, want / d); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); want -= d; }
  ink(ctx, width, color); ctx.stroke(); ctx.globalAlpha *= .35; ctx.lineWidth = width * .55; ctx.strokeStyle = '#ffffff'; ctx.translate(width * .12, -width * .12); ctx.stroke(); ctx.restore();
}
function curvePts(fn, n = 40) { const a = []; for (let i = 0; i <= n; i++) a.push(fn(i / n)); return a; }

// ── animation wrapper: pop in (spring), float, optional exit ─────────────────
// item(ctx, t, t0, x, y, opts, drawFn)
function item(ctx, t, t0, x, y, o, fn) {
  o = o || {}; const d = o.d || .62; const p = prog(t, t0, d); if (p <= 0) return false;
  if (o.sfx !== false && t - t0 < 1.2 && t >= t0) SFX.add(o.sfxKind || 'pop', t0);
  let s = o.ease === 'out' ? E.out(p) : E.back(p); let a = clamp(p * 4);
  let dx = 0, dy = 0;
  if (o.from) { dx = (1 - E.out5(p)) * o.from[0]; dy = (1 - E.out5(p)) * o.from[1]; s = o.ease === 'back' ? E.back(p) : 1; }
  if (o.t1 != null) { const q = prog(t, o.t1, o.d1 || .45); if (q >= 1) return false; if (o.out === 'fade') a *= 1 - q; else if (o.out === 'drop') { dy += E.in(q) * 900; } else s *= 1 - E.in(q) * (o.out === 'shrinkHalf' ? .5 : 1); }
  const fl = o.float ? Math.sin((t + (o.seed || 0) * 1.7) * (o.fs || 1.5)) * o.float : 0;
  const rot = (o.rot || 0) + (o.wig ? Math.sin((t + (o.seed || 0)) * 1.3) * o.wig : 0) + (1 - E.out(p)) * (o.spin != null ? o.spin : -.25);
  ctx.save(); ctx.translate(x + dx, y + dy + fl); ctx.rotate(rot); const sc = s * (o.s || 1); ctx.scale(sc, sc); ctx.globalAlpha *= a * (o.alpha != null ? o.alpha : 1);
  fn(p); ctx.restore(); return true;
}
// soft fade helper
function fade(ctx, t, t0, t1, fn, d = .4) { let a = prog(t, t0, d); if (t1 != null) a *= 1 - prog(t, t1, d); if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; fn(a); ctx.restore(); }
function shadow(ctx, blur = 24, oy = 12, a = .16) { ctx.shadowColor = `rgba(28,36,89,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = oy; }
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

// ── type ───────────────────────────────────────────────────────────────────
const FONT = { serif: '"DM Serif Display", Georgia, serif', sans: 'Poppins, Inter, sans-serif', hand: 'Caveat, cursive', ui: 'Inter, sans-serif' };
function setFont(ctx, size, font = 'sans', weight = 800) { if (font === 'serif') ctx.font = `${size}px ${FONT.serif}`; else if (font === 'hand') ctx.font = `700 ${size}px ${FONT.hand}`; else ctx.font = `${weight} ${size}px ${FONT[font] || FONT.sans}`; }
function txt(ctx, s, x, y, o = {}) {
  const { size = 56, font = 'sans', weight = 800, color = C.navy, align = 'center', base = 'middle', ls = 0 } = o;
  setFont(ctx, size, font, weight); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if (ls) { try { ctx.letterSpacing = ls + 'px'; } catch (e) { } }
  ctx.fillText(s, x, y); if (ls) { try { ctx.letterSpacing = '0px'; } catch (e) { } }
}
function tw(ctx, s, size, font = 'sans', weight = 800) { setFont(ctx, size, font, weight); return ctx.measureText(s).width; }
function wrap(ctx, s, maxW, size, font = 'sans', weight = 800) {
  setFont(ctx, size, font, weight); const words = s.split(' '); const out = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test; }
  if (cur) out.push(cur); return out;
}
// word-by-word rise reveal; returns width
function words(ctx, t, t0, s, x, y, o = {}) {
  const { size = 64, font = 'serif', weight = 800, color = C.navy, align = 'center', stagger = .06, d = .5 } = o;
  setFont(ctx, size, font, weight); const ws = s.split(' '); const sp = ctx.measureText(' ').width;
  const widths = ws.map(w => ctx.measureText(w).width); const total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ws.forEach((w, i) => { const p = prog(t, t0 + i * stagger, d); if (p > 0) { ctx.save(); ctx.globalAlpha *= clamp(p * 2); txt(ctx, w, cx, y + (1 - E.out5(p)) * size * .6, { size, font, weight, color, align: 'left' }); ctx.restore(); } cx += widths[i] + sp; });
  return total;
}
// multi-line word reveal
function para(ctx, t, t0, s, x, y, o = {}) {
  const { size = 64, font = 'serif', weight = 800, maxW = 1400, lh = 1.15, align = 'center', stagger = .05 } = o;
  const lines = wrap(ctx, s, maxW, size, font, weight); let k = 0;
  lines.forEach((l, i) => { words(ctx, t, t0 + k * stagger, l, x, y + (i - (lines.length - 1) / 2) * size * lh, { ...o, align }); k += l.split(' ').length; });
  return lines.length;
}
// highlighter swipe behind a region
function marker(ctx, t, t0, x, y, w, h, color = C.yellow, d = .5) {
  const p = E.inOut(prog(t, t0, d)); if (p <= 0) return; ctx.save(); ctx.globalAlpha *= .9; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x, y + h * .1); ctx.lineTo(x + w * p, y); ctx.lineTo(x + w * p + 6, y + h); ctx.lineTo(x - 4, y + h * .95); ctx.closePath(); ctx.fill(); ctx.restore();
}
// highlighted headline: text with marker swipe behind
function hiText(ctx, t, t0, s, x, y, o = {}) {
  const { size = 72, font = 'sans', color = C.navy, hl = C.yellow, align = 'center' } = o;
  const w = tw(ctx, s, size, font, o.weight || 800); const x0 = align === 'center' ? x - w / 2 : x;
  marker(ctx, t, t0 + .15, x0 - 18, y - size * .45, w + 36, size * .95, hl);
  fade(ctx, t, t0, null, () => txt(ctx, s, x0, y + 2, { ...o, align: 'left' }), .3);
}
// pill tag
function tag(ctx, s, x, y, o = {}) {
  const { size = 30, bg = C.white, fg = C.navy, pad = 22, stroke = 4, font = 'sans', weight = 700, h } = o;
  const w = tw(ctx, s, size, font, weight) + pad * 2; const hh = h || size * 1.75;
  rr(ctx, x - w / 2, y - hh / 2, w, hh, hh / 2); fs(ctx, bg, stroke); txt(ctx, s, x, y + 2, { size, font, weight, color: fg }); return w;
}
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.white, r = 26, sh = true, stroke = 5 } = o;
  ctx.save(); if (sh) shadow(ctx, 30, 14, .14); rr(ctx, x - w / 2, y - h / 2, w, h, r); ctx.fillStyle = fill; ctx.fill(); noShadow(ctx); if (stroke) { ink(ctx, stroke); ctx.stroke(); } ctx.restore();
}

// ── ICONS (centered, ~100px box, navy outline) ─────────────────────────────
const I = {};
I.coin = (ctx, o = {}) => { const c = o.c || C.yellow; circ(ctx, 0, 0, 48); fs(ctx, c); circ(ctx, 0, 0, 34); ink(ctx, 4); ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 41, -2.4, -1.2); ink(ctx, 6, '#fff'); ctx.globalAlpha = .7; ctx.stroke(); ctx.restore(); txt(ctx, o.label || 'U', 0, 3, { size: 38, color: C.navy }); };
I.coinStack = (ctx) => { for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(0, 30 - i * 16); ctx.beginPath(); ctx.ellipse(0, 0, 46, 16, 0, 0, TAU); fs(ctx, i % 2 ? C.gold : C.yellow); ctx.restore(); } };
I.bill = (ctx, o = {}) => { rr(ctx, -55, -32, 110, 64, 10); fs(ctx, o.c || C.green); circ(ctx, 0, 0, 16); fs(ctx, C.mint, 4); rr(ctx, -45, -22, 90, 44, 6); ink(ctx, 3); ctx.stroke(); };
I.phone = (ctx, o = {}) => { rr(ctx, -42, -78, 84, 156, 16); fs(ctx, '#3A3A44'); rr(ctx, -34, -66, 68, 130, 8); ctx.fillStyle = o.screen || '#4a4a56'; ctx.fill(); circ(ctx, 0, -71, 3); ctx.fillStyle = '#888'; ctx.fill(); };
I.laptop = (ctx, o = {}) => { rr(ctx, -120, -90, 240, 160, 14); fs(ctx, '#3A3A44'); rr(ctx, -106, -77, 212, 134, 6); ctx.fillStyle = o.screen || C.cream; ctx.fill(); poly(ctx, [[-150, 70], [150, 70], [135, 92], [-135, 92]]); fs(ctx, C.grey); };
I.house = (ctx, o = {}) => { poly(ctx, [[-50, -5], [0, -50], [50, -5], [50, 48], [-50, 48]]); fs(ctx, o.c || C.peach); poly(ctx, [[-62, 0], [0, -58], [62, 0]], false); ink(ctx, 7); ctx.stroke(); rr(ctx, -14, 12, 28, 36, 4); fs(ctx, o.door || C.pink, 4); rr(ctx, 22, 2, 18, 18, 3); fs(ctx, C.sky, 4); rr(ctx, -40, 2, 18, 18, 3); fs(ctx, C.sky, 4); };
I.cart = (ctx) => { poly(ctx, [[-50, -30], [-36, -30], [-24, 20], [40, 20], [50, -16], [-30, -16]], false); ink(ctx, 6); ctx.stroke(); circ(ctx, -16, 36, 9); fs(ctx, C.white); circ(ctx, 32, 36, 9); fs(ctx, C.white); circ(ctx, 0, -32, 13); fs(ctx, C.green, 4); circ(ctx, 22, -28, 11); fs(ctx, C.orange, 4); };
I.bus = (ctx) => { rr(ctx, -55, -45, 110, 80, 14); fs(ctx, C.yellow); rr(ctx, -44, -34, 40, 28, 4); fs(ctx, C.sky, 4); rr(ctx, 4, -34, 40, 28, 4); fs(ctx, C.sky, 4); circ(ctx, -30, 38, 10); fs(ctx, C.navy); circ(ctx, 30, 38, 10); fs(ctx, C.navy); };
I.bolt = (ctx) => { poly(ctx, [[8, -55], [-34, 6], [-4, 6], [-12, 55], [34, -10], [4, -10]]); fs(ctx, C.yellow); };
I.jar = (ctx, o = {}) => { rr(ctx, -42, -40, 84, 92, 20); fs(ctx, 'rgba(195,235,248,.85)'); rr(ctx, -34, -58, 68, 20, 6); fs(ctx, C.purple); const f = o.fill != null ? o.fill : .4; ctx.save(); rr(ctx, -42, -40, 84, 92, 20); ctx.clip(); for (let i = 0; i < 6 * f; i++) { ctx.beginPath(); ctx.ellipse((i % 2) * 10 - 5, 40 - i * 13, 26, 9, 0, 0, TAU); fs(ctx, C.yellow, 3); } ctx.restore(); rr(ctx, -42, -40, 84, 92, 20); ink(ctx, 5); ctx.stroke(); };
I.vault = (ctx) => { rr(ctx, -62, -58, 124, 116, 16); fs(ctx, C.sky); rr(ctx, -48, -44, 96, 88, 10); fs(ctx, C.white, 4); circ(ctx, 0, 0, 26); fs(ctx, C.cyan, 5); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4; line(ctx, Math.cos(a) * 10, Math.sin(a) * 10, Math.cos(a) * 34, Math.sin(a) * 34, 5); } circ(ctx, 0, 0, 8); fs(ctx, C.navy, 0); rr(ctx, -50, 58, 18, 10, 3); fs(ctx, C.navy, 0); rr(ctx, 32, 58, 18, 10, 3); fs(ctx, C.navy, 0); };
I.shield = (ctx, o = {}) => { ctx.beginPath(); ctx.moveTo(0, -55); ctx.quadraticCurveTo(30, -42, 48, -42); ctx.quadraticCurveTo(52, 30, 0, 58); ctx.quadraticCurveTo(-52, 30, -48, -42); ctx.quadraticCurveTo(-30, -42, 0, -55); fs(ctx, o.c || C.green); poly(ctx, [[-18, 2], [-4, 16], [22, -14]], false); ink(ctx, 7, '#fff'); ctx.stroke(); };
I.gear = (ctx, o = {}) => { const n = 9, r1 = 40, r2 = 52; ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + (o.rot || 0); const r = i % 2 ? r1 : r2; const a2 = a + TAU / (n * 2); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r); } ctx.closePath(); fs(ctx, o.c || C.lilac); circ(ctx, 0, 0, 16); fs(ctx, C.white); };
I.office = (ctx, o = {}) => { rr(ctx, -70, -90, 140, 180, 6); fs(ctx, o.c || C.sky); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { rr(ctx, -52 + c * 38, -70 + r * 34, 28, 22, 3); fs(ctx, (r + c) % 3 ? C.white : C.yellow, 3); } rr(ctx, -18, 58, 36, 32, 3); fs(ctx, C.navy2, 3); };
I.capitol = (ctx, o = {}) => { poly(ctx, [[-100, -10], [0, -60], [100, -10]]); fs(ctx, o.roof || C.lilac); circ(ctx, 0, -64, 0); rr(ctx, -95, -12, 190, 16, 3); fs(ctx, C.white, 4); for (let i = 0; i < 6; i++) { rr(ctx, -82 + i * 31, 6, 16, 70, 3); fs(ctx, C.white, 4); } rr(ctx, -105, 76, 210, 18, 3); fs(ctx, C.white, 4); ctx.beginPath(); ctx.arc(0, -60, 28, Math.PI, 0); fs(ctx, C.sky); line(ctx, 0, -88, 0, -128, 4); poly(ctx, [[0, -128], [34, -120], [0, -110]]); fs(ctx, C.pink, 3); };
I.doc = (ctx, o = {}) => { rr(ctx, -55, -72, 110, 144, 8); fs(ctx, o.c || C.cream); if (o.title) txt(ctx, o.title, 0, -38, { size: o.ts || 28, color: C.navy }); for (let i = 0; i < 4; i++) line(ctx, -36, -8 + i * 18, i == 3 ? 10 : 36, -8 + i * 18, 4, C.grey); circ(ctx, 28, 50, 13); fs(ctx, o.seal || C.pink, 4); };
I.certificate = (ctx, o = {}) => { rr(ctx, -120, -80, 240, 160, 10); fs(ctx, C.cream); rr(ctx, -106, -66, 212, 132, 6); ink(ctx, 3, C.gold); ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]); txt(ctx, o.title || 'BOND', 0, -24, { size: 44, font: 'serif', color: C.navy }); line(ctx, -60, 14, 60, 14, 4, C.grey); line(ctx, -40, 32, 40, 32, 4, C.grey); circ(ctx, 78, 46, 20); fs(ctx, o.seal || C.pink, 4); };
I.basket = (ctx, o = {}) => { poly(ctx, [[-90, -20], [90, -20], [70, 70], [-70, 70]]); fs(ctx, o.c || C.orange); for (let i = -2; i <= 2; i++) line(ctx, i * 30, -20, i * 24, 70, 4); line(ctx, -82, 15, 82, 15, 4); ctx.beginPath(); ctx.arc(0, -20, 80, Math.PI, 0); ink(ctx, 8); ctx.stroke(); rr(ctx, -100, -30, 200, 20, 8); fs(ctx, o.rim || C.yellow); };
I.goldbar = (ctx, o = {}) => { poly(ctx, [[-60, 30], [60, 30], [44, -20], [-44, -20]]); fs(ctx, o.c || C.gold); poly(ctx, [[-44, -20], [44, -20], [36, -30], [-36, -30]]); fs(ctx, o.top || C.yellow, 4); ctx.save(); ctx.globalAlpha = .6; line(ctx, -30, 0, -10, 0, 5, '#fff'); ctx.restore(); };
I.barrel = (ctx) => { rr(ctx, -42, -58, 84, 116, 12); fs(ctx, C.navy2); line(ctx, -42, -20, 42, -20, 5); line(ctx, -42, 20, 42, 20, 5); ctx.beginPath(); ctx.ellipse(0, -58, 42, 10, 0, 0, TAU); fs(ctx, '#3F4BA0'); ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(14, 6, 0, 12); ctx.quadraticCurveTo(-14, 6, 0, -12); fs(ctx, C.yellow, 3); };
I.wheat = (ctx) => { line(ctx, 0, 55, 0, -50, 5); for (let i = 0; i < 4; i++) { for (const s of [-1, 1]) { ctx.save(); ctx.translate(0, -40 + i * 20); ctx.rotate(s * .6); ctx.beginPath(); ctx.ellipse(s * 12, 0, 13, 7, 0, 0, TAU); fs(ctx, C.yellow, 4); ctx.restore(); } } };
I.store = (ctx) => { rr(ctx, -60, -20, 120, 80, 4); fs(ctx, C.white); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 24, -50); ctx.lineTo(-36 + i * 24, -50); ctx.lineTo(-36 + i * 24, -24); ctx.arc(-48 + i * 24, -24, 12, 0, Math.PI); ctx.closePath(); fs(ctx, i % 2 ? C.white : C.pink, 4); } rr(ctx, -40, 10, 30, 50, 3); fs(ctx, C.sky, 4); rr(ctx, 4, 6, 40, 28, 3); fs(ctx, C.sky, 4); };
I.lock = (ctx, o = {}) => { ctx.beginPath(); ctx.arc(0, -18, 28, Math.PI, 0); ink(ctx, 10); ctx.stroke(); rr(ctx, -44, -18, 88, 72, 12); fs(ctx, o.c || C.yellow); circ(ctx, 0, 10, 9); fs(ctx, C.navy, 0); rr(ctx, -4, 12, 8, 22, 3); fs(ctx, C.navy, 0); };
I.chip = (ctx) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52); } ctx.closePath(); fs(ctx, C.cyan); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32); } ctx.closePath(); fs(ctx, C.white, 4); txt(ctx, '#', 0, 3, { size: 34 }); };
I.warn = (ctx, o = {}) => { ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(56, 44); ctx.lineTo(-56, 44); ctx.closePath(); fs(ctx, o.c || C.yellow, 6); rr(ctx, -5, -22, 10, 38, 5); fs(ctx, C.navy, 0); circ(ctx, 0, 28, 6); fs(ctx, C.navy, 0); };
I.magnifier = (ctx) => { circ(ctx, -10, -10, 38); fs(ctx, 'rgba(195,235,248,.7)', 8); line(ctx, 18, 18, 52, 52, 14); ctx.save(); ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(-10, -10, 26, 3.6, 4.6); ink(ctx, 5, '#fff'); ctx.stroke(); ctx.restore(); };
I.clock = (ctx, o = {}) => { circ(ctx, 0, 0, 50); fs(ctx, o.c || C.white); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, Math.cos(a) * 40, Math.sin(a) * 40, Math.cos(a) * 44, Math.sin(a) * 44, 3); } const h = o.h || 0; line(ctx, 0, 0, Math.cos(h - Math.PI / 2) * 24, Math.sin(h - Math.PI / 2) * 24, 6); line(ctx, 0, 0, Math.cos(h * 12 - Math.PI / 2) * 34, Math.sin(h * 12 - Math.PI / 2) * 34, 4); circ(ctx, 0, 0, 5); fs(ctx, C.navy, 0); };
I.calendar = (ctx, o = {}) => { rr(ctx, -50, -46, 100, 96, 10); fs(ctx, C.white); rr(ctx, -50, -46, 100, 28, 10); fs(ctx, o.c || C.pink); txt(ctx, o.label || '1', 0, 18, { size: o.ls || 40 }); line(ctx, -26, -56, -26, -38, 6); line(ctx, 26, -56, 26, -38, 6); };
I.umbrella = (ctx) => { ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(-60, -60, 0, -60); ctx.quadraticCurveTo(60, -60, 60, 0); ctx.quadraticCurveTo(45, -12, 30, 0); ctx.quadraticCurveTo(15, -12, 0, 0); ctx.quadraticCurveTo(-15, -12, -30, 0); ctx.quadraticCurveTo(-45, -12, -60, 0); fs(ctx, C.cyan); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 48); ctx.arc(-10, 48, 10, 0, Math.PI); ink(ctx, 6); ctx.stroke(); };
I.card = (ctx) => { rr(ctx, -60, -38, 120, 76, 10); fs(ctx, C.purple); rr(ctx, -60, -20, 120, 14, 0); ctx.fillStyle = C.navy; ctx.fill(); rr(ctx, -46, 6, 22, 16, 3); fs(ctx, C.yellow, 3); line(ctx, 10, 20, 44, 20, 4, '#fff'); };
I.target = (ctx) => { for (const [r, c] of [[50, C.white], [36, C.pink], [22, C.white], [9, C.pink]]) { circ(ctx, 0, 0, r); fs(ctx, c, 4); } line(ctx, 0, 0, 46, -46, 5); poly(ctx, [[46, -46], [60, -46], [46, -60]]); fs(ctx, C.yellow, 3); };
I.hourglass = (ctx) => { rr(ctx, -40, -58, 80, 12, 4); fs(ctx, C.purple, 4); rr(ctx, -40, 46, 80, 12, 4); fs(ctx, C.purple, 4); ctx.beginPath(); ctx.moveTo(-30, -46); ctx.lineTo(30, -46); ctx.lineTo(4, 0); ctx.lineTo(30, 46); ctx.lineTo(-30, 46); ctx.lineTo(-4, 0); ctx.closePath(); fs(ctx, 'rgba(195,235,248,.8)'); poly(ctx, [[-18, 40], [18, 40], [0, 22]]); fs(ctx, C.yellow, 0); };
I.person = (ctx, o = {}) => { circ(ctx, 0, -30, 22); fs(ctx, o.skin || C.peach); ctx.beginPath(); ctx.moveTo(-36, 50); ctx.quadraticCurveTo(-36, 0, 0, 0); ctx.quadraticCurveTo(36, 0, 36, 50); ctx.closePath(); fs(ctx, o.c || C.cyan); if (o.tie) { poly(ctx, [[0, 4], [7, 14], [0, 40], [-7, 14]]); fs(ctx, C.pink, 3); } };
I.bridge = (ctx) => { rr(ctx, -70, 0, 140, 14, 3); fs(ctx, C.orange, 4); ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(0, -70, 70, 0); ink(ctx, 6); ctx.stroke(); for (let i = -2; i <= 2; i++) line(ctx, i * 22, 0, i * 22, -38 + Math.abs(i) * 12, 3); rr(ctx, -64, 14, 14, 40, 3); fs(ctx, C.white, 4); rr(ctx, 50, 14, 14, 40, 3); fs(ctx, C.white, 4); };
I.train = (ctx) => { rr(ctx, -55, -50, 110, 90, 18); fs(ctx, C.cyan); rr(ctx, -40, -36, 80, 34, 6); fs(ctx, C.white, 4); circ(ctx, -26, 20, 7); fs(ctx, C.yellow, 3); circ(ctx, 26, 20, 7); fs(ctx, C.yellow, 3); line(ctx, -30, 40, -44, 58, 5); line(ctx, 30, 40, 44, 58, 5); };
I.turbine = (ctx, o = {}) => { poly(ctx, [[-6, -30], [6, -30], [10, 60], [-10, 60]]); fs(ctx, C.white, 4); ctx.save(); ctx.translate(0, -32); ctx.rotate(o.rot || 0); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.ellipse(0, -30, 8, 30, 0, 0, TAU); fs(ctx, C.white, 4); } circ(ctx, 0, 0, 8); fs(ctx, C.green, 4); ctx.restore(); };
I.globe = (ctx) => { circ(ctx, 0, 0, 50); fs(ctx, C.sky); ctx.save(); circ(ctx, 0, 0, 50); ctx.clip(); smoothClosed(ctx, [[-30, -30], [0, -40], [10, -10], [-10, 10], [-35, 0]]); fs(ctx, C.green, 4); smoothClosed(ctx, [[15, 10], [40, 5], [35, 35], [12, 40]]); fs(ctx, C.green, 4); ctx.restore(); circ(ctx, 0, 0, 50); ink(ctx, 5); ctx.stroke(); };
I.cloud = (ctx, o = {}) => { ctx.beginPath(); ctx.arc(-26, 10, 24, Math.PI * .5, Math.PI * 1.5); ctx.arc(0, -12, 30, Math.PI, 0); ctx.arc(30, 8, 24, -Math.PI * .5, Math.PI * .5); ctx.closePath(); fs(ctx, o.c || C.white); if (o.rain) for (let i = -1; i <= 1; i++) line(ctx, i * 20, 46, i * 20 - 6, 60, 5, C.cyan); };
I.people = (ctx) => { ctx.save(); ctx.translate(-34, 6); ctx.scale(.7, .7); I.person(ctx, { c: C.pink }); ctx.restore(); ctx.save(); ctx.translate(34, 6); ctx.scale(.7, .7); I.person(ctx, { c: C.green, skin: C.skin }); ctx.restore(); ctx.save(); ctx.translate(0, -2); ctx.scale(.85, .85); I.person(ctx, { c: C.purple, skin: '#E3A77E' }); ctx.restore(); };
I.chartUp = (ctx, o = {}) => { rr(ctx, -60, -50, 120, 100, 12); fs(ctx, C.white); poly(ctx, [[-42, 30], [-14, 4], [8, 16], [40, -28]], false); ink(ctx, 7, o.c || C.green); ctx.stroke(); poly(ctx, [[40, -28], [22, -26], [38, -10]]); fs(ctx, o.c || C.green, 0); };
I.chartDown = (ctx) => { rr(ctx, -60, -50, 120, 100, 12); fs(ctx, C.white); poly(ctx, [[-42, -28], [-14, -2], [8, -12], [40, 28]], false); ink(ctx, 7, C.red); ctx.stroke(); };
I.notebook = (ctx) => { rr(ctx, -50, -62, 100, 124, 8); fs(ctx, C.yellow); rr(ctx, -36, -62, 86, 124, 6); fs(ctx, C.cream, 4); for (let i = 0; i < 4; i++) line(ctx, -22, -30 + i * 20, 34, -30 + i * 20, 3, C.grey); };
I.megaphone = (ctx) => { poly(ctx, [[-40, -14], [30, -48], [30, 48], [-40, 14]]); fs(ctx, C.pink); rr(ctx, -56, -18, 20, 36, 5); fs(ctx, C.white, 4); for (let i = 0; i < 3; i++) line(ctx, 46, -24 + i * 24, 62, -30 + i * 30, 5); };
I.sparkle = (ctx, o = {}) => { ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(4, -4, 40, 0); ctx.quadraticCurveTo(4, 4, 0, 40); ctx.quadraticCurveTo(-4, 4, -40, 0); ctx.quadraticCurveTo(-4, -4, 0, -40); fs(ctx, o.c || C.yellow, 4); };
I.question = (ctx, o = {}) => { circ(ctx, 0, 0, 44); fs(ctx, o.c || C.lilac); txt(ctx, '?', 0, 4, { size: 64, font: 'serif' }); };
I.factory = (ctx) => { poly(ctx, [[-60, 50], [-60, -10], [-30, 10], [-30, -10], [0, 10], [0, -10], [30, 10], [30, -50], [50, -50], [50, 50]]); fs(ctx, C.lilac); rr(ctx, -46, 20, 16, 16, 2); fs(ctx, C.yellow, 3); rr(ctx, -16, 20, 16, 16, 2); fs(ctx, C.yellow, 3); rr(ctx, 14, 20, 16, 16, 2); fs(ctx, C.yellow, 3); };
I.seed = (ctx) => { ctx.beginPath(); ctx.ellipse(0, 0, 22, 32, .4, 0, TAU); fs(ctx, '#B98552'); ctx.beginPath(); ctx.ellipse(-4, -2, 6, 16, .4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); };
I.fees = (ctx) => { circ(ctx, 0, 0, 46); fs(ctx, C.rose); txt(ctx, '%', 0, 4, { size: 52 }); };
I.thermo = (ctx) => { rr(ctx, -12, -55, 24, 90, 12); fs(ctx, C.white); circ(ctx, 0, 40, 20); fs(ctx, C.red); rr(ctx, -5, -20, 10, 60, 5); ctx.fillStyle = C.red; ctx.fill(); };
I.exchange = (ctx) => { ctx.save(); ctx.translate(-26, -16); ctx.scale(.6, .6); I.coin(ctx, { c: C.cyan, label: 'A' }); ctx.restore(); ctx.save(); ctx.translate(26, 18); ctx.scale(.6, .6); I.coin(ctx, { c: C.yellow, label: 'M' }); ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 50, -2.6, -1.2); ink(ctx, 5); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 50, .5, 1.9); ctx.stroke(); };
I.drop = (ctx) => { ctx.beginPath(); ctx.moveTo(0, -50); ctx.quadraticCurveTo(40, 0, 36, 18); ctx.arc(0, 18, 36, 0, Math.PI); ctx.quadraticCurveTo(-40, 0, 0, -50); fs(ctx, C.cyan); };
I.pie = (ctx, o = {}) => { const parts = o.parts || [[.4, C.purple], [.25, C.cyan], [.2, C.yellow], [.15, C.pink]]; let a = -Math.PI / 2; for (const [f, c] of parts) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 50, a, a + f * TAU); ctx.closePath(); fs(ctx, c, 4); a += f * TAU; } };
I.northstar = (ctx, o = {}) => { circ(ctx, 0, 0, 50); fs(ctx, o.c || C.navy, 0); star(ctx, 0, 0, 30, 12, 4); fs(ctx, C.yellow, 0); };
function star(ctx, x, y, R, r, n) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU - Math.PI / 2; const rad = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } ctx.closePath(); }
function icon(ctx, name, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); (I[name] || I.question)(ctx, o); ctx.restore(); }

// ── MAYA ───────────────────────────────────────────────────────────────────
// origin = bottom-centre of torso. ~ 470px tall at scale 1.
function maya(ctx, t, o = {}) {
  const { pose = 'stand', expr = 'smile', look = 0, seed = 0, shirt = C.pink, lookY = 0 } = o;
  const br = Math.sin(t * 2.1 + seed) * 2.5;
  ctx.save();
  const arm = (pts, w = 30) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ink(ctx, w + 10); ctx.stroke(); ink(ctx, w, shirt); ctx.stroke(); };
  const hand = (x, y) => { circ(ctx, x, y, 17); fs(ctx, C.skin, 5); };
  // back hair
  ctx.save(); ctx.translate(0, br * .5);
  circ(ctx, 0, -330, 112); fs(ctx, C.hair, 0);
  ctx.restore();
  // arms behind for some poses
  if (pose === 'stand' || pose === 'worried') { arm([[-98, -175], [-122, -70], [-112, -10]]); arm([[98, -175], [122, -70], [112, -10]]); hand(-112, -6); hand(112, -6); }
  // torso
  ctx.beginPath(); ctx.moveTo(-128, 0); ctx.bezierCurveTo(-130, -110, -124, -190, -70, -205 + br); ctx.lineTo(70, -205 + br); ctx.bezierCurveTo(124, -190, 130, -110, 128, 0); ctx.closePath(); fs(ctx, shirt, 6);
  // collar
  ctx.beginPath(); ctx.moveTo(-34, -205 + br); ctx.lineTo(0, -168 + br); ctx.lineTo(34, -205 + br); ink(ctx, 5); ctx.stroke();
  // neck
  rr(ctx, -22, -238 + br, 44, 42, 10); fs(ctx, C.skinS, 5);
  ctx.save(); ctx.translate(0, br);
  // head
  ctx.save(); ctx.translate(look * 4, 0); ctx.rotate(o.tilt || 0);
  ctx.beginPath(); ctx.ellipse(0, -318, 76, 88, 0, 0, TAU); fs(ctx, C.skin, 6);
  // ears + hoops
  circ(ctx, -76, -312, 14); fs(ctx, C.skin, 5); circ(ctx, 76, -312, 14); fs(ctx, C.skin, 5);
  ctx.beginPath(); ctx.arc(-78, -282, 11, 0, TAU); ink(ctx, 4, C.gold); ctx.stroke(); ctx.beginPath(); ctx.arc(78, -282, 11, 0, TAU); ctx.stroke();
  // hair top + bun
  ctx.beginPath(); ctx.moveTo(-82, -318); ctx.bezierCurveTo(-92, -420, 92, -430, 82, -318); ctx.bezierCurveTo(60, -372, 10, -386, -20, -368); ctx.bezierCurveTo(-46, -356, -70, -340, -82, -318); ctx.closePath(); fs(ctx, C.hair, 0);
  circ(ctx, 6, -428, 46); fs(ctx, C.hair, 0);
  rr(ctx, -38, -398, 84, 14, 7); fs(ctx, C.yellow, 4); // headband
  // face
  const ex = look * 7, ey = lookY * 5;
  const blink = ((t + seed * 1.3) % 4.1) < .13;
  for (const s of [-1, 1]) {
    if (blink || expr === 'happy') { ctx.beginPath(); ctx.arc(s * 28 + ex, -312 + ey, 9, expr === 'happy' ? Math.PI * 1.1 : .2, expr === 'happy' ? Math.PI * 1.9 : Math.PI - .2, false); ink(ctx, 5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(s * 28 + ex, -312 + ey, 8, 11, 0, 0, TAU); ctx.fillStyle = C.navy; ctx.fill(); circ(ctx, s * 28 + ex + 3, -316 + ey, 3); ctx.fillStyle = '#fff'; ctx.fill(); }
    // brows
    ctx.beginPath();
    if (expr === 'confused' && s === 1) { ctx.moveTo(s * 16, -346); ctx.lineTo(s * 42, -340); }
    else if (expr === 'worried') { ctx.moveTo(s * 16, -340); ctx.lineTo(s * 42, -334); }
    else if (expr === 'wow') { ctx.moveTo(s * 16, -350); ctx.quadraticCurveTo(s * 30, -358, s * 42, -350); }
    else { ctx.moveTo(s * 16, -340); ctx.quadraticCurveTo(s * 30, -347, s * 42, -340); }
    ink(ctx, 5, C.hair); ctx.stroke();
    // cheeks
    ctx.save(); ctx.globalAlpha = .45; circ(ctx, s * 44, -284, 12); ctx.fillStyle = C.pink; ctx.fill(); ctx.restore();
  }
  // nose
  ctx.beginPath(); ctx.moveTo(ex * .5 - 2, -300); ctx.quadraticCurveTo(ex * .5 + 6, -288, ex * .5 - 4, -284); ink(ctx, 4, C.skinS); ctx.stroke();
  // mouth
  ctx.beginPath();
  if (expr === 'wow') { ctx.ellipse(ex * .4, -260, 10, 13, 0, 0, TAU); ctx.fillStyle = C.navy; ctx.fill(); }
  else if (expr === 'confused' || expr === 'worried') { ctx.moveTo(-16, -260); ctx.quadraticCurveTo(-6, -266, 4, -260); ctx.quadraticCurveTo(12, -255, 18, -262); ink(ctx, 5); ctx.stroke(); }
  else if (expr === 'neutral') { ctx.moveTo(-14, -262); ctx.lineTo(14, -262); ink(ctx, 5); ctx.stroke(); }
  else { ctx.moveTo(-22, -266); ctx.quadraticCurveTo(0, -244, 22, -266); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ink(ctx, 5); ctx.stroke(); }
  ctx.restore(); ctx.restore();
  // front arms
  if (pose === 'phone') { arm([[-98, -175], [-110, -80], [-34, -112]]); arm([[98, -175], [110, -80], [34, -112]]); ctx.save(); ctx.translate(0, -140); ctx.rotate(-.08); ctx.scale(.62, .62); I.phone(ctx, { screen: o.screen || C.sky }); ctx.restore(); hand(-30, -108); hand(30, -108); }
  if (pose === 'think') { arm([[-98, -175], [-122, -70], [-112, -10]]); hand(-112, -6); arm([[98, -175], [118, -110], [46, -224]], 28); hand(42, -232); }
  if (pose === 'present') { arm([[-98, -175], [-122, -70], [-112, -10]]); hand(-112, -6); arm([[98, -175], [170, -230], [232, -300]]); hand(236, -306); }
  if (pose === 'cheer') { arm([[-98, -175], [-170, -260], [-196, -350]]); hand(-198, -356); arm([[98, -175], [170, -260], [196, -350]]); hand(198, -356); }
  if (pose === 'hold') { arm([[-98, -175], [-112, -90], [-60, -70]]); arm([[98, -175], [112, -90], [60, -70]]); if (o.prop) { ctx.save(); ctx.translate(0, -80); o.prop(ctx); ctx.restore(); } hand(-56, -68); hand(56, -68); }
  if (pose === 'give') { arm([[-98, -175], [-122, -70], [-112, -10]]); hand(-112, -6); arm([[98, -175], [150, -110], [240, -110]]); if (o.prop) { ctx.save(); ctx.translate(262, -116); o.prop(ctx); ctx.restore(); } hand(242, -110); }
  ctx.restore();
}
// Generic tiny-character bust (other investors / manager)
function bust(ctx, o = {}) { const { c = C.cyan, skin = C.peach, hair = C.hair, tie = false } = o; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.bezierCurveTo(-60, -60, -40, -80, 0, -80); ctx.bezierCurveTo(40, -80, 60, -60, 60, 0); ctx.closePath(); fs(ctx, c, 5); if (tie) { poly(ctx, [[0, -76], [10, -60], [0, -16], [-10, -60]]); fs(ctx, C.pink, 4); } circ(ctx, 0, -116, 38); fs(ctx, skin, 5); ctx.beginPath(); ctx.arc(0, -122, 40, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(30, -126); ctx.quadraticCurveTo(0, -136, -32, -122); ctx.closePath(); fs(ctx, hair, 0); circ(ctx, -13, -112, 4); ctx.fillStyle = C.navy; ctx.fill(); circ(ctx, 13, -112, 4); ctx.fill(); ctx.beginPath(); ctx.arc(0, -100, 10, .3, Math.PI - .3); ink(ctx, 4); ctx.stroke(); if (o.glasses) { circ(ctx, -14, -112, 11); circ(ctx, 14, -112, 11); ink(ctx, 3); ctx.beginPath(); ctx.arc(-14, -112, 11, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(14, -112, 11, 0, TAU); ctx.stroke(); } }

// ── charts ─────────────────────────────────────────────────────────────────
// draws polyline of data (array of [x,y] screen coords) progressively; returns tip point
function drawLine(ctx, pts, p, col = C.navy, lw = 8) {
  if (p <= 0) return pts[0]; const seg = (pts.length - 1) * clamp(p); const n = Math.floor(seg); const f = seg - n;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  let tip = pts[n]; if (n < pts.length - 1) { tip = [lerp(pts[n][0], pts[n + 1][0], f), lerp(pts[n][1], pts[n + 1][1], f)]; ctx.lineTo(tip[0], tip[1]); }
  ink(ctx, lw, col); ctx.stroke(); return tip;
}
function sampleCurve(fn, x0, x1, n) { const a = []; for (let i = 0; i <= n; i++) { const u = i / n; a.push([lerp(x0, x1, u), fn(u)]); } return a; }
