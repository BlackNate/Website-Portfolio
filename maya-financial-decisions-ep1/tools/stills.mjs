// Render still frames for review: node tools/stills.mjs out_dir t1 t2 ...  (or "beats" = mid + late of every beat)
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + root + '/index.html?render'); await p.evaluate(() => window.ready);
let times = ts.map(Number);
if (ts[0] === 'beats') { const tl = await p.evaluate(() => window.getTimeline()); const filt = ts[1]; times = []; tl.beats.forEach(bt => { if (filt && !filt.split(',').includes(bt.scene)) return; for (const f of [.3, .65, .97]) times.push(+(bt.start + (bt.end - bt.start) * f).toFixed(2)); }); }
for (const t of times) { const d = await p.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .85); }, t); fs.writeFileSync(`${out}/f_${String(t.toFixed(2)).padStart(8, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
if (errs.length) console.log('ERRORS:', [...new Set(errs)].slice(0, 10).join('\n'));
console.log('total', await p.evaluate(() => window.TOTAL), 'frames', times.length);
await b.close();
