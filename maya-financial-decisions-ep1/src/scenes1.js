// ───────────────────────────────────────────────────────────────────────────
//  Scenes 1: helpers, cold open, Part 1, Part 2
//  Scene signature: (ctx, t, L, D, beat)   t = local time, L[i] = line i start
// ───────────────────────────────────────────────────────────────────────────
const Lx = (L, i, dt = 0) => (L[i] != null ? L[i] : 1e6) + dt;

function heading(ctx, t, t0, s, y, o = {}) { return words(ctx, t, t0, s, o.x || W / 2, y, { size: 78, font: 'serif', stagger: .06, ...o }); }
function label(ctx, s, x, y, o = {}) { txt(ctx, s, x, y, { size: 30, weight: 700, ...o }); }
// coins flowing along a quadratic arc between two points
function flow(ctx, t, t0, t1, a, b, o = {}) {
  const { rate = .9, n = 5, lift = 160, size = .32, iconName = 'coin', col } = o;
  if (t < t0) return; const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - lift;
  for (let k = 0; k < n; k++) {
    const ph = (t - t0) * rate + k / n; const born = t0 + (k / n) / rate * 0; const u = ph % 1; const cyc = Math.floor(ph);
    if (t1 != null && (t0 + (cyc - k / n) / rate) > t1) continue; if (ph < 1 && u < k / n - 1e-6 && false) continue;
    if ((t - t0) * rate < k / n) continue;
    const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0]; const y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
    ctx.save(); ctx.globalAlpha *= Math.min(1, u * 6, (1 - u) * 6); icon(ctx, iconName, x, y, size, col ? { c: col } : {}); ctx.restore();
  }
}
function arrow(ctx, x1, y1, x2, y2, p = 1, o = {}) {
  const { col = C.navy, lw = 6, head = 18, curve = 0 } = o; if (p <= 0) return;
  const mx = (x1 + x2) / 2 - (y2 - y1) * curve, my = (y1 + y2) / 2 + (x2 - x1) * curve;
  const pts = curvePts(u => [(1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2], 30);
  const tip = drawLine(ctx, pts, p, col, lw);
  const k = Math.max(1, Math.floor(30 * p)); const prev = pts[Math.max(0, k - 2)];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  if (p > .15) { ctx.beginPath(); ctx.moveTo(tip[0] + Math.cos(ang) * 4, tip[1] + Math.sin(ang) * 4); ctx.lineTo(tip[0] - Math.cos(ang - .5) * head, tip[1] - Math.sin(ang - .5) * head); ctx.lineTo(tip[0] - Math.cos(ang + .5) * head, tip[1] - Math.sin(ang + .5) * head); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
}
function iconCard(ctx, name, title, sub, o = {}) { const { w = 340, h = 260, fill = C.white, ic = {}, accent } = o; card(ctx, 0, 0, w, h, { fill }); if (accent) { ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.clip(); blob(ctx, 0, -h / 2 + 70, 74, accent, { seed: title.length }); ctx.restore(); } icon(ctx, name, 0, -h / 2 + 76, .95, ic); txt(ctx, title, 0, h / 2 - (sub ? 82 : 52), { size: 30 }); if (sub) { const ls = wrap(ctx, sub, w - 40, 22, 'ui', 500); ls.forEach((l, i) => txt(ctx, l, 0, h / 2 - 44 + i * 26, { size: 22, font: 'ui', weight: 500, color: '#4A5080' })); } }
function stamp(ctx, t, t0, s, x, y, o = {}) { const { col = C.red, rot = -.12, size = 54 } = o; item(ctx, t, t0, x, y, { d: .45, rot, spin: 0, sfxKind: 'stamp' }, () => { const w = tw(ctx, s, size, 'sans', 800) + 60; rr(ctx, -w / 2, -size * .9, w, size * 1.8, 14); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill(); ink(ctx, 7, col); ctx.stroke(); txt(ctx, s, 0, 4, { size, color: col }); }); }
function headline(ctx, s, sub) { const w = 470, h = 110; card(ctx, 0, 0, w, h, { r: 18, stroke: 3 }); circ(ctx, -w / 2 + 50, -10, 24); ctx.fillStyle = sub || C.lilac; ctx.fill(); ink(ctx, 3); ctx.stroke(); const ls = wrap(ctx, s, w - 120, 25, 'sans', 700); ls.forEach((l, i) => txt(ctx, l, -w / 2 + 92, -((ls.length - 1) * 15) + i * 30, { size: 25, weight: 700, align: 'left' })); for (let i = 0; i < 3; i++) { circ(ctx, w / 2 - 70 + i * 22, h / 2 - 18, 4); ctx.fillStyle = C.grey; ctx.fill(); } }

// ── COLD OPEN: bedroom, morning scroll ───────────────────────────────────
SC.coldOpen = (ctx, t, L, D) => {
  // window with sunrise
  item(ctx, t, .1, 1540, 300, { d: .8, spin: 0 }, () => { rr(ctx, -190, -170, 380, 340, 20); fs(ctx, C.sky, 6); ctx.save(); rr(ctx, -190, -170, 380, 340, 20); ctx.clip(); blob(ctx, 40, 90 - E.out(prog(t, .2, 4)) * 70, 110, C.sun, { seed: 3, t }); ctx.restore(); line(ctx, 0, -170, 0, 170, 6); line(ctx, -190, 0, 190, 0, 6); });
  blob(ctx, 420, 360, 210, C.lilac, { seed: 5, p: prog(t, .05, .9), t });
  // Maya in bed
  const s = .95; ctx.save(); ctx.translate(820, 900); ctx.scale(s, s);
  maya(ctx, t, { pose: 'phone', expr: t > D - 2.2 ? 'wow' : 'neutral', lookY: t > D - 2.2 ? 0 : 1, screen: C.sky }); ctx.restore();
  // bed & blanket
  rr(ctx, 360, 640, 70, 340, 20); fs(ctx, '#B98552');
  ctx.beginPath(); ctx.moveTo(400, 1080); ctx.lineTo(400, 860); ctx.bezierCurveTo(600, 780, 1050, 800, 1280, 860); ctx.lineTo(1280, 1080); ctx.closePath(); fs(ctx, C.purple, 6);
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = .35; brush(ctx, curvePts(u => [480 + u * 700, 900 + i * 40 + Math.sin(u * 6 + i) * 8], 20), C.lilac, 8, 1); ctx.restore(); }
  item(ctx, t, .2, 300, 150, { d: .6 }, () => { icon(ctx, 'clock', 0, 0, .7, { h: 6.75 / 12 * TAU }); txt(ctx, '6:45 am', 60, 6, { font: 'hand', size: 54, align: 'left' }); });
  // headlines
  const H5 = [["How to Build Wealth Through Investing", C.sun], ["Why People Buy Stocks", C.mint], ["Can Your Money Make More Money?", C.rose], ["Start Investing Early!", C.sky], ["Build Your Financial Future", C.lilac]];
  const pos = [[1420, 600], [1480, 810], [330, 470], [300, 700], [1060, 140]];
  H5.forEach(([s2, c], i) => item(ctx, t, .6 + i * .55, pos[i][0], pos[i][1], { d: .6, float: 10, seed: i, wig: .03, rot: (i % 2 ? .04 : -.05), t1: D - 1.3, out: 'shrink', s: 1.2 }, () => headline(ctx, s2, c)));
};

// ── BUDGET: income → expenses ───────────────────────────────────────────
SC.budget = (ctx, t, L, D) => {
  blob(ctx, 470, 540, 260, C.sun, { seed: 11, p: prog(t, 0, .8), t });
  ctx.save(); ctx.translate(330, 890); ctx.scale(.78, .78); maya(ctx, t, { pose: 'stand', expr: 'smile', look: 1 }); ctx.restore();
  item(ctx, t, .3, 610, 380, { d: .6 }, () => { icon(ctx, 'coinStack', 0, 0, 1.3); }); item(ctx, t, .5, 610, 270, { d: .5 }, () => tag(ctx, 'REGULAR INCOME', 0, 0, { size: 26, bg: C.yellow }));
  const ex = [['house', 'Rent', 230], ['cart', 'Groceries', 400], ['bus', 'Transport', 570], ['bolt', 'Electricity', 740]];
  ex.forEach(([n, s, y], i) => { item(ctx, t, Lx(L, 1, i * .45), 1330, y, { d: .55 }, () => { circ(ctx, 0, 0, 66); fs(ctx, [C.rose, C.mint, C.sky, C.lilac][i], 4); icon(ctx, n, 0, 0, .8); txt(ctx, s, 100, 4, { size: 40, align: 'left', font: 'serif' }); }); flow(ctx, t, Lx(L, 1, i * .45 + .3), null, [660, 400], [1260, y], { rate: .7 + i * .1, n: 3, lift: 60, size: .3 }); });
  // little things
  [['fees', 1720, 300], ['cloud', 1760, 520], ['card', 1720, 740]].forEach(([n, x, y], i) => item(ctx, t, Lx(L, 1, 2.6 + i * .3), x, y, { d: .5, float: 8, seed: i, s: .6 }, () => icon(ctx, n, 0, 0, 1)));
  // salary bar draining
  const drain = E.inOut(prog(t, Lx(L, 1, 0), (Lx(L, 2) - Lx(L, 1)) || 4));
  item(ctx, t, Lx(L, 0, .8), 610, 560, { d: .5 }, () => { rr(ctx, -110, -22, 220, 44, 22); fs(ctx, C.white, 4); rr(ctx, -104, -16, 208 * (1 - drain * .9), 32, 16); ctx.fillStyle = C.green; ctx.fill(); txt(ctx, 'this month', 0, 48, { size: 22, font: 'ui', weight: 600, color: C.grey }); });
  // savings jar
  item(ctx, t, Lx(L, 2), 860, 760, { d: .6 }, () => { icon(ctx, 'jar', 0, 0, 1.25, { fill: .2 + .2 * prog(t, Lx(L, 2, .6), 1) }); tag(ctx, 'A little saved', 0, 105, { size: 24, bg: C.mint }); });
  if (t > Lx(L, 2)) { const u = E.out(prog(t, Lx(L, 2, .3), .7)); if (u < 1) icon(ctx, 'coin', lerp(660, 860, u), lerp(420, 700, u) - Math.sin(u * Math.PI) * 120, .35); }
};

// ── BUZZ: everyone's talking about investing ─────────────────────────────
SC.buzz = (ctx, t, L, D) => {
  blob(ctx, 960, 560, 330, C.lilac, { seed: 21, p: prog(t, 0, .8), t, alpha: .9 });
  const confused = t > Lx(L, 4);
  ctx.save(); ctx.translate(960, 960); ctx.scale(.86, .86); maya(ctx, t, { pose: confused ? 'think' : 'stand', expr: confused ? 'confused' : 'smile', look: Math.sin(t * .8) * .8 }); ctx.restore();
  // people + speech bubbles
  const ppl = [[230, 880, C.cyan, '#E3A77E'], [1690, 880, C.green, C.skin]];
  ppl.forEach(([x, y, c, sk], i) => item(ctx, t, Lx(L, 1, i * .3), x, y, { d: .6, spin: 0 }, () => { ctx.scale(1.25, 1.25); bust(ctx, { c, skin: sk }); }));
  const bub = (s, x, y, w, c, flip) => { ctx.save(); ctx.translate(x, y); rr(ctx, -w / 2, -48, w, 96, 40); fs(ctx, c, 5); poly(ctx, [[flip ? w / 2 - 70 : -w / 2 + 50, 40], [flip ? w / 2 - 30 : -w / 2 + 30, 92], [flip ? w / 2 - 110 : -w / 2 + 90, 44]]); ctx.fillStyle = c; ctx.fill(); ink(ctx, 5); ctx.stroke(); rr(ctx, -w / 2 + 3, -45, w - 6, 88, 38); ctx.fillStyle = c; ctx.fill(); txt(ctx, s, 0, 4, { size: 32, weight: 700 }); ctx.restore(); };
  item(ctx, t, Lx(L, 1, .5), 330, 600, { d: .5, t1: Lx(L, 3), out: 'shrink' }, () => bub('Have you started investing?', 0, 0, 470, C.white, false));
  item(ctx, t, Lx(L, 2), 1560, 600, { d: .5, t1: Lx(L, 3), out: 'shrink' }, () => bub('It builds wealth!', 0, 0, 340, C.sun, true));
  // jargon
  const J = [['SHARES', C.yellow], ['ETFs', C.sky], ['GOVERNMENT BONDS', C.mint], ['PORTFOLIO', C.rose], ['DIVIDENDS', C.peach], ['INDEX FUND', C.lilac], ['YIELD', C.white], ['EQUITIES', C.sun]];
  const JP = [[330, 330], [1590, 330], [250, 560], [1680, 560], [520, 180], [1400, 180], [420, 760], [1520, 760]];
  J.forEach(([s, c], i) => { const [x, y] = JP[i]; const blur = confused ? Math.sin(t * 3 + i) * 4 : 0; item(ctx, t, Lx(L, 3, i * .32), x, y, { d: .55, wig: .05, seed: i, float: 8 }, () => { ctx.translate(blur, 0); tag(ctx, s, 0, 0, { size: 34, bg: c }); }); });
  // question marks
  [[-150, -560], [150, -600], [0, -660], [-260, -470], [260, -500]].forEach(([dx, dy], i) => item(ctx, t, Lx(L, 5, i * .35), 960 + dx, 960 + dy * .86 + 10, { d: .5, float: 10, seed: i, s: .7 + (i % 2) * .2 }, () => icon(ctx, 'question', 0, 0, 1, { c: [C.yellow, C.sky, C.pink, C.mint, C.lilac][i] })));
};

// ── SEARCH: evening laptop ────────────────────────────────────────────────
SC.search = (ctx, t, L, D) => {
  // evening sky blob with moon
  item(ctx, t, 0, 1640, 220, { d: .8, spin: 0 }, () => { blob(ctx, 0, 0, 170, C.navy2, { seed: 4, t }); circ(ctx, 30, -20, 46); ctx.fillStyle = C.cream; ctx.fill(); circ(ctx, 50, -34, 40); ctx.fillStyle = C.navy2; ctx.fill(); for (let i = 0; i < 5; i++) { star(ctx, -90 + i * 40, 40 + (i % 2) * 40, 9, 4, 4); ctx.fillStyle = C.yellow; ctx.fill(); } });
  blob(ctx, 300, 820, 170, C.sun, { seed: 9, p: prog(t, .2, .8), t });
  const zoom = 1 + .35 * E.inOut(prog(t, Lx(L, 1), 1.2)) - .35 * E.inOut(prog(t, Lx(L, 2), 1));
  ctx.save(); ctx.translate(960, 520); ctx.scale(zoom, zoom);
  item(ctx, t, .1, 0, 0, { d: .7 }, () => { ctx.scale(2.7, 2.7); I.laptop(ctx, { screen: C.white }); });
  // screen space: x -286..286, y -208..154
  const q = 'What exactly is investing?'; const typed = Math.floor(q.length * prog(t, Lx(L, 0, .8), 1.8));
  if (t > .7) {
    rr(ctx, -240, -170, 480, 64, 32); fs(ctx, C.white, 4); icon(ctx, 'magnifier', -205, -138, .3);
    txt(ctx, q.slice(0, typed) + ((t * 2 % 1 < .5 && typed < q.length) ? '|' : ''), -170, -136, { size: 28, font: 'ui', weight: 600, align: 'left' });
  }
  const tiles = [['chartUp', C.mint], ['certificate', C.cream], ['house', C.rose], ['basket', C.sky], ['goldbar', C.sun], ['pie', C.lilac], ['globe', C.white], ['barrel', C.peach]];
  tiles.forEach(([n, c], i) => { const cx = -195 + (i % 4) * 130, cy = -30 + Math.floor(i / 4) * 125; item(ctx, t, Lx(L, 2, .2 + i * .14), cx, cy, { d: .5 }, () => { rr(ctx, -55, -52, 110, 104, 14); fs(ctx, c, 4); icon(ctx, n, 0, 0, n === 'certificate' ? .38 : .7, n === 'certificate' ? { title: 'BOND' } : {}); }); });
  ctx.restore();
  const W4 = [['ASSETS', 260, 300, C.yellow], ['OPPORTUNITIES', 250, 520, C.mint], ['RISKS', 1660, 560, C.rose], ['DECISIONS', 1640, 760, C.sky]];
  W4.forEach(([s, x, y, c], i) => item(ctx, t, Lx(L, 3, i * .45), x, y, { d: .5, float: 8, seed: i }, () => tag(ctx, s, 0, 0, { size: 34, bg: c })));
  item(ctx, t, Lx(L, 4, .6), 1490, 880, { d: .6, rot: -.2, float: 6 }, () => icon(ctx, 'magnifier', 0, 0, 1.3));
};

// ── EPISODE TITLE ─────────────────────────────────────────────────────────
SC.episodeTitle = (ctx, t, L, D) => {
  blob(ctx, 1450, 420, 300, C.sun, { seed: 31, p: prog(t, .1, .9), t });
  blob(ctx, 1250, 760, 140, C.lilac, { seed: 32, p: prog(t, .3, .9), t });
  blob(ctx, 300, 180, 90, C.rose, { seed: 33, p: prog(t, .5, .9), t });
  brush(ctx, curvePts(u => [1730 + Math.sin(u * 3) * 20, 650 + u * 260], 20), C.pink, 16, E.out(prog(t, .8, .8)));
  ctx.save(); ctx.translate(1450, 930); ctx.scale(.9, .9); item(ctx, t, .3, 0, 0, { d: .7, spin: 0, from: [0, 500], ease: 'back' }, () => maya(ctx, t, { pose: 'cheer', expr: 'happy' })); ctx.restore();
  item(ctx, t, .5, 470, 280, { d: .5 }, () => tag(ctx, "MAYA'S FINANCIAL DECISIONS  ·  EPISODE 1", 0, 0, { size: 26, bg: C.yellow }));
  ['Maya wants to', 'start investing —', 'but where does', 'she begin?'].forEach((l, i) => words(ctx, t, .7 + i * .22, l, 170, 400 + i * 112, { size: 104, font: 'serif', align: 'left', stagger: .07 }));
  marker(ctx, t, 2.0, 160, 360 + 3 * 112 + 40 - 40, 470, 30, C.pink);
};

// ── PART 1 · coin → seed → tree ───────────────────────────────────────────
SC.coinTree = (ctx, t, L, D) => {
  // table
  brush(ctx, [[260, 820], [1660, 820]], C.navy, 8, E.out(prog(t, .1, .8)));
  blob(ctx, 960, 560, 330, C.mint, { seed: 41, p: prog(t, Lx(L, 1, 1), 1.2), t, alpha: .8 });
  const tc = Lx(L, 0, .2), tm = Lx(L, 1, .2);
  // coin drop
  const drop = E.out(prog(t, tc, .7)); const morph = prog(t, tm, .6);
  if (t > tc && morph < 1) { ctx.save(); ctx.translate(960, lerp(-80, 770, drop) - Math.abs(Math.sin(prog(t, tc + .5, .5) * Math.PI)) * 40 * (1 - prog(t, tc + .5, .5))); ctx.scale(1 - morph, 1 - morph); I.coin(ctx); ctx.restore(); if (drop > 0) SFX.add('pop', tc + .55); }
  if (morph > 0) { const s2 = E.back(morph) * (1 - prog(t, tm + 1.2, .4)); if (s2 > 0) icon(ctx, 'seed', 960, 790, s2 * .7); }
  // tree grows
  const g = E.out(prog(t, tm + 1.1, 2.5));
  if (g > 0) {
    const trunk = [[960, 815], [955, 700], [962, 600], [960, 540]];
    brush(ctx, trunk, '#8B5A36', 34, g);
    const br = [[[960, 620], [880, 560], [790, 500]], [[960, 600], [1050, 540], [1140, 490]], [[960, 560], [900, 470], [870, 380]], [[960, 550], [1020, 460], [1060, 370]]];
    br.forEach((b, i) => brush(ctx, b, '#8B5A36', 18, E.out(prog(t, tm + 1.6 + i * .25, 1.2))));
    [[790, 500], [1140, 490], [870, 380], [1060, 370], [960, 470]].forEach(([x, y], i) => { const p = prog(t, tm + 2.1 + i * .2, .8); if (p > 0) blob(ctx, x, y, 80, i % 2 ? C.green : '#86DDA9', { seed: 50 + i, p, t, wob: .18 }); });
  }
  // definition
  if (t > tm) {
    item(ctx, t, tm + .2, 960, 120, { d: .5 }, () => tag(ctx, 'INVESTING =', 0, 0, { size: 30, bg: C.yellow }));
    words(ctx, t, tm + .4, 'putting money into an asset with the expectation of a future return', 960, 205, { size: 54, font: 'serif', stagger: .045 });
    if (t > Lx(L, 2)) { const w = tw(ctx, 'putting money into an asset with the expectation of a future return', 54, 'serif'); const x0 = 960 - w / 2 + tw(ctx, 'putting money into an ', 54, 'serif'); brush(ctx, [[x0, 240], [x0 + tw(ctx, 'asset', 54, 'serif'), 238]], C.pink, 8, E.out(prog(t, Lx(L, 2, .2), .5))); }
  }
  item(ctx, t, Lx(L, 3, .2), 1500, 620, { d: .6, rot: .04 }, () => { card(ctx, 0, 0, 380, 170, { fill: C.cream }); txt(ctx, 'ASSET', 0, -40, { size: 36 }); txt(ctx, 'something with', 0, 10, { size: 30, font: 'serif' }); txt(ctx, 'economic value', 0, 48, { size: 30, font: 'serif' }); });
  // branch assets
  const A = [['northstar', 'Share', 790, 500], ['doc', 'Bond', 1140, 490], ['house', 'Property', 870, 380], ['basket', 'Fund unit', 1060, 370]];
  A.forEach(([n, s, x, y], i) => item(ctx, t, Lx(L, 4, .4 + i * .9), x, y, { d: .6 }, () => { circ(ctx, 0, 0, 58); fs(ctx, C.white, 5); icon(ctx, n, 0, 0, n === 'basket' ? .45 : .62, n === 'doc' ? { title: 'BOND', ts: 22 } : {}); tag(ctx, s, 0, 80, { size: 22 }); }));
  ctx.save(); ctx.translate(360, 930); ctx.scale(.75, .75); item(ctx, t, Lx(L, 5), 0, 0, { d: .7, spin: 0, from: [-700, 0] }, () => maya(ctx, t, { pose: 'present', expr: 'smile', look: 1 })); ctx.restore();
};

// ── PART 1 · saving vs investing ─────────────────────────────────────────
SC.saveVsInvest = (ctx, t, L, D) => {
  blob(ctx, 520, 520, 290, C.sky, { seed: 61, p: prog(t, Lx(L, 1), .8), t });
  blob(ctx, 1380, 520, 300, C.peach, { seed: 62, p: prog(t, Lx(L, 4), .8), t });
  item(ctx, t, Lx(L, 1), 520, 150, { d: .5 }, () => tag(ctx, 'SAVING', 0, 0, { size: 40, bg: C.white }));
  item(ctx, t, Lx(L, 1, .3), 960, 520, { d: .5 }, () => txt(ctx, '≠', 0, 0, { size: 140, font: 'serif' }));
  item(ctx, t, Lx(L, 4), 1380, 150, { d: .5 }, () => tag(ctx, 'INVESTING', 0, 0, { size: 40, bg: C.white }));
  // saving: vault, coins rest inside
  item(ctx, t, Lx(L, 2), 520, 500, { d: .6 }, () => { icon(ctx, 'vault', 0, 0, 2.2); });
  flow(ctx, t, Lx(L, 2, .4), Lx(L, 3, 2), [260, 300], [520, 480], { rate: .6, n: 3, lift: 80, size: .35 });
  item(ctx, t, Lx(L, 2, .8), 690, 330, { d: .5, float: 6 }, () => icon(ctx, 'shield', 0, 0, .8));
  item(ctx, t, Lx(L, 3, .2), 520, 770, { d: .5 }, () => tag(ctx, 'Savings account · easy access', 0, 0, { size: 26, bg: C.mint }));
  item(ctx, t, Lx(L, 3, 2.2), 280, 620, { d: .5, float: 8, seed: 2 }, () => { icon(ctx, 'umbrella', 0, 0, .9); txt(ctx, 'unexpected bill', 0, 80, { font: 'hand', size: 36 }); });
  // investing: machine
  item(ctx, t, Lx(L, 4, .2), 1300, 520, { d: .6 }, () => {
    poly(ctx, [[-90, -210], [90, -210], [40, -140], [-40, -140]]); fs(ctx, C.lilac);
    rr(ctx, -150, -140, 300, 270, 30); fs(ctx, C.white);
    icon(ctx, 'gear', -45, -10, .9, { rot: t * 1.2, c: C.yellow }); icon(ctx, 'gear', 50, 50, .7, { rot: -t * 1.6, c: C.purple });
    circ(ctx, 95, -95, 14); ctx.fillStyle = (t * 2 % 1) < .5 ? C.green : C.red; ctx.fill(); ink(ctx, 4); ctx.stroke();
    if (t > Lx(L, 5)) item(ctx, t, Lx(L, 5), -95, -95, { d: .4, s: .4 }, () => icon(ctx, 'question', 0, 0, 1, { c: C.sun }));
  });
  flow(ctx, t, Lx(L, 4, .6), null, [1080, 260], [1300, 300], { rate: .8, n: 3, lift: 90, size: .32 });
  const outs = [['chartUp', 'GROWTH', 330, C.mint, 6], ['coinStack', 'INCOME', 540, C.sun, 6.6], ['chartDown', 'LOSS', 750, C.rose, 7]];
  outs.forEach(([n, s, y, c, li]) => { const t0 = s === 'GROWTH' ? Lx(L, 6) : s === 'LOSS' ? Lx(L, 7) : Lx(L, 6, 1.2); arrow(ctx, 1455, 520, 1600, y, E.out(prog(t, t0, .5)), { curve: 0 }); item(ctx, t, t0 + .3, 1700, y, { d: .5 }, () => { circ(ctx, 0, 0, 72); fs(ctx, c, 5); icon(ctx, n, 0, -6, .8); tag(ctx, s, 0, 80, { size: 22 }); }); });
  if (t > Lx(L, 8)) { const p = prog(t, Lx(L, 8, .3), 1.5); for (let i = 0; i < 6; i++) { const r = rng(i + 3); const x = 1700 + (r() - .5) * 120, y = 750 + E.in(p) * 300 * (.6 + r()); ctx.save(); ctx.globalAlpha = 1 - p; icon(ctx, 'coin', x, y, .3, { c: C.fog }); ctx.restore(); } stamp(ctx, t, Lx(L, 8, 1.2), 'SOME OR ALL', 1380, 860, { size: 38 }); }
};

// ── PART 1 · when to save, when to invest ────────────────────────────────
SC.whenToInvest = (ctx, t, L, D) => {
  const phB = Lx(L, 4); const up = E.inOut(prog(t, phB - .4, .8));
  const fadeQ = 1 - prog(t, Lx(L, 6, .3), .6);
  ctx.save(); ctx.globalAlpha = fadeQ;
  // two cards (phase A), move up and shrink in phase B
  const cy = lerp(470, 210, up), cs = lerp(1, .62, up);
  item(ctx, t, .2, lerp(560, 640, up), cy, { d: .6, s: cs }, () => { card(ctx, 0, 0, 640, 330, { fill: C.white }); icon(ctx, 'jar', -210, 0, 1.3, { fill: .6 }); txt(ctx, 'SAVING', 60, -90, { size: 40 }); ['keep money', 'available &', 'relatively stable'].forEach((s, i) => txt(ctx, s, 60, -20 + i * 48, { size: 38, font: 'serif' })); });
  item(ctx, t, Lx(L, 1), lerp(1360, 1280, up), cy, { d: .6, s: cs }, () => { card(ctx, 0, 0, 640, 330, { fill: C.white }); icon(ctx, 'chartUp', -210, 0, 1.4); txt(ctx, 'INVESTING', 60, -90, { size: 40 }); ['try to grow wealth', 'or generate income', 'over time'].forEach((s, i) => txt(ctx, s, 60, -20 + i * 48, { size: 38, font: 'serif' })); });
  if (up < 1) { ctx.save(); ctx.globalAlpha *= 1 - up; item(ctx, t, Lx(L, 2), 960, 760, { d: .5 }, () => tag(ctx, 'BOTH BELONG IN A FINANCIAL PLAN', 0, 0, { size: 32, bg: C.yellow })); item(ctx, t, Lx(L, 3, .4), 960, 470, { d: .5 }, () => { circ(ctx, 0, 0, 60); fs(ctx, C.white); txt(ctx, '>', 0, 0, { size: 70, font: 'serif' }); line(ctx, -50, 50, 50, -50, 10, C.red); }); ctx.restore(); }
  // phase B: time axis
  if (t > phB - .3) {
    arrow(ctx, 220, 560, 1720, 560, E.out(prog(t, phB - .3, 1)), { lw: 7 }); txt(ctx, 'TIME', 1720, 610, { size: 26, align: 'right' });
    item(ctx, t, phB + .3, 420, 560, { d: .5 }, () => icon(ctx, 'calendar', 0, 0, 1, { label: '30', c: C.pink }));
    item(ctx, t, phB + .6, 420, 440, { d: .5 }, () => tag(ctx, 'NEXT MONTH', 0, 0, { size: 24 }));
    item(ctx, t, phB + 1.6, 420, 760, { d: .5 }, () => { icon(ctx, 'house', -80, 0, .9); txt(ctx, '→', 0, 0, { size: 60 }); icon(ctx, 'jar', 90, 0, .9, { fill: .5 }); txt(ctx, 'rent money stays put', 0, 100, { font: 'hand', size: 40 }); });
    item(ctx, t, Lx(L, 4, 3.4), 760, 760, { d: .5 }, () => { icon(ctx, 'chartDown', 0, 0, .8); line(ctx, -60, -50, 60, 50, 8, C.red); line(ctx, 60, -50, -60, 50, 8, C.red); });
    item(ctx, t, Lx(L, 5), 1450, 560, { d: .5 }, () => icon(ctx, 'hourglass', 0, 0, 1));
    item(ctx, t, Lx(L, 5, .3), 1450, 440, { d: .5 }, () => tag(ctx, 'SEVERAL YEARS', 0, 0, { size: 24 }));
    item(ctx, t, Lx(L, 5, 1.6), 1450, 760, { d: .5 }, () => { icon(ctx, 'chartUp', 0, 0, .9); txt(ctx, 'worth exploring', 0, 100, { font: 'hand', size: 40 }); });
  }
  ctx.restore();
  if (t > Lx(L, 6, .3)) { blob(ctx, 960, 520, 280, C.sun, { seed: 71, p: prog(t, Lx(L, 6, .5), .8), t }); words(ctx, t, Lx(L, 7) - .2, 'What exactly can', 960, 470, { size: 92 }); words(ctx, t, Lx(L, 7), 'someone invest in?', 960, 580, { size: 92 }); }
};

// ── PART 2 · investment universe ─────────────────────────────────────────
const CATS = [['chartUp', 'Stocks', C.mint, 0], ['certificate', 'Bonds', C.cream, 1], ['basket', 'ETFs', C.sky, 2], ['pie', 'Mutual funds', C.lilac, 2], ['house', 'Property', C.rose, 3], ['goldbar', 'Commodities', C.sun, 3], ['chip', 'Other', C.peach, 4]];
SC.universe = (ctx, t, L, D) => {
  const cx = 960, cy = 500;
  [[640, 330], [430, 220]].forEach(([rx, ry], i) => { ctx.save(); ctx.globalAlpha = E.out(prog(t, .2 + i * .2, .8)); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.setLineDash([4, 14]); ink(ctx, 4, C.grey); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); });
  blob(ctx, cx, cy + 40, 200, C.sun, { seed: 81, p: prog(t, .1, .8), t });
  ctx.save(); ctx.translate(cx, cy + 300); ctx.scale(.62, .62); maya(ctx, t, { pose: 'cheer', expr: t > Lx(L, 6) ? 'happy' : 'wow', look: Math.sin(t * .6) }); ctx.restore();
  const grp = t < Lx(L, 2) ? -1 : t < Lx(L, 3) ? 0 : t < Lx(L, 4) ? 1 : t < Lx(L, 5) ? 2 : t < Lx(L, 6) ? 3 : -1;
  CATS.forEach(([n, s, c, g], i) => {
    const a = i / CATS.length * TAU - Math.PI / 2 + t * .07; const x = cx + Math.cos(a) * 640, y = cy + Math.sin(a) * 330;
    const on = grp === g; const dim = grp >= 0 && !on;
    item(ctx, t, Lx(L, 1, -1.5 + i * .3), x, y, { d: .6, alpha: dim ? .35 : 1, s: on ? 1.22 : 1 }, () => { if (on) blob(ctx, 0, 0, 92, C.yellow, { seed: i, t }); circ(ctx, 0, 0, 70); fs(ctx, c, 5); icon(ctx, n, 0, 0, n === 'certificate' ? .45 : .75, n === 'certificate' ? {} : {}); tag(ctx, s, 0, 92, { size: 24 }); });
  });
  const cap = ['', 'OWN PART OF A BUSINESS', 'LEND MONEY', 'BUY A COLLECTION', 'OWN PHYSICAL ASSETS'][grp + 1];
  if (cap) { const t0 = [0, Lx(L, 2), Lx(L, 3), Lx(L, 4), Lx(L, 5)][grp + 1]; item(ctx, t, t0, cx, 90, { d: .5, t1: (grp < 3 ? [Lx(L, 3), Lx(L, 4), Lx(L, 5)][grp] : Lx(L, 6)) - .2 }, () => tag(ctx, cap, 0, 0, { size: 32, bg: C.yellow })); }
};
