// Fast pre-pass: walks the whole timeline at low fps to collect timeline + SFX cue points.
import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const out = process.argv[2] || path.join(root, 'out');
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + root + '/index.html?render'); await p.evaluate(() => window.ready);
const data = await p.evaluate(() => { for (let t = 0; t < window.TOTAL; t += 1 / 8) window.renderAt(t); return { timeline: window.getTimeline(), sfx: window.getSfx() }; });
fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify(data.timeline, null, 1));
fs.writeFileSync(path.join(out, 'sfx.json'), JSON.stringify(data.sfx));
console.log('total', data.timeline.total.toFixed(2), 's  sfx', data.sfx.length); await b.close();
