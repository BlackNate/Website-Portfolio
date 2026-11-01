"""Split per-chapter voiceover MP3s (out/vo/<chunk>.mp3) into one clip per caption line.

Uses silence detection and picks, for each line boundary, the pause that best fits the
word-proportional expected position (longer pauses preferred). Writes:
  out/vo/lines/NNN.wav       one clip per line (script order)
  src/timings.js             TIMINGS_OVERRIDE = [seconds per line]  -> main.js re-times every scene
"""
import json, os, re, subprocess, wave
import numpy as np
ROOT = os.path.join(os.path.dirname(__file__), '..'); VO = os.path.join(ROOT, 'out', 'vo')
chunks = json.load(open(os.path.join(VO, 'chunks.json'))); SR = 44100
os.makedirs(os.path.join(VO, 'lines'), exist_ok=True)

def load(mp3):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, '<i2').astype(np.float32) / 32768
def silences(x, thr_db=-38, min_d=.12):
    hop = int(.01 * SR); n = len(x) // hop
    e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12); quiet = 20 * np.log10(e) < thr_db
    out = []; i = 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if (j - i) * .01 >= min_d: out.append((i * .01, j * .01))
            i = j
        else: i += 1
    return out
def syllables(s):
    n = 0
    for w in re.findall(r"[A-Za-z']+|\d[\d,]*", s):
        if w[0].isdigit(): d = w.replace(',', ''); n += 2 + (len(d) > 2) * 2 + (len(d) > 3)
        else: n += max(1, len(re.findall(r'[aeiouy]+', w.lower())) - (w.lower().endswith('e') and len(w) > 3))
    return n + .5
def weight(s): return len(s.split()) + .6 * len(re.findall(r'[,:;?.]', s[:-1]))

timings = []; k = 0
for cid, lines in chunks:
    if not os.path.exists(os.path.join(VO, cid + '.mp3')):
        timings += [None] * len(lines); k += len(lines); print(f'{cid}: no VO yet (word-count timing)'); continue
    x = load(os.path.join(VO, cid + '.mp3')); dur = len(x) / SR; sil = silences(x)
    s0 = sil[0][1] if sil and sil[0][0] < .05 else 0.0
    s1 = sil[-1][0] if sil and sil[-1][1] > dur - .05 else dur
    cand = [s for s in sil if s[0] > s0 + .3 and s[1] < s1 - .3]
    n = len(lines); w = np.array([weight(l) for l in lines]); exp = s0 + (s1 - s0) * np.cumsum(w)[:-1] / w.sum()
    cuts = []
    if n > 1:
        # DP over pause candidates: each line's segment length should match its syllable share
        syl = np.array([syllables(l) for l in lines]); m = len(cand)
        if m < n - 1: raise SystemExit(f'{cid}: only {m} pauses for {n} lines')
        speech = (s1 - s0) - 0.45 * (n - 1); rate = syl.sum() / speech
        def seg(i, a, b):
            d = max(b - a, .05); e = syl[i] / rate
            return 6.0 * np.log(d / e) ** 2
        INF = 1e18; P = [(None, s0)] + [(c[0], c[1]) for c in cand]  # node 0 = start
        dp = np.full((n, m + 1), INF); bp = np.zeros((n, m + 1), int)
        # dp[i][j]: line i ends at cand j-1 (j>=1)
        for j in range(1, m + 1): dp[0][j] = seg(0, s0, P[j][0]) - .8 * (P[j][1] - P[j][0])
        for i in range(1, n - 1):
            for j in range(i + 1, m + 1):
                best, arg = INF, 0
                for q in range(i, j):
                    v = dp[i-1][q] + seg(i, P[q][1], P[j][0])
                    if v < best: best, arg = v, q
                dp[i][j] = best - .8 * (P[j][1] - P[j][0]); bp[i][j] = arg
        best, arg = INF, 0
        for q in range(n - 1, m + 1):
            v = dp[n-2][q] + seg(n - 1, P[q][1], s1)
            if v < best: best, arg = v, q
        sel = [arg]; j = arg
        for i in range(n - 2, 0, -1): j = bp[i][j]; sel.append(j)
        cuts = [cand[j - 1] for j in reversed(sel)]
    bounds = [s0] + [c for cut in cuts for c in cut] + [s1]
    for i, line in enumerate(lines):
        a, b = max(0, bounds[2*i] - .04), min(dur, bounds[2*i+1] + .06)
        seg = x[int(a*SR):int(b*SR)]
        with wave.open(os.path.join(VO, 'lines', f'{k:03d}.wav'), 'wb') as f: f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(seg, -1, 1) * 32767).astype('<i2').tobytes())
        timings.append(round(b - a, 3)); k += 1
    print(f'{cid}: {n} lines, {dur:.1f}s, words/s {sum(len(l.split()) for l in lines)/(s1-s0):.2f}')
open(os.path.join(ROOT, 'src', 'timings.js'), 'w').write('// Measured voiceover line durations (tools/vo_align.py). Delete this file to fall back to word-count timing.\nconst TIMINGS_OVERRIDE = ' + json.dumps(timings) + ';\n')
print('lines', k, 'total speech', round(sum(t for t in timings if t), 1), 'missing', timings.count(None), 's')
