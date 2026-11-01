// Parallel renderer: node tools/render.mjs [--fps 30] [--workers 4] [--from s] [--to s] [--out out/video.mp4] [--nocaps]
import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), NW = +arg('workers', 4), OUT = path.resolve(arg('out', path.join(root, 'out/video_nosound.mp4')));
const caps = process.argv.includes('--nocaps') ? '&nocaps' : '';
const tmp = path.join(path.dirname(OUT), 'chunks'); fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
const probe = await browser.newPage(); await probe.goto('file://' + root + '/index.html?render'); await probe.evaluate(() => window.ready);
const TOTAL = await probe.evaluate(() => window.TOTAL); await probe.close();
const f0 = Math.round(+arg('from', 0) * FPS), f1 = Math.round(Math.min(+arg('to', TOTAL), TOTAL) * FPS);
const per = Math.ceil((f1 - f0) / NW); const t0 = Date.now(); let done = 0;
async function worker(w) {
  const a = f0 + w * per, z = Math.min(f1, a + per); if (a >= z) return null;
  const file = path.join(tmp, `chunk_${String(w).padStart(2, '0')}.mp4`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-threads', '2', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + root + '/index.html?render' + caps); await page.evaluate(() => window.ready);
  for (let f = a; f < z; f++) {
    const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .94).slice(23); }, f / FPS);
    const buf = Buffer.from(b64, 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 300 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${f1 - f0} frames  ${(done / el).toFixed(1)} fps  eta ${((f1 - f0 - done) / (done / el) / 60).toFixed(1)} min`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close(); return file;
}
const files = (await Promise.all([...Array(NW).keys()].map(worker))).filter(Boolean);
await browser.close();
fs.writeFileSync(path.join(tmp, 'list.txt'), files.map(f => `file '${f}'`).join('\n'));
await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', OUT], { stdio: 'inherit' }).on('close', r));
console.log('done', OUT, ((Date.now() - t0) / 60000).toFixed(1), 'min');
