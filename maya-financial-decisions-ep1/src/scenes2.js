// ───────────────────────────────────────────────────────────────────────────
//  Scenes 2: Part 3 (stocks) · Part 4 (bonds) · Part 5 (gov bonds) · Part 6 (ETFs)
// ───────────────────────────────────────────────────────────────────────────

// ── STOCKS · company → shares ────────────────────────────────────────────
function shareCircle(ctx, cx, cy, R, p, t, o = {}) {
  const rings = 6, seg = 36; const r0 = R * .18;
  for (let r = 0; r < rings; r++) for (let s = 0; s < seg; s++) {
    const k = r * seg + s; const pk = clamp(p * 1.4 - (k / (rings * seg)) * .4); if (pk <= 0) continue;
    if (o.skip && r === rings - 1 && s === 4) continue;
    const a0 = s / seg * TAU - Math.PI / 2, a1 = (s + 1) / seg * TAU - Math.PI / 2; const ra = r0 + (R - r0) * r / rings, rb = r0 + (R - r0) * (r + 1) / rings;
    ctx.beginPath(); ctx.arc(cx, cy, rb, a0, a1); ctx.arc(cx, cy, ra, a1, a0, true); ctx.closePath();
    ctx.fillStyle = [C.sky, C.cyan, '#8FDCF4', C.sky][(r + s) % 4]; ctx.globalAlpha = pk; ctx.fill(); ink(ctx, 2.5); ctx.stroke(); ctx.globalAlpha = 1;
  }
  circ(ctx, cx, cy, r0); fs(ctx, C.navy, 4); star(ctx, cx, cy, r0 * .6, r0 * .25, 4); ctx.fillStyle = C.yellow; ctx.fill();
}
function sharePiece(ctx, R = 300) { const rings = 6, seg = 36, r0 = R * .18; const r = rings - 1, s = 4; const a0 = s / seg * TAU - Math.PI / 2, a1 = (s + 1) / seg * TAU - Math.PI / 2; const ra = r0 + (R - r0) * r / rings, rb = R; const mid = (a0 + a1) / 2, mr = (ra + rb) / 2; ctx.save(); ctx.translate(-Math.cos(mid) * mr, -Math.sin(mid) * mr); ctx.beginPath(); ctx.arc(0, 0, rb, a0, a1); ctx.arc(0, 0, ra, a1, a0, true); ctx.closePath(); fs(ctx, C.yellow, 4); ctx.restore(); }

SC.company = (ctx, t, L, D) => {
  const phB = Lx(L, 3), phC = Lx(L, 5);
  // phase A — what a stock is
  fade(ctx, t, 0, phB - .5, () => {
    blob(ctx, 960, 470, 300, C.mint, { seed: 101, p: prog(t, .1, .8), t });
    words(ctx, t, .3, 'STOCKS', 960, 420, { size: 150, font: 'serif' });
    [['SHARES', 700, C.sun], ['EQUITIES', 1220, C.rose]].forEach(([s, x, c], i) => item(ctx, t, Lx(L, 1, .3 + i * .5), x, 590, { d: .5, rot: i ? .05 : -.05 }, () => tag(ctx, s, 0, 0, { size: 40, bg: c })));
    item(ctx, t, Lx(L, 2, .4), 960, 760, { d: .5 }, () => tag(ctx, 'a small ownership interest', 0, 0, { size: 34, font: 'serif', weight: 400, bg: C.white }));
  });
  // phase B — Northstar
  const toCircle = E.inOut(prog(t, phC, 1.2));
  if (t > phB - .6 && toCircle < 1) {
    ctx.save(); ctx.globalAlpha = 1 - toCircle; const s = 1 - toCircle * .5;
    blob(ctx, 960, 470, 280, C.sky, { seed: 102, p: prog(t, phB - .4, .8), t });
    item(ctx, t, phB - .3, 960, 500, { d: .7, s }, () => { ctx.scale(2.1, 2.1); I.office(ctx, { c: C.white }); ctx.save(); ctx.translate(0, -112); ctx.scale(.42, .42); I.northstar(ctx); ctx.restore(); });
    item(ctx, t, phB + .3, 960, 160, { d: .5 }, () => tag(ctx, 'NORTHSTAR TECHNOLOGIES', 0, 0, { size: 34, bg: C.yellow }));
    const ac = [['laptop', 'Software', 500, 360, .55], ['people', 'Employees', 1420, 360, 1], ['cart', 'Products', 500, 680, 1], ['coinStack', 'Revenue', 1420, 680, 1]];
    ac.forEach(([n, s2, x, y, sc], i) => item(ctx, t, Lx(L, 4, i * .55), x, y, { d: .5, float: 8, seed: i }, () => { circ(ctx, 0, 0, 80); fs(ctx, C.white, 5); icon(ctx, n, 0, 0, sc); tag(ctx, s2, 0, 104, { size: 26 }); }));
    ctx.restore();
  }
  // phase C — divided into shares, one piece to Maya
  if (t > phC) {
    const cx = 780, cy = 500, R = 300; const fly = E.inOut(prog(t, Lx(L, 6, .3), 1.3));
    shareCircle(ctx, cx, cy, R, prog(t, phC + .4, 1.8), t, { skip: fly > 0 });
    ctx.save(); ctx.translate(1520, 940); ctx.scale(.78, .78); item(ctx, t, Lx(L, 6), 0, 0, { d: .7, spin: 0, from: [600, 0] }, () => maya(ctx, t, { pose: 'hold', expr: fly >= 1 ? 'happy' : 'smile', look: -1 })); ctx.restore();
    if (fly > 0) { const rings = 6, seg = 36, r0 = R * .18; const mid = (4.5 / seg) * TAU - Math.PI / 2, mr = (r0 + (R - r0) * 5 / 6 + R) / 2; const sx = cx + Math.cos(mid) * mr, sy = cy + Math.sin(mid) * mr; const ex = 1520, ey = 870; const x = lerp(sx, ex, fly), y = lerp(sy, ey, fly) - Math.sin(fly * Math.PI) * 220; ctx.save(); ctx.translate(x, y); ctx.rotate(fly * .6); ctx.scale(1 + Math.sin(fly * Math.PI) * .6, 1 + Math.sin(fly * Math.PI) * .6); sharePiece(ctx, R); ctx.restore(); if (fly > .2 && fly < .3) SFX.add('whoosh', Lx(L, 6, .5)); }
    hiText(ctx, t, Lx(L, 6, .8), 'STOCK = OWNERSHIP IN A COMPANY', 960, 120, { size: 56 });
    item(ctx, t, Lx(L, 7), 1520, 460, { d: .5, float: 6 }, () => tag(ctx, 'SHAREHOLDER', 0, 0, { size: 30, bg: C.mint }));
    item(ctx, t, Lx(L, 5, .8), cx, cy + R + 50, { d: .5 }, () => tag(ctx, 'thousands of shares', 0, 0, { size: 26 }));
  }
};

// ── STOCKS · share price 20 → 30 → 15 ────────────────────────────────────
SC.sharePrice = (ctx, t, L, D) => {
  const X0 = 250, X1 = 1380, Y0 = 790, Y1 = 230; const vy = v => Y0 - (v / 40) * (Y0 - Y1);
  fade(ctx, t, 0, Lx(L, 1, 1.2), () => { words(ctx, t, .2, 'Why buy a share?', 960, 470, { size: 100 }); });
  item(ctx, t, Lx(L, 1, .2), 1690, 470, { d: .5, t1: Lx(L, 2), out: 'shrink' }, () => { circ(ctx, 0, 0, 90); fs(ctx, C.sun); icon(ctx, 'chartUp', 0, 0, 1); });
  item(ctx, t, Lx(L, 1, .9), 1690, 620, { d: .5, t1: Lx(L, 2), out: 'shrink' }, () => tag(ctx, 'performs well + optimism', 0, 0, { size: 24 }));
  if (t < Lx(L, 1, 1)) return;
  const ax = E.out(prog(t, Lx(L, 1, 1), .8));
  ctx.save(); ctx.globalAlpha = ax;
  line(ctx, X0, Y0, X0 + (X1 - X0) * ax, Y0, 5); line(ctx, X0, Y0, X0, Y0 - (Y0 - Y1) * ax, 5);
  [10, 20, 30].forEach(v => { ctx.save(); ctx.setLineDash([6, 10]); line(ctx, X0, vy(v), X1, vy(v), 2, C.grey); ctx.restore(); txt(ctx, String(v), X0 - 24, vy(v), { size: 26, align: 'right', color: C.grey }); });
  txt(ctx, 'SHARE PRICE', X0, Y1 - 40, { size: 24, align: 'left', ls: 2 }); txt(ctx, 'TIME →', X1, Y0 + 36, { size: 22, align: 'right', color: C.grey });
  ctx.restore();
  // path
  const R = rng(4); const pts = []; const N = 60;
  for (let i = 0; i <= N; i++) { const u = i / N; let v = u < .45 ? lerp(20, 30, E.sine(u / .45)) : lerp(30, 15, E.sine((u - .45) / .55)); if (i > 0 && i < N && Math.abs(u - .45) > .02) v += (R() - .5) * 2.4; pts.push([lerp(X0 + 30, X1 - 20, u), vy(v)]); }
  const pA = E.inOut(prog(t, Lx(L, 3), 2.2)) * .45; const pB = E.inOut(prog(t, Lx(L, 6), 3)) * .55;
  const p = pA + pB; const upPts = pts.slice(0, Math.round(N * .45) + 1), dnPts = pts.slice(Math.round(N * .45));
  if (t > Lx(L, 2)) {
    drawLine(ctx, upPts, p / .45, C.green, 9); if (p > .45) drawLine(ctx, dnPts, (p - .45) / .55, C.red, 9);
    const tipIdx = Math.min(N, p * N); const i0 = Math.floor(tipIdx), f = tipIdx - i0; const tip = i0 >= N ? pts[N] : [lerp(pts[i0][0], pts[i0 + 1][0], f), lerp(pts[i0][1], pts[i0 + 1][1], f)];
    item(ctx, t, Lx(L, 2), pts[0][0], pts[0][1], { d: .5 }, () => { circ(ctx, 0, 0, 14); fs(ctx, C.yellow, 4); tag(ctx, 'BUY · 20', 0, 50, { size: 24, bg: C.white }); });
    circ(ctx, tip[0], tip[1], 13); fs(ctx, C.white, 5);
    const pk = pts[Math.round(N * .45)];
    item(ctx, t, Lx(L, 3, 2), pk[0], pk[1], { d: .5 }, () => { circ(ctx, 0, 0, 14); fs(ctx, C.green, 4); tag(ctx, '30', 0, -48, { size: 26, bg: C.mint }); });
    if (t > Lx(L, 4)) { const gp = E.out(prog(t, Lx(L, 4), .7)); ctx.save(); ctx.setLineDash([8, 8]); line(ctx, pk[0] + 40, vy(20), pk[0] + 40, lerp(vy(20), vy(30), gp), 5, C.green); ctx.restore(); item(ctx, t, Lx(L, 4, .5), pk[0] + 150, vy(25), { d: .5, t1: Lx(L, 6), out: 'shrink' }, () => { tag(ctx, '+10 gain', 0, 0, { size: 32, bg: C.mint }); txt(ctx, 'before fees & taxes', 0, 46, { font: 'hand', size: 34 }); }); }
    item(ctx, t, Lx(L, 7, .2), pts[N][0], pts[N][1], { d: .5 }, () => { circ(ctx, 0, 0, 14); fs(ctx, C.red, 4); tag(ctx, '15', 0, 48, { size: 26, bg: C.rose }); });
    item(ctx, t, Lx(L, 7, .8), 1180, vy(36), { d: .5 }, () => tag(ctx, '−5 vs. what she paid', 0, 0, { size: 28, bg: C.rose }));
    if (t > Lx(L, 8)) { const dp = E.in(prog(t, Lx(L, 8, .3), 1.2)); ctx.save(); ctx.setLineDash([10, 10]); line(ctx, pts[N][0], pts[N][1], pts[N][0], lerp(pts[N][1], Y0, dp), 6, C.red); ctx.restore(); item(ctx, t, Lx(L, 8, 1.4), pts[N][0] - 10, Y0 - 90, { d: .5 }, () => icon(ctx, 'warn', 0, 0, .8, { c: C.rose })); }
  }
  // Maya reacting
  const ex = t < Lx(L, 3, 1.5) ? 'smile' : t < Lx(L, 6) ? 'happy' : 'worried';
  ctx.save(); ctx.translate(1680, 960); ctx.scale(.6, .6); item(ctx, t, Lx(L, 2), 0, 0, { d: .6, spin: 0, from: [500, 0] }, () => maya(ctx, t, { pose: ex === 'happy' ? 'cheer' : ex === 'worried' ? 'worried' : 'stand', expr: ex, look: -1 })); ctx.restore();
};

// ── STOCKS · dividends ───────────────────────────────────────────────────
SC.dividends = (ctx, t, L, D) => {
  const phB = Lx(L, 4), phC = Lx(L, 8);
  fade(ctx, t, 0, phB - .4, () => {
    blob(ctx, 960, 330, 200, C.sun, { seed: 111, p: prog(t, .1, .8), t });
    item(ctx, t, .2, 960, 330, { d: .6 }, () => { icon(ctx, 'northstar', 0, 0, 2.3); });
    item(ctx, t, .5, 960, 115, { d: .5 }, () => tag(ctx, 'NORTHSTAR PROFITS', 0, 0, { size: 28, bg: C.white }));
    const xs = [540, 750, 1170, 1380]; const stop = Lx(L, 3, .5);
    xs.forEach((x, i) => { item(ctx, t, .4 + i * .15, x, 790, { d: .5, spin: 0 }, () => { ctx.scale(.9, .9); bust(ctx, { c: [C.cyan, C.green, C.purple, C.orange][i], skin: [C.peach, C.skin, '#E3A77E', C.skinS][i] }); }); flow(ctx, t, Lx(L, 0, .5), stop, [960, 420], [x, 660], { rate: .7, n: 3, lift: 40, size: .3 }); });
    ctx.save(); ctx.translate(960, 880); ctx.scale(.42, .42); maya(ctx, t, { pose: 'stand', expr: t > Lx(L, 3) ? 'neutral' : 'happy' }); ctx.restore(); flow(ctx, t, Lx(L, 0, .5), stop, [960, 420], [960, 690], { rate: .7, n: 3, lift: 10, size: .3 });
    item(ctx, t, Lx(L, 1, .3), 400, 330, { d: .6, rot: -.04 }, () => { card(ctx, 0, 0, 470, 200, { fill: C.cream }); txt(ctx, 'DIVIDEND', 0, -50, { size: 36 }); ['part of profits (or other', 'funds) paid to shareholders'].forEach((s, i) => txt(ctx, s, 0, 6 + i * 40, { size: 30, font: 'serif' })); });
    item(ctx, t, Lx(L, 2, .2), 1520, 330, { d: .6, rot: .04 }, () => { card(ctx, 0, 0, 400, 200, { fill: C.white }); icon(ctx, 'office', -120, 0, .8); txt(ctx, 'No dividend', 70, -10, { size: 30 }); txt(ctx, 'policy', 70, 30, { size: 30 }); line(ctx, -170, -70, -70, 70, 8, C.red); });
    stamp(ctx, t, Lx(L, 3, 1.2), 'NOT REQUIRED TO CONTINUE', 960, 560, { size: 40 });
  });
  if (t > phB - .5 && t < phC + .5) fade(ctx, t, phB - .4, phC - .3, () => {
    words(ctx, t, phB, 'Two ways she may benefit', 960, 170, { size: 72 });
    item(ctx, t, Lx(L, 5), 620, 520, { d: .6, rot: -.03 }, () => { card(ctx, 0, 0, 560, 400, { fill: C.white }); blob(ctx, 0, -60, 110, C.mint, { seed: 1, t }); icon(ctx, 'chartUp', 0, -60, 1.3); txt(ctx, '1', -230, -150, { size: 60, font: 'serif' }); txt(ctx, 'Share price may rise', 0, 120, { size: 36 }); });
    item(ctx, t, Lx(L, 6), 1300, 520, { d: .6, rot: .03 }, () => { card(ctx, 0, 0, 560, 400, { fill: C.white }); blob(ctx, 0, -60, 110, C.sun, { seed: 2, t }); icon(ctx, 'coinStack', 0, -60, 1.3); txt(ctx, '2', -230, -150, { size: 60, font: 'serif' }); txt(ctx, 'Company may pay dividends', 0, 120, { size: 34 }); });
    stamp(ctx, t, Lx(L, 7, .2), 'NOT GUARANTEED', 960, 560, { size: 66, rot: -.08 });
  });
  if (t > phC - .4) {
    words(ctx, t, phC, 'Long-term growth… but volatile', 960, 180, { size: 72 });
    const amp = 1 + 1.6 * E.inOut(prog(t, Lx(L, 9), 1.5)); const R = rng(9); const vals = []; let v = 0; for (let i = 0; i <= 80; i++) { v += (R() - .48) * 26; vals.push(v); }
    const pts = vals.map((v2, i) => [160 + i * 20, 560 - v2 * .6 * amp + Math.sin(t * 2 + i) * 4 * amp - i * 2.2]);
    drawLine(ctx, pts, E.inOut(prog(t, phC + .2, 2.5)), C.navy, 8);
    item(ctx, t, Lx(L, 9, .4), 1600, 330, { d: .5, wig: .15, seed: 3 }, () => tag(ctx, 'UP & DOWN', 0, 0, { size: 34, bg: C.rose }));
  }
};

// ── BONDS · the deal ──────────────────────────────────────────────────────
SC.bondDeal = (ctx, t, L, D) => {
  fade(ctx, t, 0, Lx(L, 2, -.2), () => { blob(ctx, 960, 470, 260, C.mint, { seed: 121, p: prog(t, .1, .8), t }); item(ctx, t, Lx(L, 1), 960, 470, { d: .6 }, () => txt(ctx, 'BONDS', 0, 0, { size: 170, font: 'serif' })); item(ctx, t, .3, 960, 680, { d: .5, t1: Lx(L, 1), out: 'shrink' }, () => tag(ctx, 'something very different', 0, 0, { size: 34, font: 'serif', weight: 400 })); });
  if (t < Lx(L, 2, -.3)) return;
  blob(ctx, 420, 600, 230, C.lilac, { seed: 122, p: prog(t, Lx(L, 2, -.2), .8), t });
  blob(ctx, 1480, 520, 260, C.sky, { seed: 123, p: prog(t, Lx(L, 2), .8), t });
  const give = E.inOut(prog(t, Lx(L, 2, 1.2), 1.4));
  ctx.save(); ctx.translate(420, 940); ctx.scale(.78, .78); maya(ctx, t, { pose: give < 1 ? 'give' : 'hold', expr: 'smile', look: 1, prop: give <= 0 ? (c => { c.scale(.9, .9); I.bill(c); }) : null }); ctx.restore();
  if (give > 0 && give < 1) { const x = lerp(625, 1300, give), y = lerp(850, 560, give) - Math.sin(give * Math.PI) * 180; icon(ctx, 'bill', x, y, .9); }
  arrow(ctx, 700, 380, 1240, 380, E.out(prog(t, Lx(L, 2, .8), .8)), { curve: -.12 }); item(ctx, t, Lx(L, 2, 1.2), 970, 270, { d: .5 }, () => tag(ctx, 'LENDS MONEY', 0, 0, { size: 30, bg: C.yellow }));
  const isu = t < Lx(L, 3, 1.2) ? 0 : t < Lx(L, 3, 2.4) ? 1 : 2;
  item(ctx, t, Lx(L, 2, .2), 1480, 560, { d: .6 }, () => { ctx.scale(1.7, 1.7); if (isu === 0) I.office(ctx); else if (isu === 1) { ctx.scale(.8, .8); I.capitol(ctx); } else { ctx.scale(1.3, 1.3); I.factory(ctx); } });
  item(ctx, t, Lx(L, 2, .4), 1480, 790, { d: .5 }, () => tag(ctx, ['ISSUER · a company', 'ISSUER · a government', 'ISSUER · another issuer'][isu], 0, 0, { size: 28, bg: C.white }));
  // bond returns to Maya
  const back = E.inOut(prog(t, Lx(L, 4), 1.4));
  if (back > 0) { const x = lerp(1480, 470, back), y = lerp(560, 760, back) - Math.sin(back * Math.PI) * 200; ctx.save(); ctx.translate(x, y); ctx.rotate(-.06); ctx.scale(lerp(.6, .9, back), lerp(.6, .9, back)); I.certificate(ctx); ctx.restore(); arrow(ctx, 1240, 470, 700, 470, E.out(prog(t, Lx(L, 4, .3), .8)), { curve: -.12, col: C.purple }); }
  item(ctx, t, Lx(L, 4, 2.4), 960, 620, { d: .5 }, () => { tag(ctx, '+ interest', -150, 0, { size: 30, bg: C.mint }); tag(ctx, 'principal back at maturity', 120, 70, { size: 30, bg: C.sun }); });
};

// ── BONDS · 5-year timeline ──────────────────────────────────────────────
SC.bondTimeline = (ctx, t, L, D) => {
  blob(ctx, 300, 400, 210, C.sun, { seed: 131, p: prog(t, .1, .8), t });
  item(ctx, t, .3, 300, 380, { d: .6, rot: -.05 }, () => { ctx.scale(1.05, 1.05); I.certificate(ctx, { title: 'BOND' }); });
  [['Face value · 1,000', C.white, 1], ['Fixed rate · 5% a year', C.mint, 2], ['Matures in 5 years', C.sky, 2]].forEach(([s, c, li], i) => item(ctx, t, Lx(L, li, i === 2 ? 1.6 : .3), 300, 560 + i * 72, { d: .5 }, () => tag(ctx, s, 0, 0, { size: 28, bg: c })));
  const X0 = 620, X1 = 1760, BY = 700; const xs = i => lerp(X0 + 90, X1 - 60, i / 4);
  if (t > Lx(L, 2)) {
    arrow(ctx, X0, BY, X1 + 40, BY, E.out(prog(t, Lx(L, 2), .9)), { lw: 6 });
    for (let i = 0; i < 5; i++) item(ctx, t, Lx(L, 2, .4 + i * .15), xs(i), BY + 50, { d: .4 }, () => txt(ctx, 'YEAR ' + (i + 1), 0, 0, { size: 24, color: C.grey }));
  }
  for (let i = 0; i < 5; i++) {
    const t0 = Lx(L, 3, .6 + i * .55); const g = E.back(prog(t, t0, .5)); if (g <= 0) continue;
    const h = 60 * g; rr(ctx, xs(i) - 44, BY - h, 88, h, 10); fs(ctx, C.mint, 5);
    item(ctx, t, t0 + .2, xs(i), BY - 110, { d: .5 }, () => { icon(ctx, 'coin', 0, 0, .55); tag(ctx, '+50', 0, -62, { size: 24, bg: C.white }); });
  }
  const pt = Lx(L, 4, .8); const pg = E.out(prog(t, pt, 1.2));
  if (pg > 0) { const h = 400 * pg; rr(ctx, xs(4) - 44, BY - 60 - h, 88, h, 10); fs(ctx, C.yellow, 5); item(ctx, t, pt + .9, xs(4) - 200, BY - 380, { d: .5 }, () => { tag(ctx, '1,000 principal back', 0, 0, { size: 28, bg: C.sun }); }); }
  item(ctx, t, Lx(L, 4, 3), 1080, 270, { d: .6 }, () => { card(ctx, 0, 0, 470, 150, { fill: C.cream }); txt(ctx, 'TOTAL RECEIVED', 0, -30, { size: 24, color: C.grey }); txt(ctx, '250 + 1,000 = 1,250', 0, 22, { size: 40, font: 'serif' }); });
  item(ctx, t, Lx(L, 4, 3.3), 1080, 380, { d: .5 }, () => txt(ctx, 'assuming the issuer pays', 0, 0, { font: 'hand', size: 36 }));
};

// ── BONDS · variations, lender vs owner ──────────────────────────────────
SC.bondTypes = (ctx, t, L, D) => {
  const phB = Lx(L, 6);
  fade(ctx, t, 0, phB - .4, () => {
    item(ctx, t, .2, 960, 130, { d: .5 }, () => tag(ctx, 'SIMPLIFIED EXAMPLE · CONVENTIONAL FIXED-RATE BOND', 0, 0, { size: 26, bg: C.sun }));
    words(ctx, t, Lx(L, 1), 'Real bonds come in different shapes', 960, 250, { size: 66 });
    const cards = [['calendar', 'Different intervals', 'twice a year, quarterly…', C.rose, { label: '½' }], ['chartUp', 'Variable rates', 'interest moves with a benchmark', C.mint, { c: C.purple }], ['fees', 'Sold at a discount', 'return paid at maturity', C.sun, {}], ['hourglass', 'No regular interest', 'nothing paid along the way', C.lilac, {}]];
    cards.forEach(([n, ti, sub, ac, o], i) => item(ctx, t, Lx(L, 2 + i, .2), 330 + i * 420, 560, { d: .6, rot: (i % 2 ? .02 : -.02), float: 6, seed: i }, () => iconCard(ctx, n, ti, sub, { w: 370, h: 330, accent: ac, ic: o })));
  });
  if (t > phB - .5) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(960, 140); ctx.lineTo(960, 820); ink(ctx, 4, C.grey); ctx.setLineDash([6, 12]); ctx.globalAlpha = E.out(prog(t, phB, .6)); ctx.stroke(); ctx.restore();
    blob(ctx, 500, 520, 260, C.mint, { seed: 141, p: prog(t, phB, .8), t }); blob(ctx, 1420, 520, 260, C.lilac, { seed: 142, p: prog(t, phB + .3, .8), t });
    item(ctx, t, phB, 500, 160, { d: .5 }, () => tag(ctx, 'STOCK → OWNER', 0, 0, { size: 36, bg: C.white }));
    item(ctx, t, phB + .4, 1420, 160, { d: .5 }, () => tag(ctx, 'BOND → LENDER', 0, 0, { size: 36, bg: C.yellow }));
    ctx.save(); ctx.translate(430, 900); ctx.scale(.66, .66); item(ctx, t, phB + .2, 0, 0, { d: .6, spin: 0 }, () => maya(ctx, t, { pose: 'hold', expr: 'smile', prop: c => { c.scale(.9, .9); sharePiece(c); } })); ctx.restore();
    item(ctx, t, phB + .4, 640, 400, { d: .5 }, () => icon(ctx, 'northstar', 0, 0, .9));
    ctx.save(); ctx.translate(1350, 900); ctx.scale(.66, .66); item(ctx, t, phB + .6, 0, 0, { d: .6, spin: 0 }, () => maya(ctx, t, { pose: 'hold', expr: 'smile', prop: c => { c.scale(.6, .6); I.certificate(c); } })); ctx.restore();
    item(ctx, t, phB + .8, 1600, 400, { d: .5 }, () => icon(ctx, 'office', 0, 0, .9));
    item(ctx, t, Lx(L, 7, .3), 1420, 280, { d: .5, float: 6 }, () => tag(ctx, 'a CREDITOR', 0, 0, { size: 30, bg: C.mint }));
  }
};

// ── BONDS · risks ────────────────────────────────────────────────────────
SC.bondRisks = (ctx, t, L, D) => {
  words(ctx, t, .2, 'Bonds are not risk-free', 960, 150, { size: 80 });
  const phB = Lx(L, 4);
  fade(ctx, t, 0, phB - .3, () => {
    // default
    item(ctx, t, Lx(L, 1), 380, 540, { d: .6 }, () => { card(ctx, 0, 0, 480, 470, { fill: C.white }); icon(ctx, 'office', -50, -50, 1.3); icon(ctx, 'coin', 90, 10, .8, { c: C.fog }); line(ctx, 60, -20, 120, 40, 7, C.red); line(ctx, 120, -20, 60, 40, 7, C.red); txt(ctx, 'Missed payments', 0, 150, { size: 32 }); txt(ctx, 'credit / default risk', 0, 192, { size: 24, font: 'ui', weight: 500, color: C.grey }); });
    // interest-rate seesaw
    item(ctx, t, Lx(L, 2), 960, 540, { d: .6 }, () => {
      card(ctx, 0, 0, 480, 470, { fill: C.white }); const tilt = Math.sin(clamp((t - Lx(L, 2, .6)) / 1.2) * Math.PI / 2) * .32;
      poly(ctx, [[-20, 60], [20, 60], [0, 20]]); fs(ctx, C.navy2, 4);
      ctx.save(); ctx.translate(0, 18); ctx.rotate(-tilt); rr(ctx, -180, -8, 360, 16, 8); fs(ctx, C.yellow, 4);
      ctx.save(); ctx.translate(-150, -50); ctx.rotate(tilt); txt(ctx, 'RATES', 0, -6, { size: 22 }); txt(ctx, '↑', 0, 26, { size: 34, color: C.green }); ctx.restore();
      ctx.save(); ctx.translate(150, -50); ctx.rotate(tilt); ctx.scale(.36, .36); I.certificate(ctx); ctx.restore(); ctx.restore();
      txt(ctx, 'Bond prices fall', 0, 150, { size: 32 }); txt(ctx, 'interest-rate risk', 0, 192, { size: 24, font: 'ui', weight: 500, color: C.grey });
    });
    // inflation
    item(ctx, t, Lx(L, 3), 1540, 540, { d: .6 }, () => { card(ctx, 0, 0, 480, 470, { fill: C.white }); const sh = 1 - .45 * E.inOut(prog(t, Lx(L, 3, .8), 1.5)); icon(ctx, 'coinStack', -110, -40, 1); txt(ctx, '=', -20, -40, { size: 60 }); ctx.save(); ctx.translate(100, -30); ctx.scale(sh, sh); I.cart(ctx); ctx.restore(); icon(ctx, 'thermo', 190, -120, .5); txt(ctx, 'Buys less later', 0, 150, { size: 32 }); txt(ctx, 'inflation risk', 0, 192, { size: 24, font: 'ui', weight: 500, color: C.grey }); });
  });
  if (t > phB - .4) {
    const meter = (x, lab, amp, c) => { card(ctx, x, 540, 620, 380, { fill: C.white }); txt(ctx, lab, x, 400, { size: 40, font: 'serif' }); const pts = []; for (let i = 0; i <= 60; i++) pts.push([x - 260 + i * 520 / 60, 580 + Math.sin(i * .7 + t * 3) * amp * Math.sin(i * .23 + 1) + Math.sin(i * 1.9 + t * 4) * amp * .3]); drawLine(ctx, pts, E.out(prog(t, phB, 1.2)), c, 7); };
    item(ctx, t, phB, 560, 0, { d: .5, spin: 0 }, () => meter(0, 'Shares', 60, C.red));
    item(ctx, t, phB + .3, 1360, 0, { d: .5, spin: 0 }, () => meter(0, 'Bonds', 20, C.purple));
    item(ctx, t, phB + 1.6, 1360, 800, { d: .5 }, () => tag(ctx, 'less volatile ≠ risk-free', 0, 0, { size: 30, bg: C.sun }));
  }
};

// ── GOV BONDS · Republic of Arbordale ────────────────────────────────────
SC.govIssue = (ctx, t, L, D) => {
  blob(ctx, 960, 420, 300, C.lilac, { seed: 151, p: prog(t, .1, .9), t });
  const flagW = Math.sin(t * 3) * 4;
  item(ctx, t, .3, 960, 470, { d: .7 }, () => { ctx.scale(2.1, 2.1); I.capitol(ctx, { roof: C.sky }); });
  item(ctx, t, .7, 960, 720, { d: .5 }, () => tag(ctx, 'THE REPUBLIC OF ARBORDALE', 0, 0, { size: 30, bg: C.white }));
  item(ctx, t, .9, 960, 775, { d: .5 }, () => txt(ctx, '(a fictional nation)', 0, 0, { font: 'hand', size: 32, color: C.grey }));
  hiText(ctx, t, Lx(L, 2), 'GOVERNMENT BONDS', 960, 100, { size: 60 });
  // infrastructure
  const inf = [['bridge', 'Infrastructure', 330, 300], ['train', 'Public transport', 330, 560], ['turbine', 'Energy', 1590, 300], ['office', 'Public spending', 1590, 560]];
  inf.forEach(([n, s, x, y], i) => item(ctx, t, Lx(L, 4, .3 + i * .6), x, y, { d: .5, float: 6, seed: i, t1: Lx(L, 5, -.3), out: 'shrink' }, () => { circ(ctx, 0, 0, 80); fs(ctx, C.white, 5); icon(ctx, n, 0, 0, n === 'office' ? .55 : .9, { rot: t * 2 }); tag(ctx, s, 0, 104, { size: 24 }); }));
  // investors buying portions
  const inv = [[260, C.cyan, C.peach], [520, 'MAYA', C.skin], [1400, C.orange, '#E3A77E'], [1660, C.purple, C.skinS]];
  if (t > Lx(L, 5, -.4)) {
    inv.forEach(([x, c, sk], i) => { item(ctx, t, Lx(L, 5, -.3 + i * .12), x, 860, { d: .5, spin: 0 }, () => { if (c === 'MAYA') { ctx.translate(0, 40); ctx.scale(.42, .42); maya(ctx, t, { pose: 'stand', expr: 'happy' }); } else { ctx.scale(.9, .9); bust(ctx, { c, skin: sk }); } }); const go = E.inOut(prog(t, Lx(L, 5, .4 + i * .15), 1.1)); if (go > 0 && go < 1) { const bx = lerp(960, x, go), by = lerp(470, 640, go) - Math.sin(go * Math.PI) * 150; ctx.save(); ctx.translate(bx, by); ctx.scale(.35, .35); I.certificate(ctx); ctx.restore(); } else if (go >= 1) { ctx.save(); ctx.translate(x + 70, 760); ctx.rotate(.1); ctx.scale(.3, .3); I.certificate(ctx); ctx.restore(); } flow(ctx, t, Lx(L, 5, 1.6), Lx(L, 6, 0), [x, 700], [960, 500], { rate: .6, n: 2, lift: 120, size: .26 }); });
    item(ctx, t, Lx(L, 5, .2), 960, 820, { d: .5, t1: Lx(L, 6), out: 'shrink' }, () => tag(ctx, 'MAYA LENDS TO THE GOVERNMENT', 0, 0, { size: 26, bg: C.yellow }));
  }
  inv.forEach(([x], i) => flow(ctx, t, Lx(L, 6, .3), null, [960, 500], [x, 720], { rate: .45, n: 2, lift: 140, size: .26 }));
  item(ctx, t, Lx(L, 6, .3), 960, 820, { d: .5, t1: Lx(L, 8), out: 'shrink' }, () => tag(ctx, 'REPAYMENT + INTEREST', 0, 0, { size: 28, bg: C.mint }));
  item(ctx, t, Lx(L, 8, .4), 960, 820, { d: .5 }, () => tag(ctx, 'Governments borrow  ·  Investors earn returns', 0, 0, { size: 28, bg: C.white }));
};

// ── GOV BONDS · risks ────────────────────────────────────────────────────
function gauge(ctx, label, v, col) { card(ctx, 0, 0, 400, 330, { fill: C.white }); ctx.beginPath(); ctx.arc(0, 40, 120, Math.PI, 0); ink(ctx, 26, C.fog); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 40, 120, Math.PI, Math.PI + Math.PI * v); ink(ctx, 26, col); ctx.stroke(); const a = Math.PI + Math.PI * v; line(ctx, 0, 40, Math.cos(a) * 95, 40 + Math.sin(a) * 95, 8); circ(ctx, 0, 40, 12); fs(ctx, C.navy, 0); txt(ctx, label, 0, 120, { size: 32 }); }
SC.govRisk = (ctx, t, L, D) => {
  const phB = Lx(L, 3), phC = Lx(L, 5), phD = Lx(L, 7);
  fade(ctx, t, 0, phB - .3, () => {
    words(ctx, t, Lx(L, 1), 'Not automatically risk-free', 960, 200, { size: 80 });
    item(ctx, t, Lx(L, 1, .5), 960, 470, { d: .6 }, () => { ctx.scale(1.4, 1.4); I.capitol(ctx); });
    const f = [['The government issuing it', 420, 420], ['Ability & willingness to repay', 1500, 420], ['The currency', 360, 640], ["The bond's terms", 1560, 640], ['Economic conditions', 960, 760]];
    f.forEach(([s, x, y], i) => item(ctx, t, Lx(L, 2, .2 + i * .6), x, y, { d: .5, float: 6, seed: i }, () => tag(ctx, s, 0, 0, { size: 28, bg: [C.sun, C.mint, C.sky, C.rose, C.lilac][i] })));
  });
  if (t > phB - .4 && t < phC + .5) fade(ctx, t, phB - .3, phC - .3, () => {
    item(ctx, t, phB, 600, 500, { d: .6 }, () => { gauge(ctx, 'Strong credit profile', .85, C.green); icon(ctx, 'shield', 150, -110, .6); });
    item(ctx, t, Lx(L, 4), 1320, 500, { d: .6 }, () => { gauge(ctx, 'Financial difficulties', .2, C.red); icon(ctx, 'cloud', 150, -110, .6, { rain: true }); });
  });
  if (t > phC - .4 && t < phD + .5) fade(ctx, t, phC - .3, phD - .3, () => {
    hiText(ctx, t, phC, 'CURRENCY RISK', 960, 150, { size: 60, hl: C.sky });
    item(ctx, t, Lx(L, 6), 540, 480, { d: .6 }, () => { card(ctx, 0, 0, 420, 340, { fill: C.white }); ctx.save(); ctx.translate(0, -50); ctx.scale(.7, .7); I.certificate(ctx, { title: 'BOND' }); ctx.restore(); txt(ctx, '1,000 A', 0, 90, { size: 44, font: 'serif' }); txt(ctx, 'foreign currency', 0, 135, { size: 24, font: 'ui', weight: 500, color: C.grey }); });
    const rate = lerp(1, .8, E.inOut(prog(t, Lx(L, 6, 3), 2)));
    item(ctx, t, Lx(L, 6, .8), 960, 480, { d: .5 }, () => { icon(ctx, 'exchange', 0, -30, 1.3); txt(ctx, `1 A = ${rate.toFixed(2)} M`, 0, 70, { size: 32 }); });
    item(ctx, t, Lx(L, 6, 1.4), 1380, 480, { d: .6 }, () => { card(ctx, 0, 0, 420, 340, { fill: rate < .99 ? '#FDE7EC' : C.white }); icon(ctx, 'coin', 0, -60, 1, { label: 'M' }); txt(ctx, Math.round(1000 * rate).toLocaleString('en-US') + ' M', 0, 60, { size: 54, font: 'serif', color: rate < .99 ? C.red : C.navy }); txt(ctx, 'in her own currency', 0, 115, { size: 24, font: 'ui', weight: 500, color: C.grey }); });
  });
  if (t > phD - .4) {
    words(ctx, t, phD, 'Know exactly what you are buying', 960, 170, { size: 66 });
    [['Credit risk', .7, C.red], ['Interest-rate risk', .5, C.orange], ['Currency risk', .4, C.purple]].forEach(([s, v, c], i) => item(ctx, t, phD + .3 + i * .4, 480 + i * 480, 540, { d: .6 }, () => { const vv = v + Math.sin(t * 1.5 + i) * .08; gauge(ctx, s, vv, c); icon(ctx, 'warn', 150, -120, .45); }));
  }
};

// ── ETFs · overwhelmed → basket ──────────────────────────────────────────
SC.etfBasket = (ctx, t, L, D) => {
  const zt = Lx(L, 2, .5); const z = E.inOut(prog(t, zt, 1.6));
  const sx = 210, sy = 150, sw = 1200, sh = 660; const cols = 24, rows = 12;
  const bx = 820, by = 640;
  if (z < 1) { ctx.save(); ctx.globalAlpha = 1 - z; rr(ctx, sx - 20, sy - 20, sw + 40, sh + 40, 24); fs(ctx, '#2F3350', 6); rr(ctx, sx, sy, sw, sh, 10); ctx.fillStyle = C.cream; ctx.fill(); ctx.restore(); }
  const R = rng(17); const colsArr = [C.mint, C.sky, C.rose, C.sun, C.lilac, C.peach];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c; const a = R() * TAU, rad = R() * 130; const cc = colsArr[Math.floor(R() * 6)]; const shp = Math.floor(R() * 3);
    const ap = prog(t, .2 + k * .004, .3); if (ap <= 0) continue;
    const gx = sx + 25 + c * (sw - 50) / (cols - 1), gy = sy + 25 + r * (sh - 50) / (rows - 1);
    const kz = E.inOut(clamp(z * 1.6 - (k / (rows * cols)) * .6));
    const x = lerp(gx, bx + Math.cos(a) * rad * 1.1, kz), y = lerp(gy, by - 110 + Math.sin(a) * rad * .32, kz);
    ctx.save(); ctx.translate(x, y); ctx.scale(ap * lerp(1, .8, kz), ap * lerp(1, .8, kz)); if (shp === 0) circ(ctx, 0, 0, 17); else if (shp === 1) rr(ctx, -16, -16, 32, 32, 6); else { ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(17, 14); ctx.lineTo(-17, 14); ctx.closePath(); } fs(ctx, cc, 3); ctx.restore();
  }
  if (z > .3) item(ctx, t, zt + .5, bx, by, { d: .6, spin: 0 }, () => { ctx.scale(2.2, 2.2); I.basket(ctx, { c: C.orange }); });
  if (z > .6) item(ctx, t, zt + 1, bx, by + 230, { d: .5 }, () => tag(ctx, 'EXCHANGE-TRADED FUND', 0, 0, { size: 34, bg: C.yellow }));
  // Maya
  const ex = t < zt + 1 ? (t > Lx(L, 0, 1.5) ? 'worried' : 'wow') : 'happy';
  ctx.save(); ctx.translate(1660, 960); ctx.scale(.75, .75); maya(ctx, t, { pose: ex === 'happy' ? 'present' : 'worried', expr: ex, look: -1 }); ctx.restore();
  if (ex === 'worried') item(ctx, t, Lx(L, 0, 1.5), 1740, 590, { d: .4, float: 4 }, () => icon(ctx, 'drop', 0, 0, .35));
  // acronym
  if (t > Lx(L, 1)) fade(ctx, t, Lx(L, 1), Lx(L, 3, 1), () => { const sz = 64; const parts = [['E', 'xchange-'], ['T', 'raded '], ['F', 'und']]; const ex2 = E.out(prog(t, Lx(L, 2), .8)); let x = 1460; const y = 160; const full = parts.map(p => p[0] + (ex2 > 0 ? p[1] : '')).join(''); const tot = tw(ctx, full, sz, 'serif'); x = 1300 - tot / 2 * ex2; card(ctx, 1300, y, 120 + tot * ex2 + (1 - ex2) * 140, 120, { fill: C.white }); parts.forEach(([a, b]) => { txt(ctx, a, x, y, { size: sz, font: 'serif', align: 'left', color: C.pink }); x += tw(ctx, a, sz, 'serif'); if (ex2 > 0) { ctx.save(); ctx.globalAlpha = ex2; txt(ctx, b, x, y, { size: sz, font: 'serif', align: 'left' }); ctx.restore(); x += tw(ctx, b, sz, 'serif') * ex2; } }); });
  // trades on exchange — ticker
  if (t > Lx(L, 3)) { const a = E.out(prog(t, Lx(L, 3), .6)); ctx.save(); ctx.globalAlpha = a; rr(ctx, 0, 40, W, 70, 0); ctx.fillStyle = C.navy; ctx.fill(); const items = ['ARB100 ▲ 0.8%', 'NSTR ▲ 1.2%', 'BOND ▼ 0.1%', 'ETF ▲ 0.6%', 'GOLD ▲ 0.3%', 'MKT ▼ 0.2%']; setFont(ctx, 30, 'sans', 700); let x = -((t * 120) % 1800); for (let k = 0; k < 3; k++) items.forEach(s => { txt(ctx, s, x, 76, { size: 30, weight: 700, color: s.includes('▲') ? '#8FF0B8' : '#FF9CA8', align: 'left' }); x += ctx.measureText(s).width + 80; }); ctx.restore(); }
  [['Stocks', C.mint], ['Bonds', C.sun], ['Other assets', C.lilac]].forEach(([s, c], i) => item(ctx, t, Lx(L, 4, .3 + i * .6), 340 + i * 0, 330 + i * 110, { d: .5 }, () => tag(ctx, s, 0, 0, { size: 30, bg: c })));
  item(ctx, t, Lx(L, 5, 1), 1380, 560, { d: .6, float: 6 }, () => { icon(ctx, 'coin', 0, 0, 1.1, { label: '1' }); tag(ctx, '1 FUND UNIT', 0, 80, { size: 24, bg: C.white }); });
};

// ── ETFs · tracking an index ─────────────────────────────────────────────
function idxVal(u) { return Math.sin(u * 9) * .18 + Math.sin(u * 23) * .07 + u * .55; }
SC.etfIndex = (ctx, t, L, D) => {
  item(ctx, t, .2, 560, 120, { d: .5 }, () => tag(ctx, 'FICTIONAL INDEX · ARBOR 100', 0, 0, { size: 28, bg: C.yellow }));
  const ip = prog(t, Lx(L, 2), 6); const bob = (idxVal(ip) - .3) * 120;
  // 100 companies grid sitting in basket
  const gx = 560, gy = 470;
  for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c = i % 10; const p = E.back(prog(t, Lx(L, 1, i * .02), .4)); if (p <= 0) continue; circ(ctx, gx - 225 + c * 50, gy - 200 + r * 42 - bob, 18 * p); fs(ctx, [C.mint, C.sky, C.rose, C.sun, C.lilac][(i * 7) % 5], 3); }
  item(ctx, t, .3, gx, gy + 240 - bob, { d: .6, spin: 0 }, () => { ctx.scale(3, 2.3); I.basket(ctx); });
  item(ctx, t, Lx(L, 1, 1.5), gx, gy + 400 - bob * 0, { d: .5 }, () => tag(ctx, '100 COMPANIES · ONE FUND', 0, 0, { size: 26 }));
  const phB = Lx(L, 4);
  fade(ctx, t, Lx(L, 2), phB - .2, () => {
    const X0 = 1080, X1 = 1780, Y0 = 640, Y1 = 260; card(ctx, (X0 + X1) / 2, (Y0 + Y1) / 2, X1 - X0 + 80, Y0 - Y1 + 120, { fill: C.white });
    txt(ctx, 'INDEX', X0, Y1 - 10, { size: 22, align: 'left', color: C.grey });
    const pts = sampleCurve(u => Y0 - 40 - idxVal(u) * (Y0 - Y1 - 60), X0 + 10, X1 - 10, 120);
    const tip = drawLine(ctx, pts, ip, C.purple, 7); circ(ctx, tip[0], tip[1], 12); fs(ctx, C.yellow, 4);
    item(ctx, t, Lx(L, 2, .8), 1430, 760, { d: .5 }, () => tag(ctx, 'the ETF follows the index', 0, 0, { size: 28, bg: C.sky }));
    if (t > Lx(L, 3)) { ctx.save(); ctx.translate(1720, 960); ctx.scale(.48, .48); maya(ctx, t, { pose: 'present', expr: 'smile', look: -1 }); ctx.restore(); }
  });
  if (t > phB - .3) {
    item(ctx, t, phB, 1400, 340, { d: .6 }, () => { card(ctx, 0, 0, 560, 220, { fill: C.white }); for (let i = 0; i < 20; i++) { circ(ctx, -220 + (i % 10) * 48, -40 + Math.floor(i / 10) * 48, 16); ctx.globalAlpha = .5; fs(ctx, C.fog, 3); ctx.globalAlpha = 1; } txt(ctx, '100 separate shares', 0, 75, { size: 30 }); line(ctx, -250, -90, 250, 100, 10, C.red); });
    item(ctx, t, Lx(L, 5), 1400, 660, { d: .6 }, () => { card(ctx, 0, 0, 560, 240, { fill: C.mint }); icon(ctx, 'coin', -170, 0, 1.1, { label: '1' }); txt(ctx, '1 unit in the fund', 50, -20, { size: 34 }); txt(ctx, 'holds / gains exposure', 50, 24, { size: 24, font: 'ui', weight: 500 }); poly(ctx, [[200, -80], [220, -60], [250, -100]], false); ink(ctx, 8, C.green); ctx.stroke(); });
  }
};

// ── ETFs · diversification ───────────────────────────────────────────────
SC.diversify = (ctx, t, L, D) => {
  hiText(ctx, t, .2, 'DIVERSIFICATION', 960, 120, { size: 64, hl: C.mint });
  item(ctx, t, Lx(L, 1, .5), 960, 205, { d: .5 }, () => txt(ctx, 'spreading money across different assets', 0, 0, { size: 36, font: 'serif' }));
  const bad = E.inOut(prog(t, Lx(L, 2, .4), .8)); const mkt = E.inOut(prog(t, Lx(L, 4, .4), 1.2));
  // left: all in one
  item(ctx, t, Lx(L, 1, 1), 520, 300, { d: .5 }, () => tag(ctx, 'ALL IN ONE COMPANY', 0, 0, { size: 28 }));
  item(ctx, t, Lx(L, 1, 1.2), 520, 520, { d: .6 }, () => { circ(ctx, 0, 0, 150); ctx.fillStyle = bad > .5 ? C.red : C.sky; fs(ctx, bad > .5 ? C.rose : C.sky, 6); icon(ctx, 'northstar', 0, 0, 1.4); });
  // right: grid
  item(ctx, t, Lx(L, 1, 1.4), 1400, 300, { d: .5 }, () => tag(ctx, 'SPREAD ACROSS 25', 0, 0, { size: 28 }));
  for (let i = 0; i < 25; i++) { const p = E.back(prog(t, Lx(L, 1, 1.6 + i * .03), .4)); if (p <= 0) continue; const isBad = i === 12 && bad > .5; const down = mkt * 30; circ(ctx, 1400 - 200 + (i % 5) * 100, 420 + Math.floor(i / 5) * 50 + down, 20 * p); fs(ctx, isBad ? C.red : mkt > .3 ? C.rose : [C.mint, C.sky, C.sun, C.lilac][i % 4], 4); }
  // value bars
  const bar = (x, v, lab) => { rr(ctx, x - 200, 760, 400, 44, 22); fs(ctx, C.white, 4); rr(ctx, x - 194, 766, 388 * v, 32, 16); ctx.fillStyle = v < .7 ? C.red : v < .95 ? C.orange : C.green; ctx.fill(); txt(ctx, lab, x, 836, { size: 26 }); };
  if (t > Lx(L, 2)) { bar(520, 1 - bad * .6, Math.round(100 - bad * 60) + '% of value'); bar(1400, 1 - bad * .04 - mkt * .2, Math.round(100 - bad * 4 - mkt * 20) + '% of value'); }
  if (t > Lx(L, 3)) stamp(ctx, t, Lx(L, 3, .2), "DOESN'T ELIMINATE RISK", 960, 620, { size: 40, rot: -.05 });
  if (t > Lx(L, 4)) item(ctx, t, Lx(L, 4, .4), 1720, 560, { d: .5 }, () => { icon(ctx, 'chartDown', 0, 0, .9); tag(ctx, 'whole market falls', 0, 80, { size: 22 }); });
};

// ── ETFs · many kinds ────────────────────────────────────────────────────
SC.etfTypes = (ctx, t, L, D) => {
  words(ctx, t, .2, 'Not all ETFs are alike', 960, 130, { size: 76 });
  const T = [['factory', 'Single industry', 1, 0], ['people', 'Narrow group', 1, .9], ['target', 'One strategy', 1, 1.8], ['goldbar', 'One commodity', 1, 2.7], ['doc', 'Bond ETF', 2, .2], ['chartUp', 'Tracks an index', 3, .1], ['person', 'Actively managed', 4, .1], ['warn', 'Leverage · derivatives', 5, .2]];
  T.forEach(([n, s, li, dt], i) => { const x = 330 + (i % 4) * 420, y = 380 + Math.floor(i / 4) * 300; const risky = n === 'warn'; const focus = t > Lx(L, 7) && i === 0; item(ctx, t, Lx(L, li, dt), x, y, { d: .55, float: 5, seed: i, alpha: t > Lx(L, 7) && !focus ? .35 : 1 }, () => { card(ctx, 0, 0, 370, 250, { fill: risky ? '#FDE7EC' : C.white }); ctx.save(); ctx.translate(-110, -30); ctx.scale(.55, .55); I.basket(ctx, { c: risky ? C.red : C.orange }); ctx.restore(); icon(ctx, n, 70, -40, .75, n === 'doc' ? { title: 'BOND', ts: 22 } : n === 'person' ? { tie: true, c: C.navy2 } : {}); txt(ctx, s, 0, 80, { size: 28 }); }); });
  if (t > Lx(L, 6)) { stamp(ctx, t, Lx(L, 6, .3), 'SAFE? SUITABLE?', 960, 530, { size: 54, col: C.purple, rot: -.06 }); }
  if (t > Lx(L, 7)) { const u = E.inOut(prog(t, Lx(L, 7, .2), 1)); item(ctx, t, Lx(L, 7, .2), lerp(1200, 400, u), lerp(700, 380, u), { d: .5, s: 1.6, rot: -.2 }, () => icon(ctx, 'magnifier', 0, 0, 1)); item(ctx, t, Lx(L, 7, 1.2), 960, 830, { d: .5 }, () => tag(ctx, 'What does it hold?  ·  How does it work?', 0, 0, { size: 30, bg: C.yellow })); }
};
