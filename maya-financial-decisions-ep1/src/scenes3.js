// ───────────────────────────────────────────────────────────────────────────
//  Scenes 3: Part 7 (mutual funds) → Closing
// ───────────────────────────────────────────────────────────────────────────

// ── MUTUAL FUNDS · the pool ─────────────────────────────────────────────
SC.mutualPool = (ctx, t, L, D) => {
  hiText(ctx, t, .2, 'MUTUAL FUND', 960, 100, { size: 60, hl: C.lilac });
  const cx = 960, cy = 560;
  blob(ctx, cx, cy, 230, C.sky, { seed: 201, p: prog(t, .2, .8), t });
  // pool (pot)
  const lvl = .2 + .6 * E.inOut(prog(t, Lx(L, 1, .5), 4));
  item(ctx, t, .4, cx, cy, { d: .6 }, () => { ctx.beginPath(); ctx.moveTo(-170, -80); ctx.bezierCurveTo(-180, 120, 180, 120, 170, -80); ctx.closePath(); fs(ctx, C.white, 6); ctx.save(); ctx.clip(); rr(ctx, -200, 70 - lvl * 170, 400, 300, 0); ctx.fillStyle = C.yellow; ctx.fill(); for (let i = 0; i < 7; i++) { circ(ctx, -150 + i * 50, 70 - lvl * 170 + Math.sin(t * 2 + i) * 4, 16); fs(ctx, C.gold, 3); } ctx.restore(); ctx.beginPath(); ctx.ellipse(0, -80, 170, 30, 0, 0, TAU); fs(ctx, C.lilac, 6); txt(ctx, 'POOLED MONEY', 0, -80, { size: 24 }); });
  const inv = [[280, 380, C.cyan, C.peach], [280, 760, C.green, C.skin], [1640, 380, C.orange, '#E3A77E'], [1640, 760, C.pink, C.skinS]];
  inv.forEach(([x, y, c, sk], i) => { item(ctx, t, Lx(L, 1, i * .2), x, y + 70, { d: .5, spin: 0 }, () => { ctx.scale(.85, .85); bust(ctx, { c, skin: sk }); }); flow(ctx, t, Lx(L, 1, .5 + i * .2), Lx(L, 4), [x, y - 40], [cx + (x < cx ? -90 : 90), cy - 100], { rate: .6, n: 3, lift: 100, size: .28 }); });
  // units back
  inv.forEach(([x, y], i) => { const u = E.inOut(prog(t, Lx(L, 4, .3 + i * .15), 1)); if (u > 0) { const px = lerp(cx, x + (x < cx ? 90 : -90), u), py = lerp(cy + 40, y - 30, u) - Math.sin(u * Math.PI) * 100; icon(ctx, 'coin', px, py, .4, { label: 'U', c: C.mint }); } });
  item(ctx, t, Lx(L, 4, 1.4), cx, cy + 210, { d: .5, t1: Lx(L, 6), out: 'shrink' }, () => tag(ctx, 'investors get units', 0, 0, { size: 28, bg: C.mint }));
  // manager
  const act = t > Lx(L, 6) && t < Lx(L, 8);
  item(ctx, t, Lx(L, 2), cx, 330, { d: .6, spin: 0, s: act ? 1.12 : 1 }, () => { ctx.scale(.8, .8); bust(ctx, { c: C.navy2, skin: C.skin, tie: true, glasses: true }); });
  item(ctx, t, Lx(L, 2, .4), cx + 120, 230, { d: .5, t1: Lx(L, 6), out: 'shrink' }, () => tag(ctx, 'fund manager', 0, 0, { size: 24, bg: C.white }));
  // asset chips
  [['Stocks', 600, 300, C.mint], ['Bonds', 1320, 300, C.sun], ['Money market', 560, 700, C.rose], ['A mix', 1360, 700, C.lilac]].forEach(([s, x, y, c], i) => item(ctx, t, Lx(L, 3, .2 + i * .5), x, y, { d: .5, float: 6, seed: i }, () => tag(ctx, s, 0, 0, { size: 28, bg: c })));
  item(ctx, t, Lx(L, 5, .4), cx, 870, { d: .5, t1: Lx(L, 6), out: 'shrink' }, () => tag(ctx, 'unit value ≈ value of holdings − expenses', 0, 0, { size: 28, bg: C.white }));
  item(ctx, t, Lx(L, 6, .2), cx, 870, { d: .5, t1: Lx(L, 8), out: 'shrink' }, () => tag(ctx, 'ACTIVE · a manager picks what to buy & sell', 0, 0, { size: 28, bg: C.yellow }));
  item(ctx, t, Lx(L, 8, .2), cx, 870, { d: .5 }, () => tag(ctx, 'PASSIVE · tracks an index or benchmark', 0, 0, { size: 28, bg: C.sky }));
  if (act) item(ctx, t, Lx(L, 7), cx - 140, 300, { d: .5, rot: -.3 }, () => icon(ctx, 'magnifier', 0, 0, .7));
};

// ── MUTUAL vs ETF ─────────────────────────────────────────────────────────
SC.etfVsMutual = (ctx, t, L, D) => {
  words(ctx, t, .2, 'Mutual fund vs. ETF', 960, 110, { size: 72 });
  ctx.save(); ctx.globalAlpha = E.out(prog(t, Lx(L, 1), .6)); ctx.setLineDash([6, 12]); line(ctx, 960, 190, 960, 830, 4, C.grey); ctx.restore();
  item(ctx, t, Lx(L, 1), 500, 210, { d: .5 }, () => tag(ctx, 'MUTUAL FUND', 0, 0, { size: 32, bg: C.lilac }));
  item(ctx, t, Lx(L, 1, .3), 1420, 210, { d: .5 }, () => tag(ctx, 'ETF', 0, 0, { size: 32, bg: C.sky }));
  const day = (x0, x1, y) => { line(ctx, x0, y, x1, y, 5); ['9:00', '12:00', '15:00', 'close'].forEach((s, i) => { const x = lerp(x0, x1, i / 3); line(ctx, x, y - 8, x, y + 8, 4); txt(ctx, s, x, y + 36, { size: 22, color: C.grey }); }); };
  // left
  if (t > Lx(L, 2)) {
    item(ctx, t, Lx(L, 2), 300, 400, { d: .5 }, () => icon(ctx, 'clock', 0, 0, 1, { h: (t * .3) % TAU }));
    item(ctx, t, Lx(L, 2, .4), 620, 400, { d: .5 }, () => { icon(ctx, 'office', 0, 0, .8); tag(ctx, 'fund provider', 0, 105, { size: 22 }); });
    fade(ctx, t, Lx(L, 2, .8), null, () => day(180, 800, 640));
    item(ctx, t, Lx(L, 2, 3), 800, 640, { d: .5 }, () => { circ(ctx, 0, 0, 18); fs(ctx, C.yellow, 5); tag(ctx, 'price set once', 0, -60, { size: 24, bg: C.sun }); });
    item(ctx, t, Lx(L, 2, 4), 480, 770, { d: .5 }, () => txt(ctx, 'often once per business day', 0, 0, { font: 'hand', size: 38 }));
  }
  if (t > Lx(L, 3)) {
    fade(ctx, t, Lx(L, 3), null, () => day(1120, 1740, 640));
    const pts = sampleCurve(u => 560 + Math.sin(u * 17 + 1) * 26 + Math.sin(u * 41) * 12 - u * 30, 1120, 1740, 100);
    const tip = drawLine(ctx, pts, E.lin(prog(t, Lx(L, 3, .3), 3.5)), C.cyan, 6); circ(ctx, tip[0], tip[1], 11); fs(ctx, C.yellow, 4);
    item(ctx, t, Lx(L, 3, .2), 1430, 400, { d: .5 }, () => { rr(ctx, -180, -60, 360, 120, 16); fs(ctx, C.navy); const v = 50 + Math.sin(t * 3) * .4 + Math.sin(t * 7) * .2; txt(ctx, 'ETF  ' + v.toFixed(2), 0, 0, { size: 44, color: '#8FF0B8', font: 'ui', weight: 700 }); });
    item(ctx, t, Lx(L, 3, 2), 1430, 770, { d: .5 }, () => txt(ctx, 'trades all day on an exchange', 0, 0, { font: 'hand', size: 38 }));
  }
  item(ctx, t, Lx(L, 4, .2), 960, 860, { d: .5, t1: Lx(L, 5), out: 'shrink' }, () => tag(ctx, 'exceptions exist across markets', 0, 0, { size: 26, bg: C.white }));
  if (t > Lx(L, 5)) [500, 1420].forEach((x, i) => item(ctx, t, Lx(L, 5, .3 + i * .2), x, 860, { d: .5 }, () => { tag(ctx, 'fees', -100, 0, { size: 28, bg: C.rose }); tag(ctx, 'can lose value', 110, 0, { size: 28, bg: C.rose }); }));
};

// ── OTHER · real estate ───────────────────────────────────────────────────
SC.realEstate = (ctx, t, L, D) => {
  const phB = Lx(L, 2);
  fade(ctx, t, 0, phB - .3, () => { words(ctx, t, .2, 'Beyond stocks, bonds & funds', 960, 330, { size: 76 }); [['house', C.rose], ['goldbar', C.sun], ['barrel', C.peach], ['store', C.mint], ['chip', C.sky]].forEach(([n, c], i) => item(ctx, t, Lx(L, 1, i * .25), 560 + i * 200, 560, { d: .5, float: 6, seed: i }, () => { circ(ctx, 0, 0, 72); fs(ctx, c, 5); icon(ctx, n, 0, 0, .75); })); });
  if (t < phB - .4) return;
  blob(ctx, 640, 500, 300, C.rose, { seed: 211, p: prog(t, phB - .3, .8), t });
  hiText(ctx, t, phB, 'REAL ESTATE', 640, 120, { size: 60, hl: C.rose });
  item(ctx, t, phB + .2, 640, 520, { d: .7 }, () => { ctx.scale(3, 3); I.house(ctx, { c: C.peach }); });
  [['house', 'Residential'], ['office', 'Commercial'], ['land', 'Land']].forEach(([n, s], i) => item(ctx, t, Lx(L, 3, .4 + i * .6), 1240 + i * 200, 240, { d: .5 }, () => { circ(ctx, 0, 0, 66); fs(ctx, C.white, 5); if (n === 'land') { blob(ctx, 0, 14, 40, C.green, { seed: 3 }); line(ctx, 0, 14, 0, -34, 5); poly(ctx, [[0, -34], [26, -26], [0, -18]]); fs(ctx, C.pink, 3); } else icon(ctx, n, 0, 0, n === 'office' ? .5 : .7); tag(ctx, s, 0, 88, { size: 22 }); }));
  // rent & value
  if (t > Lx(L, 4)) { ctx.save(); ctx.translate(260, 900); ctx.scale(.7, .7); bust(ctx, { c: C.green, skin: C.skin }); ctx.restore(); flow(ctx, t, Lx(L, 4, .3), Lx(L, 5), [300, 760], [560, 560], { rate: .6, n: 3, lift: 100, size: .3 }); item(ctx, t, Lx(L, 4, .4), 260, 650, { d: .5 }, () => tag(ctx, 'RENT', 0, 0, { size: 26, bg: C.sun })); arrow(ctx, 900, 700, 980, 420, E.out(prog(t, Lx(L, 4, 1.5), .7)), { col: C.green, lw: 9 }); item(ctx, t, Lx(L, 4, 2), 1010, 360, { d: .5 }, () => tag(ctx, 'VALUE ↑ ?', 0, 0, { size: 26, bg: C.mint })); }
  [['Expensive to buy', 'fees'], ['Hard to sell quickly', 'hourglass'], ['Costly to maintain', 'gear']].forEach(([s, n], i) => item(ctx, t, Lx(L, 5, .3 + i * 1.1), 1440, 470 + i * 130, { d: .5, rot: .02 }, () => { card(ctx, 0, 0, 470, 104, { fill: C.white, r: 20 }); icon(ctx, n, -180, 0, .55); txt(ctx, s, 30, 2, { size: 30 }); }));
};

// ── OTHER · commodities ───────────────────────────────────────────────────
SC.commodities = (ctx, t, L, D) => {
  const phB = Lx(L, 3), phC = Lx(L, 4);
  hiText(ctx, t, .2, 'COMMODITIES', 960, 110, { size: 60, hl: C.sun });
  fade(ctx, t, 0, phC - .3, () => {
    brush(ctx, [[440, 560], [1480, 560]], '#B98552', 18, E.out(prog(t, .3, .8)));
    [['goldbar', 'Gold', {}], ['goldbar', 'Silver', { c: '#C9CCD8', top: '#E8EAF0' }], ['barrel', 'Oil', {}], ['wheat', 'Agriculture', {}]].forEach(([n, s, o], i) => item(ctx, t, Lx(L, 1, .3 + i * .55), 560 + i * 270, 470, { d: .55, from: [0, -400], ease: 'back' }, () => { icon(ctx, n, 0, 0, 1.2, o); tag(ctx, s, 0, 160, { size: 26 }); }));
    // price factors orbit
    const F = [['cart', 'Supply & demand'], ['chartUp', 'Economy'], ['cloud', 'Weather'], ['globe', 'Geopolitics']];
    F.forEach(([n, s], i) => { const pos = [[240, 300], [1680, 300], [240, 800], [1680, 800]][i]; item(ctx, t, Lx(L, 2, .3 + i * .6), pos[0], pos[1] - 40, { d: .5, float: 7, seed: i, t1: phB - .3, out: 'shrink' }, () => { circ(ctx, 0, 0, 62); fs(ctx, C.white, 5); icon(ctx, n, 0, 0, .7, n === 'cloud' ? { rain: true, c: C.sky } : {}); tag(ctx, s, 0, 86, { size: 22 }); }); });
    if (t > Lx(L, 2)) { const pts = sampleCurve(u => 820 + Math.sin(u * 13 + t) * 30 + Math.sin(u * 31) * 12, 440, 1480, 120); drawLine(ctx, pts, prog(t, Lx(L, 2), 2), C.orange, 5); txt(ctx, 'price', 420, 820, { size: 22, color: C.grey, align: 'right' }); }
    if (t > phB) { [['basket', 'Certain funds', 400], ['doc', 'Financial contracts', 1520]].forEach(([n, s, x], i) => { item(ctx, t, phB + .2 + i * .6, x, 300, { d: .5 }, () => { circ(ctx, 0, 0, 70); fs(ctx, C.white, 5); icon(ctx, n, 0, 0, n === 'basket' ? .5 : .6); tag(ctx, s, 0, 96, { size: 24, bg: C.sky }); }); arrow(ctx, x + (i ? -80 : 80), 330, x + (i ? -330 : 330), 420, E.out(prog(t, phB + .6 + i * .6, .6)), { curve: i ? .15 : -.15 }); }); }
  });
  if (t > phC - .4) {
    const col = [['goldbar', 'Owning a commodity', 'a physical resource', C.sun], ['northstar', 'Owning a company', 'part of a business', C.mint], ['certificate', 'Owning a bond', 'receives interest', C.lilac]];
    col.forEach(([n, a, b, c], i) => item(ctx, t, phC + i * .4, 420 + i * 540, 520, { d: .6 }, () => { card(ctx, 0, 0, 440, 380, { fill: C.white }); blob(ctx, 0, -60, 100, c, { seed: i, t }); icon(ctx, n, 0, -60, n === 'certificate' ? .6 : 1.1); txt(ctx, a, 0, 90, { size: 32 }); txt(ctx, b, 0, 136, { size: 26, font: 'serif' }); }));
    [690, 1230].forEach((x, i) => item(ctx, t, phC + .8 + i * .2, x, 520, { d: .4 }, () => txt(ctx, '≠', 0, 0, { size: 90, font: 'serif' })));
  }
};

// ── OTHER · private & digital ─────────────────────────────────────────────
SC.otherInv = (ctx, t, L, D) => {
  const phB = Lx(L, 3);
  fade(ctx, t, 0, phB - .3, () => {
    const cards = [['store', 'Private businesses'], ['lock', 'Private equity'], ['doc', 'Private debt'], ['chip', 'Digital assets']];
    cards.forEach(([n, s], i) => item(ctx, t, .2 + i * 1.1, 330 + i * 420, 400, { d: .6, rot: (i % 2 ? .03 : -.03) }, () => iconCard(ctx, n, s, null, { w: 370, h: 280, accent: [C.mint, C.lilac, C.sun, C.sky][i] })));
    [['COMPLEX', 380, 650, C.lilac], ['LESS LIQUID', 960, 690, C.sky], ['HIGHLY SPECULATIVE', 1540, 650, C.rose]].forEach(([s, x, y, c], i) => item(ctx, t, Lx(L, 1, .2 + i * .5), x, y, { d: .45, rot: (i - 1) * .06, sfxKind: 'stamp' }, () => tag(ctx, s, 0, 0, { size: 36, bg: c })));
    ctx.save(); ctx.translate(960, 960); ctx.scale(.45, .45); if (t > Lx(L, 2)) maya(ctx, t, { pose: 'think', expr: 'worried' }); ctx.restore();
    item(ctx, t, Lx(L, 2, .3), 1180, 800, { d: .5 }, () => tag(ctx, 'for a beginner?', 0, 0, { size: 28, bg: C.white }));
  });
  if (t > phB - .4) {
    blob(ctx, 960, 560, 250, C.sun, { seed: 221, p: prog(t, phB - .2, .8), t });
    ctx.save(); ctx.translate(960, 880); ctx.scale(.62, .62); maya(ctx, t, { pose: 'cheer', expr: 'happy' }); ctx.restore();
    const all = ['chartUp', 'certificate', 'capitol', 'basket', 'pie', 'house', 'goldbar', 'barrel', 'store', 'chip'];
    all.forEach((n, i) => { const a = i / all.length * TAU - Math.PI / 2 + t * .1; item(ctx, t, phB + i * .12, 960 + Math.cos(a) * 560, 540 + Math.sin(a) * 280, { d: .5 }, () => { circ(ctx, 0, 0, 56); fs(ctx, C.white, 4); icon(ctx, n, 0, 0, n === 'certificate' ? .3 : n === 'capitol' ? .4 : n === 'basket' ? .4 : .58); }); });
    item(ctx, t, Lx(L, 4), 960, 110, { d: .6 }, () => { card(ctx, 0, 0, 1180, 110, { fill: C.cream, r: 55 }); txt(ctx, 'Understand the asset — not just its potential return', 0, 2, { size: 40, font: 'serif' }); });
  }
};

// ── HOW MONEY IS MADE · three paths ─────────────────────────────────────
SC.threePaths = (ctx, t, L, D) => {
  fade(ctx, t, 0, Lx(L, 3, .3), () => { blob(ctx, 960, 470, 260, C.lilac, { seed: 231, p: prog(t, .1, .8), t }); ctx.save(); ctx.translate(960, 900); ctx.scale(.8, .8); maya(ctx, t, { pose: 'think', expr: 'confused' }); ctx.restore(); item(ctx, t, Lx(L, 2), 960, 180, { d: .6 }, () => { card(ctx, 0, 0, 1000, 120, { fill: C.white, r: 60 }); txt(ctx, 'How does investing generate money?', 0, 2, { size: 46, font: 'serif' }); }); });
  if (t < Lx(L, 3)) return;
  ctx.save(); ctx.translate(200, 960); ctx.scale(.55, .55); maya(ctx, t, { pose: 'present', expr: 'smile', look: 1 }); ctx.restore();
  const cols = [[700, '1', 'VALUE INCREASES', C.mint, Lx(L, 4)], [1140, '2', 'INCOME', C.sun, Lx(L, 9)], [1580, '3', 'REINVEST', C.lilac, 1e6]];
  cols.forEach(([x, n, s, c, t0], i) => {
    const on = t >= t0; item(ctx, t, Lx(L, 3, i * .3), x, 200, { d: .5, alpha: on ? 1 : .35 }, () => { rr(ctx, -190, -50, 380, 100, 50); fs(ctx, on ? c : C.white, 5); circ(ctx, -140, 0, 30); fs(ctx, C.white, 4); txt(ctx, n, -140, 2, { size: 30 }); txt(ctx, s, 30, 2, { size: 26 }); });
    if (i < 2) ctx.save(), ctx.globalAlpha = E.out(prog(t, Lx(L, 3, i * .3), .5)) * .5, ctx.setLineDash([6, 10]), line(ctx, x, 260, x, 860, 4, C.grey), ctx.restore();
  });
  item(ctx, t, Lx(L, 5), 700, 300, { d: .5 }, () => tag(ctx, 'capital appreciation', 0, 0, { size: 26, bg: C.white }));
  const g1 = E.back(prog(t, Lx(L, 6, .2), .6)), g2 = E.out(prog(t, Lx(L, 7, .2), 1));
  if (g1 > 0) { const base = 780; const h = 300 * g1, h2 = 90 * g2; rr(ctx, 620, base - h, 160, h, 12); fs(ctx, C.sky, 5); txt(ctx, '100', 700, base - h / 2, { size: 40, font: 'serif' }); if (h2 > 0) { rr(ctx, 620, base - h - h2, 160, h2, 12); fs(ctx, C.mint, 5); txt(ctx, '+30', 700, base - h - h2 / 2, { size: 30 }); } }
  item(ctx, t, Lx(L, 8, .4), 700, 840, { d: .5 }, () => txt(ctx, 'before costs & taxes', 0, 0, { font: 'hand', size: 34 }));
  [['northstar', 'Dividends', 10], ['certificate', 'Interest', 11], ['house', 'Rent', 12]].forEach(([n, s, li], i) => item(ctx, t, Lx(L, li, .2), 1140, 360 + i * 170, { d: .55 }, () => { circ(ctx, -90, 0, 60); fs(ctx, C.white, 5); icon(ctx, n, -90, 0, n === 'certificate' ? .35 : .6); txt(ctx, s, 0, 2, { size: 34, align: 'left' }); icon(ctx, 'coin', 170, 0, .4); }));
};

// ── HOW MONEY IS MADE · compounding ─────────────────────────────────────
SC.compounding = (ctx, t, L, D) => {
  const phB = Lx(L, 3), phC = Lx(L, 7);
  fade(ctx, t, 0, phB - .3, () => {
    hiText(ctx, t, Lx(L, 1), 'COMPOUNDING', 960, 130, { size: 64, hl: C.lilac });
    const cx = 960, cy = 520, R = 220; const rot = t * .6;
    ctx.save(); ctx.globalAlpha = E.out(prog(t, .3, .8)); for (let k = 0; k < 2; k++) { const a0 = rot + k * Math.PI + .3, a1 = a0 + Math.PI - .6; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ink(ctx, 10, C.purple); ctx.stroke(); const hx = cx + Math.cos(a1) * R, hy = cy + Math.sin(a1) * R; ctx.save(); ctx.translate(hx, hy); ctx.rotate(a1 + Math.PI / 2); poly(ctx, [[0, -22], [20, 4], [-20, 4]].map(([a, b]) => [b, a])); ctx.fillStyle = C.purple; ctx.fill(); ctx.restore(); } ctx.restore();
    item(ctx, t, .4, cx - R, cy, { d: .5 }, () => tag(ctx, 'Investment', 0, 0, { size: 30, bg: C.white }));
    item(ctx, t, Lx(L, 0, .5), cx + R, cy, { d: .5 }, () => tag(ctx, 'Returns', 0, 0, { size: 30, bg: C.sun }));
    item(ctx, t, Lx(L, 0, 1.4), cx, cy - R, { d: .5 }, () => tag(ctx, 'reinvested', 0, 0, { size: 28, bg: C.mint }));
    item(ctx, t, Lx(L, 2, .5), cx, cy + R + 10, { d: .5 }, () => tag(ctx, 'returns earn returns', 0, 0, { size: 28, bg: C.lilac }));
    icon(ctx, 'coin', cx + Math.cos(rot * 2) * R, cy + Math.sin(rot * 2) * R, .4);
  });
  if (t > phB - .4 && t < phC + .5) fade(ctx, t, phB - .3, phC - .3, () => {
    item(ctx, t, phB, 960, 120, { d: .5 }, () => tag(ctx, 'HYPOTHETICAL · 10% A YEAR', 0, 0, { size: 28, bg: C.sun }));
    const base = 800, k = .3;
    const col = (x, parts, label, t0) => { let y = base; parts.forEach(([v, c, s], j) => { const g = E.back(prog(t, t0 + j * .5, .5)); if (g <= 0) return; const h = v * k * g; rr(ctx, x - 110, y - h, 220, h, 10); fs(ctx, c, 5); if (s) txt(ctx, s, x, y - h / 2, { size: v > 300 ? 38 : 26 }); y -= h; }); item(ctx, t, t0, x, base + 40, { d: .4 }, () => txt(ctx, label, 0, 0, { size: 28 })); };
    col(500, [[1000, C.sky, '1,000']], 'START', phB + .2);
    col(960, [[1000, C.sky, '1,000'], [100, C.mint, '+100']], 'YEAR 1', Lx(L, 4));
    col(1420, [[1000, C.sky, '1,000'], [100, C.mint, '+100'], [110, C.lilac, '+110']], 'YEAR 2', Lx(L, 5, 2));
    item(ctx, t, Lx(L, 4, .6), 960, base - 1100 * k - 50, { d: .5 }, () => tag(ctx, '1,100', 0, 0, { size: 30, bg: C.white }));
    item(ctx, t, Lx(L, 6), 1420, base - 1210 * k - 50, { d: .5 }, () => tag(ctx, '1,210', 0, 0, { size: 34, bg: C.yellow }));
    item(ctx, t, Lx(L, 5, 4), 1700, 380, { d: .5, rot: .05 }, () => { txt(ctx, '10% of 1,100', 0, 0, { font: 'hand', size: 40 }); txt(ctx, '= 110, not 100', 0, 44, { font: 'hand', size: 40, color: C.purple }); });
  });
  if (t > phC - .4) {
    const X0 = 280, X1 = 1650, Y0 = 820, Y1 = 220; const n = 25; const vmax = 1000 * Math.pow(1.1, n);
    const vy = v => Y0 - (v / vmax) * (Y0 - Y1);
    line(ctx, X0, Y0, X1, Y0, 5); line(ctx, X0, Y0, X0, Y1, 5); txt(ctx, 'YEARS →', X1, Y0 + 36, { size: 22, align: 'right', color: C.grey });
    const p = E.inOut(prog(t, phC + .2, 3));
    const a = sampleCurve(u => vy(1000 + 100 * n * u), X0, X1, 60), b = sampleCurve(u => vy(1000 * Math.pow(1.1, n * u)), X0, X1, 60);
    const ta = drawLine(ctx, a, p, C.cyan, 8), tb = drawLine(ctx, b, p, C.purple, 9);
    if (p > .95) { tag(ctx, 'returns withdrawn', ta[0] - 160, ta[1] - 40, { size: 24, bg: C.sky }); tag(ctx, 'returns reinvested', tb[0] - 170, tb[1] + 20, { size: 24, bg: C.lilac }); }
    item(ctx, t, phC + .3, 700, 260, { d: .5 }, () => tag(ctx, 'illustration only', 0, 0, { size: 24, bg: C.white }));
  }
};

// ── HOW MONEY IS MADE · caveat ───────────────────────────────────────────
SC.caveat = (ctx, t, L, D) => {
  stamp(ctx, t, .3, 'NOT A PROMISE', 960, 150, { size: 60, rot: -.04 });
  const vals = [12, -8, 6, 15, -14, 4, 9, -3, 18, -6, 7, 3];
  if (t > Lx(L, 1)) { line(ctx, 260, 520, 1660, 520, 4, C.grey); vals.forEach((v, i) => { const g = E.back(prog(t, Lx(L, 1, .3 + i * .18), .5)); if (g <= 0) return; const x = 330 + i * 115, h = v * 14 * g; rr(ctx, x - 38, Math.min(520, 520 - h), 76, Math.abs(h), 8); fs(ctx, v > 0 ? C.mint : C.rose, 4); txt(ctx, (v > 0 ? '+' : '') + v + '%', x, v > 0 ? 520 - h - 26 : 520 - h + 26, { size: 22 }); }); txt(ctx, 'hypothetical yearly returns', 260, 290, { size: 24, align: 'left', color: C.grey }); }
  item(ctx, t, Lx(L, 2), 420, 270, { d: .5 }, () => {}); item(ctx, t, Lx(L, 2, .1), 1500, 300, { d: .5 }, () => tag(ctx, 'some years good', 0, 0, { size: 26, bg: C.mint }));
  item(ctx, t, Lx(L, 3, .1), 1560, 690, { d: .5 }, () => tag(ctx, 'some years difficult', 0, 0, { size: 26, bg: C.rose }));
  [['fees', 'Fees', C.rose], ['doc', 'Taxes', C.sun], ['thermo', 'Inflation', C.sky]].forEach(([n, s, c], i) => item(ctx, t, Lx(L, 4, .3 + i * .6), 600 + i * 360, 830, { d: .5, float: 6, seed: i }, () => { rr(ctx, -150, -50, 300, 100, 50); fs(ctx, c, 5); icon(ctx, n, -95, 0, .5, n === 'doc' ? { title: '' } : {}); txt(ctx, '− ' + s, 30, 2, { size: 30 }); }));
};

// ── RISKS · the list ─────────────────────────────────────────────────────
const RISKS = [['chartDown', 'Market risk', 'the whole market falls'], ['doc', 'Credit risk', 'borrower misses payments'], ['fees', 'Interest-rate risk', 'rates move bond values'], ['thermo', 'Inflation risk', 'money buys less'], ['exchange', 'Currency risk', 'exchange rates move'], ['hourglass', 'Liquidity risk', 'hard to sell quickly'], ['target', 'Concentration risk', 'too much in one place']];
SC.riskList = (ctx, t, L, D) => {
  const phB = Lx(L, 3);
  fade(ctx, t, 0, phB - .3, () => {
    blob(ctx, 960, 470, 260, C.rose, { seed: 241, p: prog(t, .1, .8), t, alpha: .8 });
    ctx.save(); ctx.translate(960, 900); ctx.scale(.8, .8); maya(ctx, t, { pose: t > Lx(L, 1) ? 'worried' : 'stand', expr: t > Lx(L, 1) ? 'worried' : 'smile' }); ctx.restore();
    item(ctx, t, Lx(L, 1, .3), 960, 180, { d: .6 }, () => { icon(ctx, 'warn', -260, 0, .8); txt(ctx, 'THE RISKS', 40, 4, { size: 80, font: 'serif' }); });
    [[-480, 0], [480, 40], [-400, 300], [420, 320]].forEach(([dx, dy], i) => item(ctx, t, Lx(L, 2, i * .3), 960 + dx, 420 + dy, { d: .5, float: 8, seed: i }, () => icon(ctx, 'warn', 0, 0, .7, { c: [C.yellow, C.rose, C.sun, C.peach][i] })));
  });
  if (t > phB - .4) {
    txt(ctx, 'THE RISKS', 960, 110, { size: 54, font: 'serif' });
    RISKS.forEach(([n, s, sub], i) => { const x = i < 4 ? 300 + i * 440 : 520 + (i - 4) * 440, y = i < 4 ? 360 : 680; const t0 = Lx(L, 3 + i); const active = t >= t0 && t < Lx(L, 4 + i); item(ctx, t, t0, x, y, { d: .55, s: active ? 1.07 : 1 }, () => { card(ctx, 0, 0, 400, 270, { fill: active ? C.cream : C.white, stroke: active ? 7 : 5 }); circ(ctx, 0, -50, 62); fs(ctx, active ? C.yellow : C.fog, 4); icon(ctx, n, 0, -50, n === 'doc' ? .5 : .65, n === 'doc' ? { seal: C.red } : {}); txt(ctx, s, 0, 52, { size: 32 }); txt(ctx, sub, 0, 94, { size: 24, font: 'ui', weight: 500, color: '#4A5080' }); }); });
  }
};

// ── RISKS · scams ────────────────────────────────────────────────────────
SC.scam = (ctx, t, L, D) => {
  const phB = Lx(L, 6);
  fade(ctx, t, 0, Lx(L, 2, -.2), () => { words(ctx, t, .2, 'And there is another danger…', 960, 380, { size: 70 }); item(ctx, t, Lx(L, 1), 960, 560, { d: .5, sfxKind: 'stamp' }, () => txt(ctx, 'SCAMS', 0, 0, { size: 190, font: 'serif', color: C.red })); });
  if (t > Lx(L, 2, -.3) && t < phB + .5) {
    const dis = prog(t, Lx(L, 4, .3), 1.6);
    // flashy ad, disintegrating into tiles
    const adW = 900, adH = 520, ax = 960, ay = 470;
    item(ctx, t, Lx(L, 2, -.2), ax, ay, { d: .6, rot: -.03, wig: .02 }, () => {
      const tiles = 12, trows = 7;
      for (let r = 0; r < trows; r++) for (let c = 0; c < tiles; c++) {
        const R = rng(r * 31 + c); const delay = (c / tiles) * .5 + R() * .3; const q = clamp((dis - delay) / .5); if (q >= 1) continue;
        const tx = -adW / 2 + c * adW / tiles, ty = -adH / 2 + r * adH / trows;
        ctx.save(); ctx.translate(q * (R() - .3) * 300, -q * 200 * R() + q * q * 300); ctx.globalAlpha *= 1 - q; ctx.beginPath(); ctx.rect(tx, ty, adW / tiles + .5, adH / trows + .5); ctx.clip();
        const hue = (t * 120) % 360; const g = ctx.createLinearGradient(-adW / 2, -adH / 2, adW / 2, adH / 2); g.addColorStop(0, `hsl(${hue},95%,62%)`); g.addColorStop(1, `hsl(${(hue + 80) % 360},95%,60%)`);
        rr(ctx, -adW / 2, -adH / 2, adW, adH, 30); ctx.fillStyle = g; ctx.fill(); ink(ctx, 8); ctx.stroke();
        txt(ctx, 'GUARANTEED', 0, -130, { size: 96, color: '#fff' }); txt(ctx, 'HUGE RETURNS!', 0, -20, { size: 96, color: C.yellow });
        txt(ctx, '+500% in 30 days · can’t lose!', 0, 90, { size: 44, color: '#fff' });
        rr(ctx, -170, 150, 340, 80, 40); fs(ctx, C.green, 6); txt(ctx, 'INVEST NOW', 0, 192, { size: 38, color: '#fff' });
        ctx.restore();
      }
    });
    [[-500, -230], [480, -250], [-520, 200], [500, 220]].forEach(([dx, dy], i) => item(ctx, t, Lx(L, 2, .3 + i * .15), ax + dx, ay + dy, { d: .4, s: .8 + Math.sin(t * 6 + i) * .15, alpha: 1 - dis }, () => icon(ctx, 'sparkle', 0, 0, 1, { c: [C.yellow, C.pink, C.cyan, C.yellow][i] })));
    item(ctx, t, Lx(L, 3, .1), ax, ay, { d: .45, sfxKind: 'stamp', alpha: 1 - dis, s: 2.2 }, () => icon(ctx, 'warn', 0, 0, 1, { c: C.yellow }));
    item(ctx, t, Lx(L, 4, 1.2), 960, 400, { d: .5 }, () => { card(ctx, 0, 0, 1000, 130, { fill: C.cream, r: 65 }); txt(ctx, 'Legitimate investments carry risk.', 0, 2, { size: 50, font: 'serif' }); });
    item(ctx, t, Lx(L, 5, .2), 960, 620, { d: .5 }, () => { icon(ctx, 'magnifier', -330, 0, .8); txt(ctx, 'High returns + "no risk" = scrutinise', 40, 4, { size: 40 }); });
  }
  if (t > phB - .4) {
    words(ctx, t, phB, 'No magic product — just understanding', 960, 200, { size: 66 });
    [['What do I own?', C.mint], ['Why do I own it?', C.sun], ['What could go wrong?', C.rose], ['Does it suit my circumstances?', C.sky]].forEach(([s, c], i) => item(ctx, t, Lx(L, 7, .2 + i * 1.1), 960 + (i % 2 ? 260 : -260), 420 + Math.floor(i / 2) * 200 + (i % 2) * 40, { d: .55, rot: (i % 2 ? .03 : -.03), float: 5, seed: i }, () => tag(ctx, s, 0, 0, { size: 38, bg: c })));
  }
};

// ── BEFORE INVESTING · notebook ─────────────────────────────────────────
function notebookSpread(ctx, t, t0) {
  const p = E.out(prog(t, t0, .8)); if (p <= 0) return; ctx.save(); ctx.translate(960, 500 + (1 - p) * 600); ctx.rotate(-.015);
  shadow(ctx, 40, 20, .2); rr(ctx, -760, -390, 1520, 790, 28); ctx.fillStyle = C.yellow; ctx.fill(); noShadow(ctx); ink(ctx, 6); ctx.stroke();
  rr(ctx, -740, -372, 730, 754, 14); fs(ctx, C.cream, 5); rr(ctx, 10, -372, 730, 754, 14); fs(ctx, C.cream, 5);
  ctx.save(); ctx.globalAlpha = .35; for (let i = 0; i < 15; i++) { line(ctx, -700, -290 + i * 46, -50, -290 + i * 46, 2, C.cyan); line(ctx, 50, -290 + i * 46, 700, -290 + i * 46, 2, C.cyan); } ctx.restore();
  for (let i = 0; i < 12; i++) { circ(ctx, 0, -330 + i * 62, 12); ink(ctx, 5, C.grey); ctx.stroke(); }
  ctx.restore();
}
function handWrite(ctx, t, t0, s, x, y, o = {}) { const { size = 50, col = C.navy, dur = Math.max(.6, s.length * .045) } = o; const p = prog(t, t0, dur); if (p <= 0) return; const w = tw(ctx, s, size, 'hand'); ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y - size, (w + 8) * p, size * 2); ctx.clip(); txt(ctx, s, x, y, { size, font: 'hand', align: 'left', color: col }); ctx.restore(); if (p > 0 && p < 1) SFX.add('write', t0); }
function checkbox(ctx, t, t0, x, y, done) { const p = E.back(prog(t, t0, .4)); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); rr(ctx, -16, -16, 32, 32, 6); fs(ctx, C.white, 4); if (done) { poly(ctx, [[-10, 0], [-2, 9], [14, -12]], false); ink(ctx, 6, C.green); ctx.stroke(); } ctx.restore(); }

SC.notebookA = (ctx, t, L, D) => {
  const nb = Lx(L, 2, -.4);
  if (t < nb + .8) fade(ctx, t, 0, nb, () => { blob(ctx, 960, 480, 260, C.sun, { seed: 251, p: prog(t, .1, .8), t }); ctx.save(); ctx.translate(960, 920); ctx.scale(.85, .85); maya(ctx, t, { pose: 'hold', expr: 'happy', prop: c => { c.scale(.9, .9); I.notebook(c); } }); ctx.restore(); item(ctx, t, Lx(L, 1), 1400, 380, { d: .5, rot: .05 }, () => tag(ctx, 'No rush.', 0, 0, { size: 40, font: 'serif', weight: 400, bg: C.white })); });
  notebookSpread(ctx, t, nb);
  if (t < nb + .3) return;
  handWrite(ctx, t, Lx(L, 2, .2), 'Before I invest...', 260, 190, { size: 64, col: C.purple });
  const Q = [['1. Emergency savings?', 3], ['2. Expensive debt?', 5], ['3. What am I investing for?', 7]];
  Q.forEach(([s, li], i) => { const y = 330 + i * 150; checkbox(ctx, t, Lx(L, li), 270, y - 10, false); handWrite(ctx, t, Lx(L, li, .3), s, 310, y, { size: 54 }); });
  // right page illustrations
  const q = t < Lx(L, 5) ? 0 : t < Lx(L, 7) ? 1 : 2; const qt = [Lx(L, 3), Lx(L, 5), Lx(L, 7)][q];
  const R0 = 1330, Ry = 470;
  if (t > Lx(L, 3)) {
    if (q === 0) { item(ctx, t, qt + .3, R0 - 140, Ry - 60, { d: .5 }, () => icon(ctx, 'umbrella', 0, 0, 1.6)); item(ctx, t, qt + .6, R0 + 150, Ry - 40, { d: .5 }, () => icon(ctx, 'jar', 0, 0, 1.4, { fill: .7 })); item(ctx, t, Lx(L, 4, .2), R0, Ry + 160, { d: .5 }, () => { icon(ctx, 'chartDown', -120, 0, .8); txt(ctx, 'forced to sell', 30, -10, { font: 'hand', size: 40, align: 'left' }); txt(ctx, 'at a bad time', 30, 30, { font: 'hand', size: 40, align: 'left', color: C.red }); }); }
    if (q === 1) { item(ctx, t, qt + .3, R0, Ry - 60, { d: .5 }, () => { icon(ctx, 'card', 0, 0, 2); }); item(ctx, t, qt + .8, R0 + 170, Ry - 150, { d: .5, float: 6 }, () => tag(ctx, 'HIGH INTEREST %', 0, 0, { size: 28, bg: C.rose })); item(ctx, t, Lx(L, 6, .3), R0, Ry + 160, { d: .5 }, () => txt(ctx, 'how does it fit my priorities?', 0, 0, { font: 'hand', size: 40 })); }
    if (q === 2) [['clock', 'Retirement', Lx(L, 8, 0)], ['house', 'A home', Lx(L, 8, 1.3)], ['sparkle', 'Independence', Lx(L, 9, 0)], ['question', 'Another goal', Lx(L, 9, 1.8)]].forEach(([n, s, t0], i) => item(ctx, t, t0, R0 - 160 + (i % 2) * 320, Ry - 110 + Math.floor(i / 2) * 250, { d: .5 }, () => { circ(ctx, 0, 0, 72); fs(ctx, [C.sky, C.rose, C.sun, C.lilac][i], 5); icon(ctx, n, 0, 0, .8); txt(ctx, s, 0, 110, { font: 'hand', size: 42 }); }));
  }
};

SC.notebookB = (ctx, t, L, D) => {
  notebookSpread(ctx, t, -1);
  handWrite(ctx, t, -1, 'Before I invest...', 260, 190, { size: 64, col: C.purple });
  const Q = [['4. When will I need it?', 0], ['5. Risk I can afford & tolerate?', 3], ['6. Do I understand it?', 6]];
  Q.forEach(([s, li], i) => { const y = 330 + i * 150; checkbox(ctx, t, Lx(L, li), 270, y - 10, false); handWrite(ctx, t, Lx(L, li, .3), s, 310, y, { size: 50 }); });
  // underline at end
  if (t > Lx(L, 10)) brush(ctx, [[260, 800], [880, 790]], C.pink, 8, E.out(prog(t, Lx(L, 10, .2), .8)));
  if (t > Lx(L, 10)) handWrite(ctx, t, Lx(L, 10, .4), 'worth answering first!', 330, 760, { size: 46, col: C.pink });
  const q = t < Lx(L, 3) ? 0 : t < Lx(L, 6) ? 1 : 2; const R0 = 1330, Ry = 470;
  if (q === 0) { item(ctx, t, Lx(L, 0, .4), R0, Ry - 140, { d: .5 }, () => icon(ctx, 'hourglass', 0, 0, 1.3)); item(ctx, t, Lx(L, 1), R0, Ry - 10, { d: .5 }, () => tag(ctx, 'TIME HORIZON', 0, 0, { size: 30, bg: C.sun })); if (t > Lx(L, 2)) { line(ctx, R0 - 260, Ry + 140, R0 + 260, Ry + 140, 5); item(ctx, t, Lx(L, 2, .2), R0 - 200, Ry + 100, { d: .4 }, () => txt(ctx, 'soon → steadier', 0, 0, { font: 'hand', size: 36 })); item(ctx, t, Lx(L, 2, 1), R0 + 190, Ry + 100, { d: .4 }, () => txt(ctx, 'later → more room', 0, 0, { font: 'hand', size: 36 })); const pts = sampleCurve(u => Ry + 210 + Math.sin(u * 25) * 30 * u, R0 - 260, R0 + 260, 80); drawLine(ctx, pts, prog(t, Lx(L, 2, .5), 2), C.purple, 5); } }
  if (q === 1) { const needle = (lab, v, x, t0) => item(ctx, t, t0, x, Ry - 20, { d: .5 }, () => { ctx.beginPath(); ctx.arc(0, 40, 110, Math.PI, 0); ink(ctx, 22, C.fog); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 40, 110, Math.PI, Math.PI + Math.PI * v); ink(ctx, 22, v > .6 ? C.orange : C.green); ctx.stroke(); const a = Math.PI + Math.PI * v; line(ctx, 0, 40, Math.cos(a) * 85, 40 + Math.sin(a) * 85, 7); txt(ctx, lab, 0, 110, { font: 'hand', size: 44 }); }); needle('can tolerate (feel)', .8, R0 - 170, Lx(L, 3, .6)); needle('can afford (finances)', .35, R0 + 170, Lx(L, 4, .3)); item(ctx, t, Lx(L, 4, .6), R0, Ry - 210, { d: .5 }, () => tag(ctx, 'related, but different', 0, 0, { size: 28, bg: C.white })); }
  if (q === 2) { const subs = [['What does it own?', 7, 0], ['How does it make returns?', 7, 1.4], ['What fees?', 8, 0], ['How can it lose money?', 8, 1.2], ['Who regulates it where I live?', 9, .2]]; subs.forEach(([s, li, dt], i) => { const y = Ry - 230 + i * 92; checkbox(ctx, t, Lx(L, li, dt), R0 - 280, y - 8, t > Lx(L, li, dt + 1)); handWrite(ctx, t, Lx(L, li, dt + .2), s, R0 - 240, y, { size: 42 }); }); item(ctx, t, Lx(L, 6, .6), R0 + 230, Ry + 250, { d: .5, rot: -.2 }, () => icon(ctx, 'magnifier', 0, 0, .9)); }
};

// ── CLOSING · map ─────────────────────────────────────────────────────────
SC.mapClose = (ctx, t, L, D) => {
  const phB = Lx(L, 7);
  const z = 1 + .25 * E.inOut(prog(t, 0, 3));
  ctx.save(); ctx.translate(960, 470); ctx.scale(z, z);
  item(ctx, t, .1, 0, 0, { d: .6, spin: 0 }, () => { ctx.scale(3.4, 3.4); I.laptop(ctx, { screen: C.cream }); });
  // nodes inside screen (screen ~ ±360 x -262..194)
  const N = [['chartUp', 'Stocks', -270, -185, 2], ['certificate', 'Bonds', -90, -85, 3], ['capitol', 'Gov. bonds', 90, -185, 4], ['basket', 'ETFs', 260, -85, 5], ['pie', 'Mutual funds', 250, 75, 5], ['house', 'Property', 40, 75, 6], ['goldbar', 'Commodities', -180, 75, 6]];
  if (t > .5) { for (let i = 0; i < N.length - 1; i++) { const a = N[i], b = N[i + 1]; const p = E.out(prog(t, .8 + i * .25, .5)); ctx.save(); ctx.setLineDash([6, 8]); drawLine(ctx, [[a[2], a[3]], [b[2], b[3]]], p, C.grey, 4); ctx.restore(); } }
  N.forEach(([n, s, x, y, li], i) => { const lit = t >= Lx(L, li) && t < Lx(L, phB === 1e6 ? 99 : 7); item(ctx, t, .6 + i * .25, x, y, { d: .5, s: lit ? 1.18 : 1 }, () => { circ(ctx, 0, 0, 46); fs(ctx, lit ? C.yellow : C.white, 4); icon(ctx, n, 0, 0, n === 'certificate' ? .26 : n === 'capitol' ? .32 : n === 'basket' ? .32 : .5); txt(ctx, s, 0, 66, { size: 20 }); }); });
  ctx.restore();
  if (t > phB - .3) { const a = E.out(prog(t, phB - .3, .6)); ctx.save(); ctx.globalAlpha = a * .82; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.translate(960, 940); ctx.scale(.75, .75); item(ctx, t, phB, 0, 0, { d: .6, spin: 0, from: [0, 500] }, () => maya(ctx, t, { pose: 'present', expr: 'happy', look: 1 })); ctx.restore();
    words(ctx, t, Lx(L, 8), "Not whatever everyone's talking about —", 960, 170, { size: 60 });
    [['Understand the asset', 420, 380, C.mint], ['Know your goal', 1500, 380, C.sun], ['Decide what suits you', 960, 560, C.sky]].forEach(([s, x, y, c], i) => item(ctx, t, Lx(L, 9, .3 + i * 1.3), i === 2 ? 1480 : x, i === 2 ? 600 : y, { d: .55, float: 5, seed: i, rot: (i - 1) * .04 }, () => tag(ctx, s, 0, 0, { size: 40, bg: c })));
  }
};

// ── CLOSING · next episode ────────────────────────────────────────────────
SC.nextEp = (ctx, t, L, D) => {
  const endT = Lx(L, 4, -.3);
  const z = 1 + 1.6 * E.inOut(prog(t, .2, Math.max(1, Lx(L, 1) - .2)));
  if (t < endT + 1) {
    blob(ctx, 960, 470, 300 * Math.min(z, 1.6), C.sky, { seed: 261, p: prog(t, .1, .8), t });
    const sh = E.inOut(prog(t, Lx(L, 1, -.3), .8)); ctx.save(); ctx.translate(960, lerp(470, 270, sh)); ctx.scale(lerp(z * .9, 1.9, sh), lerp(z * .9, 1.9, sh)); ctx.rotate(Math.sin(t * .8) * .05); sharePiece(ctx, 300); ctx.restore();
    item(ctx, t, Lx(L, 1), 960, 520, { d: .6 }, () => txt(ctx, 'STOCKS', 0, 0, { size: 170, font: 'serif' }));
    const T = ['How stock markets work', 'Why companies issue shares', 'How people buy & sell', 'What moves share prices', 'Owning part of a business'];
    T.forEach((s, i) => { const a = i / T.length * TAU - Math.PI / 2 + t * .06; item(ctx, t, Lx(L, 2, .3 + i * 1.2), 960 + Math.cos(a) * 640, 470 + Math.sin(a) * 300, { d: .5, float: 5, seed: i }, () => tag(ctx, s, 0, 0, { size: 30, bg: [C.mint, C.sun, C.rose, C.lilac, C.peach][i] })); });
    if (t > Lx(L, 3)) { ctx.save(); ctx.translate(1660, 980); ctx.scale(.55, .55); item(ctx, t, Lx(L, 3), 0, 0, { d: .6, spin: 0, from: [500, 0] }, () => maya(ctx, t, { pose: 'think', expr: 'smile', look: -1 })); ctx.restore(); }
  }
  // end card
  const e = E.inOut(prog(t, endT, 1));
  if (e > 0) {
    ctx.save(); ctx.globalAlpha = e; ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    blob(ctx, 1560, 240, 180, C.navy2, { seed: 5, t }); blob(ctx, 300, 860, 140, C.navy2, { seed: 6, t });
    item(ctx, t, endT + .5, 960, 380, { d: .5 }, () => tag(ctx, "MAYA'S FINANCIAL DECISIONS", 0, 0, { size: 34, bg: C.yellow }));
    words(ctx, t, endT + .9, 'Next: How does the', 960, 520, { size: 92, color: C.cream });
    words(ctx, t, endT + 1.2, 'stock market work?', 960, 630, { size: 92, color: C.cream });
    marker(ctx, t, endT + 2, 960 - 300, 690, 600, 14, C.pink);
    ctx.restore();
  }
  const fb = prog(t, D - 1.6, 1.4); if (fb > 0) { ctx.fillStyle = `rgba(0,0,0,${fb})`; ctx.fillRect(0, 0, W, H); }
};
