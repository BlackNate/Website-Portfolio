// Downloads the ElevenLabs voiceover takes for the 30s ad into public/audio/
// and writes src/audio-manifest.json.
//   ELEVENLABS_API_KEY=sk_... npm run fetch-audio
// Without a key it falls back to the signed CDN links (valid until ~2026-11-07 18:40 UTC).
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://elevenlabsusercontent.com/database/workspace/aaf89812b72a400e9ef5d73fa7733d36/content_generation';
const EXP = 'Expires=1794074400&KeyName=assets-cdn-key-1';

// id, history item id, duration, cdn path, signature
const TAKES = [
  ['01', 'ndCelhFJsHrSOYFcgl8J', 4.32, '2YBokP9AGg9es3gfdcdc/HwWAqWv5uE6rhIFTuvMc', 'nPh6-aqrZFV2DaFYgScuT6GJAEo='],
  ['02', '5Z1F21qgipU9ikmPCfoG', 6.24, 'UnLufdqfNPIBcUFrZge1/gGkk4bwd8yuBwrROCHpH', 'H3sr6sLn5Ix71a0UKz6FETUZBX4='],
  ['03', 'FbYkEX5eooJKdL5EEibk', 1.76, 'MOsS8euh4uVnl5qbC2v8/BApOUSvRz4Iq13YOm3P8', 'SplLW2dPdBEiH7mIzhw2bG2Fgmg='],
  ['04', '1NXtJZ2jzgKSsjtwhCE7', 6.96, 'kSz682XosEPUnaEQqOiq/hrIE6fCLkbSWl15f0jm4', 'i_9Nie4AF8q2WucllsOsQdNpfnk='],
  ['05', 'SymnDxmhdGkaLFULX2dj', 5.36, 'WIEMFXio0CXMT2URQmss/FLenG6okJdyYdhhmlRyd', 'F42X-xUd_rci_CCXV6N4cZVa5Uo='],
];

const key = process.env.ELEVENLABS_API_KEY;
mkdirSync(join(root, 'public', 'audio'), {recursive: true});
const manifest = {};
for (const [id, hist, duration, path, sig] of TAKES) {
  const url = key
    ? `https://api.elevenlabs.io/v1/history/${hist}/audio`
    : `${CDN}/${path}/content.mp3?${EXP}&Signature=${encodeURIComponent(sig)}`;
  try {
    const res = await fetch(url, key ? {headers: {'xi-api-key': key}} : {});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(join(root, 'public', 'audio', `${id}.mp3`), Buffer.from(await res.arrayBuffer()));
    manifest[id] = {file: `audio/${id}.mp3`, duration};
    console.log(`✓ VO ${id}`);
  } catch (e) {
    console.error(`✗ VO ${id}: ${e.cause?.message ?? e.message}`);
  }
}
writeFileSync(join(root, 'src', 'audio-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${Object.keys(manifest).length}/${TAKES.length} voiceover lines ready.`);
