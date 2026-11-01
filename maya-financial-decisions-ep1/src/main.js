// ───────────────────────────────────────────────────────────────────────────
//  Timeline + compositor: beats, transitions, title cards, captions, chapter tag
// ───────────────────────────────────────────────────────────────────────────
const WPS = 3.0;          // narration pace (words / sec) ≈ 174 wpm
const LGAP = .28;         // pause after each line
const LEAD = 1.0;         // silence before first line
const TITLE_DUR = 3.6;    // chapter title cards
const SEC_GAP = .5;
const TR = .9;            // transition length
const SHORT = { p1: 'What is investing?', p2: 'Worlds of investing', p3: 'Stocks', p4: 'Bonds', p5: 'Government bonds', p6: 'ETFs', p7: 'Mutual funds', p8: 'Other investments', p9: 'Making money', p10: 'The risks', p11: 'Before investing', close: 'Closing' };

function lineDur(s) { const w = s.split(/\s+/).length; return Math.max(1.15, w / WPS + (s.match(/[,:;—]/g) || []).length * .1 + (/[?]$/.test(s) ? .2 : 0)); }

const TL = []; let TOTAL = 0; const LINES = [];
(function build() {
  const ov = (typeof TIMINGS_OVERRIDE !== 'undefined') ? TIMINGS_OVERRIDE : null; let li = 0;
  let t = LEAD;
  SCRIPT.forEach((sec, si) => {
    if (sec.title) { TL.push({ scene: 'titleCard', sec, si, start: t, end: t + TITLE_DUR, lines: [], L: [] }); t += TITLE_DUR; }
    sec.beats.forEach((b, bi) => {
      const beat = { scene: b.scene, sec, si, start: t, lines: [], L: [] };
      b.lines.forEach(s => { const d = ov && ov[li] != null ? ov[li] : lineDur(s); const ln = { text: s, start: t, end: t + d, sec }; beat.lines.push(ln); LINES.push(ln); li++; t += d + LGAP; });
      t += b.hold || 0; beat.end = t; TL.push(beat);
    });
    TL[TL.length - 1].end += SEC_GAP; t += SEC_GAP;
  });
  TOTAL = t + .5; TL[TL.length - 1].end = TOTAL;
  TL.forEach((b, i) => { b.vstart = b.start - TR / 2; b.L = b.lines.map(l => l.start - b.vstart); b.LE = b.lines.map(l => l.end - b.vstart); b.D = b.end - b.vstart; b.idx = i; });
})();

const SC = {}; // scene registry (scenes.js)

function drawBeat(ctx, b, t) {
  const lt = t - b.vstart; const fn = SC[b.scene];
  ctx.save();
  const z = 1 + .03 * clamp(lt / b.D); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  SFX.offset = b.vstart;
  if (fn) fn(ctx, lt, b.L, b.D, b); else { txt(ctx, b.scene, W / 2, H / 2, { size: 60 }); }
  ctx.restore();
}

function frame(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(PAPER, 0, 0);
  let i = TL.findIndex(b => t < b.end); if (i < 0) i = TL.length - 1;
  const b = TL[i], nb = TL[i + 1], pb = TL[i - 1];
  // transition windows around boundaries
  const into = pb && t < b.start + TR / 2 && t >= b.start - TR / 2 ? [pb, b] : null;
  const outof = nb && t >= b.end - TR / 2 ? [b, nb] : null;
  const pair = into || outof;
  if (pair) {
    const [a, c] = pair; const T = c.start; const e = E.inOut(clamp((t - (T - TR / 2)) / TR));
    const vertical = c.scene === 'titleCard' || a.scene === 'titleCard' || c.si !== a.si;
    if (e < 1) { SFX.add('whoosh', T - TR / 2 - (SFX.offset = 0)); ctx.save(); vertical ? ctx.translate(0, -H * e) : ctx.translate(-W * e, 0); drawBeat(ctx, a, t); ctx.restore(); }
    ctx.save(); vertical ? ctx.translate(0, H * (1 - e)) : ctx.translate(W * (1 - e), 0); drawBeat(ctx, c, t); ctx.restore();
  } else drawBeat(ctx, b, t);
  // serious mood tint for risks chapter
  const cur = t >= b.start ? b : (pb || b);
  if (cur.sec.mood === 'serious') { ctx.save(); const vg = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); vg.addColorStop(0, 'rgba(28,36,89,0)'); vg.addColorStop(1, 'rgba(28,36,89,.22)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  chapterTag(ctx, t);
  captions(ctx, t);
  // final fade to black handled by nextEp; global fade-in
  if (t < .6) { ctx.fillStyle = `rgba(16,18,40,${1 - t / .6})`; ctx.fillRect(0, 0, W, H); }
}

function chapterTag(ctx, t) {
  const b = TL.find(x => t >= x.start && t < x.end); if (!b || !b.sec.part || b.scene === 'titleCard' || b.scene === 'nextEp') return;
  const secStart = TL.find(x => x.sec === b.sec && x.scene !== 'titleCard').start;
  const a = E.out(prog(t, secStart + .2, .6)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(-30 * (1 - a), 0);
  const num = b.sec.part.replace('Part ', ''); const label = SHORT[b.sec.id] || '';
  const isNum = /^\d+$/.test(num);
  setFont(ctx, 26, 'sans', 700); const w = ctx.measureText(label.toUpperCase()).width;
  rr(ctx, 56, 44, (isNum ? 64 : 0) + w + 44, 52, 26); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill(); ink(ctx, 3); ctx.stroke();
  if (isNum) { circ(ctx, 82, 70, 20); ctx.fillStyle = C.yellow; ctx.fill(); ink(ctx, 3); ctx.stroke(); txt(ctx, num, 82, 72, { size: 22 }); }
  txt(ctx, label.toUpperCase(), (isNum ? 120 : 78), 72, { size: 24, align: 'left', weight: 700, ls: 2 });
  ctx.restore();
}

let SHOW_CAPTIONS = true;
function captions(ctx, t) {
  if (!SHOW_CAPTIONS) return;
  const ln = LINES.find(l => t >= l.start - .05 && t < l.end + LGAP * .8); if (!ln) return;
  const a = Math.min(prog(t, ln.start - .05, .18), 1 - prog(t, ln.end + LGAP * .8 - .18, .18));
  const size = 34; const lines = wrap(ctx, ln.text, 1380, size, 'ui', 600);
  ctx.save(); ctx.globalAlpha = a; setFont(ctx, size, 'ui', 600);
  const lh = size * 1.32; const h = lines.length * lh + 26; const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 56;
  const y0 = H - 54 - h;
  rr(ctx, W / 2 - w / 2, y0, w, h, 18); ctx.fillStyle = 'rgba(22,27,64,.78)'; ctx.fill();
  lines.forEach((l, i) => txt(ctx, l, W / 2, y0 + 13 + lh * (i + .5) + 2, { size, font: 'ui', weight: 600, color: '#fff' }));
  ctx.restore();
}

// ── shared title card ────────────────────────────────────────────────────
const SEC_COL = [C.sun, C.lilac, C.sky, C.rose, C.mint, C.sun, C.lilac, C.peach, C.sky, C.rose, C.mint, C.sun, C.lilac];
const SEC_ICON = { p1: 'seed', p2: 'globe', p3: 'northstar', p4: 'certificate', p5: 'capitol', p6: 'basket', p7: 'pie', p8: 'goldbar', p9: 'coinStack', p10: 'warn', p11: 'notebook', close: 'sparkle' };
SC.titleCard = (ctx, t, L, D, b) => {
  const col = SEC_COL[b.si % SEC_COL.length]; const col2 = SEC_COL[(b.si + 2) % SEC_COL.length];
  const num = (b.sec.part || '').replace('Part ', '');
  blob(ctx, 1450, 470, 250, col, { seed: b.si + 3, p: prog(t, .3, .8), t });
  blob(ctx, 330, 820, 120, col2, { seed: b.si + 9, p: prog(t, .45, .8), t });
  brush(ctx, curvePts(u => [260 + u * 260, 220 + Math.sin(u * 3) * 30], 30), C.pink, 14, E.out(prog(t, .7, .7)));
  brush(ctx, curvePts(u => [1740 + Math.sin(u * 2) * 20, 680 + u * 200], 30), C.purple, 14, E.out(prog(t, .8, .7)));
  if (/^\d+$/.test(num)) item(ctx, t, .35, 1330, 400, { d: .7, spin: 0 }, () => { txt(ctx, num.padStart(2, '0'), 0, 10, { size: 300, font: 'serif', color: 'rgba(255,255,255,.75)' }); });
  item(ctx, t, .55, 1560, 600, { d: .7, float: 8, rot: .06 }, () => { circ(ctx, 0, 0, 120); fs(ctx, C.white, 6); const n = SEC_ICON[b.sec.id]; icon(ctx, n, 0, 0, n === 'certificate' ? .75 : n === 'capitol' ? .8 : n === 'basket' ? .85 : 1.35); });
  item(ctx, t, .4, 180 + 60, 330, { d: .6 }, () => tag(ctx, b.sec.part.toUpperCase(), 0, 0, { size: 30, bg: C.yellow }));
  const lines = wrap(ctx, b.sec.title, 1000, 96, 'serif');
  lines.forEach((l, i) => words(ctx, t, .55 + i * .2, l, 180, 470 + i * 106 - (lines.length - 1) * 30, { size: 96, font: 'serif', stagger: .07, align: 'left' }));
};
