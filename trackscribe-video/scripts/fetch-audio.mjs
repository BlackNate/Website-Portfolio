// Downloads the ElevenLabs voice takes generated for this video into public/audio/
// and writes src/audio-manifest.json so the Remotion timeline uses the real clip lengths.
//
//   ELEVENLABS_API_KEY=sk_... npm run fetch-audio
//
// With an API key, takes are fetched by their permanent history item id.
// Without one, the script falls back to the signed CDN links, which expire a few hours
// after generation (2026-11-06 ~17:00 UTC).
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CDN = 'https://elevenlabsusercontent.com/database/workspace/aaf89812b72a400e9ef5d73fa7733d36/content_generation';
const EXP = 'Expires=1793984400&KeyName=assets-cdn-key-1';

// id, speaker, ElevenLabs history item id, reported duration, signed CDN path, signature
const TAKES = [
  ['01', 'narrator', 'scE9bQMv2DwD75RJmXfV', 7.6, 'ofeVRvLMLofwFbku8OVD/gBVTItCillGWseYkUiKF', 'GXuxOMtxE7mtnCIblRwO77E_sDY='],
  ['02', 'man', 'IKYfvFgtwLSuLWVuwpSX', 7.6, 'JIrILT6TGaf2E1nC4WFJ/KNjCOXwMOUvMtJMfZuLO', '5MD_HEzGbtz3qNc_hGE-hpouxBY='],
  ['03', 'narrator', 'yaf8m1RKos1ODqq1DYJM', 5.52, 'WSykPttP0VTztqpZ06US/DyfnGNMUswlhAz2e0Hfx', 'YtirNVPfOK3jEUe_5YtZhsmQAo4='],
  ['04', 'man', 'j2dHKAGGJFT36iNrWhr5', 6.64, 'Fr0U6BrzvPcF8UFRjnSx/hk2Kg6PwvvcmfDbKFEkT', 'harAs9qIofIvEeoCaRAHtwPLeJc='],
  ['05', 'narrator', 'J2FJSnU8bjQmoj7fmo4i', 12.72, '74eKTHhcLNSKNXn5Ehxa/r8fbObkVBeg6iWRMn1d6', 'W__ua_uHzJfiHlSLtfRO3Pu9OAw='],
  ['06', 'man', 'xfDIpK1Nq1hnHZNoKU2a', 6.4, 'hw6g1rUs2W4iXCiskxvC/vXibQo8uLuOt6rshhFVw', '5NwNvp4_wKqL0nGq6fevHI-IQeI='],
  ['07', 'narrator', '9vjJgt6I4oGGgMuwi5mR', 8.56, 'm0B9Aunk9oYviVk3rFVt/ol5IwsF46RQg8ivIDybU', 'YjYo0b2n5Jv4asUbq_tkjbd0abs='],
  ['08', 'nekuru', 'z5MpTOcFWl7n41qaBNB9', 5.52, 'WRJlmFyhiN6UiQ2qSaPA/TTKIZPAGiSadzBZpi2J5', 'tyHjNygEqd6Datba7X9Fbj3tpBU='],
  ['09', 'man', 'TcSnJYyTls2wcIbFe1qF', 1.92, 'WnRdr2ckVDFOyLfkyATT/cxjDTtGLBYNOWZiAb6s8', 'Flh2ZvfN0erCQwPf0hPNHj93PTA='],
  ['10', 'nekuru', 'k0d7Q31F7OvozGukDrhO', 8.0, 'vzwgEX5GA6HdLBKbS8l0/qb2N7g462I4WvfjaFwZr', 'i5TYXu-j-apNSiEAjHeCkGJDPr0='],
  ['11', 'narrator', 'eGTdpZgUNlIYNpjcCTKM', 12.72, 'wEzR8lrKLWZCURFtsTas/2UEAbGqOA6wnW8MNmjc3', 'hIrfOaZAwgdHehHpsNAVL5z4t9U='],
  ['12', 'narrator', 'z24B8hMzpoAoAf851dTc', 6.32, 'DyxW56yFiJ3whYYyRzQt/UlYbVBtaScFSNJgqyMAV', 'ZXcihlcFmhemm8dtYu5lEiLvKH4='],
  ['13', 'man', 'hND81J4DLMIKB0QozYOm', 2.96, 'K2IglK9rXs09d4DWHoF3/Jdak7ZI4jT4B4c1hOA8G', '4Do1vw-ETgUZPQsSP1xOSgzAl0k='],
  ['14', 'narrator', 'S6cMs3ryk9uDSzD2iYqH', 8.32, 'oEf4m3qn0kyKCarUOh3X/cjyVTffvQxYdu2HFSfXz', 'ZLaY8CaoJ_ie8ic9x1F02dntRCA='],
  ['15', 'man', 'f5RwqgK9aWvtYd1XVIj3', 2.32, 'kauHbp0XLvDNY1bkgKHj/pgUCvScgVPXtqDFDQ3DV', 'crUyQEW5baOssbLxQDG_DyYdjh4='],
  ['16', 'narrator', 'cJbzRARbMrVLuWZF9DgK', 9.6, '4gsDKEyz2oLB0AFSN609/sxTB1HGlpv2kIGJD3pr4', 'n_aV72N3fE8xjILj12L-X8EROXo='],
];

const key = process.env.ELEVENLABS_API_KEY;
mkdirSync(join(root, 'public', 'audio'), {recursive: true});

const probe = (file, fallback) => {
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    const d = parseFloat(out.toString());
    return Number.isFinite(d) ? Math.round(d * 100) / 100 : fallback;
  } catch {
    return fallback;
  }
};

const manifest = {};
let failed = 0;
for (const [id, speaker, historyId, duration, path, sig] of TAKES) {
  const dest = join(root, 'public', 'audio', `${id}.mp3`);
  const url = key
    ? `https://api.elevenlabs.io/v1/history/${historyId}/audio`
    : `${CDN}/${path}/content.mp3?${EXP}&Signature=${encodeURIComponent(sig)}`;
  try {
    const res = await fetch(url, key ? {headers: {'xi-api-key': key}} : {});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    manifest[id] = {file: `audio/${id}.mp3`, duration: probe(dest, duration)};
    console.log(`✓ ${id} ${speaker.padEnd(8)} ${manifest[id].duration}s`);
  } catch (e) {
    failed++;
    console.error(`✗ ${id} ${speaker}: ${e.message}`);
  }
}

writeFileSync(join(root, 'src', 'audio-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${Object.keys(manifest).length}/${TAKES.length} voice lines ready.`);
if (failed && !key) console.log('Some links may have expired — rerun with ELEVENLABS_API_KEY set.');
