"""Procedural score + sound design for the episode.

Reads out/timeline.json and out/sfx.json (from tools/events.mjs) and writes
  out/music.wav  – warm lo-fi explainer bed, follows chapters (darker for Part 10)
  out/sfx.wav    – pops, whooshes, stamps, pencil scratches synced to the animation
  out/mix.wav    – both, mastered (music sits low so a voiceover can be laid on top)
Usage: python3 tools/audio.py [out_dir]
"""
import json, sys, os, wave
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'out')
SR = 44100
tl = json.load(open(os.path.join(OUT, 'timeline.json')))
sfx = json.load(open(os.path.join(OUT, 'sfx.json')))
TOTAL = tl['total']
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr); n = int(n)
    e = np.full(n, s, dtype=np.float32)
    if a: e[:min(a, n)] = np.linspace(0, 1, a)[:min(a, n)]
    if d and a < n: k = min(d, n - a); e[a:a + k] = np.linspace(1, s, d)[:k]
    if r: k = min(r, n); e[n - k:] *= np.linspace(1, 0, k)
    return e
def lowpass(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / np.sqrt(1 + (f / hi) ** 4)); return np.fft.irfft(X, len(x)).astype(np.float32)

# ── harmony per chapter ────────────────────────────────────────────────────
BRIGHT = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]      # Fmaj7 Am7 Dm7 Bbmaj7
WARM   = [[48, 52, 55, 59], [45, 48, 52, 55], [53, 57, 60, 64], [55, 59, 62, 65]]      # Cmaj7 Am7 Fmaj7 G7
DARK   = [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]]      # Dm7 Bbmaj7 Gm7 A7
BPM = 90; BEAT = 60 / BPM; BAR = BEAT * 4; CH = BAR * 2

def mood_at(t):
    for b in tl['beats']:
        if b['start'] - .5 <= t < b['end']:
            if b['mood'] == 'serious': return 'dark'
            if b['sec'] in ('open', 'close', 'p11'): return 'warm'
            return 'bright'
    return 'warm'

L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    k = min(len(x), len(buf) - i); buf[i:i + k] += x[:k] * gain

# pads + bass + plucks + shaker
nchords = int(TOTAL / CH) + 2
for c in range(nchords):
    t0 = c * CH; mood = mood_at(t0 + .1); prog = {'bright': BRIGHT, 'warm': WARM, 'dark': DARK}[mood]; ch = prog[c % 4]
    n = int((CH + 1.2) * SR); tt = np.arange(n) / SR
    pad = np.zeros(n, np.float32)
    for k, m in enumerate(ch):
        f = midi(m + 12 if mood != 'dark' else m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            pad += (np.sin(2 * np.pi * ff * tt) + .25 * np.sin(4 * np.pi * ff * tt + .3) + .1 * np.sin(6 * np.pi * ff * tt)).astype(np.float32)
    pad *= env_adsr(n, 1.0, .5, .85, 1.4) * (1 + .15 * np.sin(2 * np.pi * .25 * tt)).astype(np.float32)
    pad = lowpass(pad, 1400 if mood != 'dark' else 900) * 0.022
    add(L, pad, t0, 1.0); add(R, pad, t0, .9)
    # bass
    for beat in (0, 2.5, 4, 6.5):
        bt = t0 + beat * BEAT; bn = int(BEAT * 1.4 * SR); btt = np.arange(bn) / SR; f = midi(ch[0] - 12)
        b = (np.sin(2 * np.pi * f * btt) + .3 * np.sin(4 * np.pi * f * btt)) * np.exp(-btt * 3.0) * env_adsr(bn, .01, .1, 1, .08)
        add(L, b.astype(np.float32), bt, .07); add(R, b.astype(np.float32), bt, .07)
    # plucked arpeggio (8ths)
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for i in range(16):
        if mood == 'dark' and i % 2: continue
        if t0 + i * BEAT / 2 < 4.0: continue  # let the open breathe
        m = ch[pat[i % 8]] + 24; f = midi(m); pn = int(.6 * SR); ptt = np.arange(pn) / SR
        p = (np.sin(2 * np.pi * f * ptt) + .35 * np.sin(4 * np.pi * f * ptt) + .12 * np.sin(6 * np.pi * f * ptt)) * np.exp(-ptt * 9)
        p = p.astype(np.float32) * env_adsr(pn, .003, .05, 1, .05); g = .03 if mood != 'dark' else .022
        pan = .5 + .3 * np.sin(i)
        add(L, p, t0 + i * BEAT / 2, g * (1 - pan) * 2); add(R, p, t0 + i * BEAT / 2, g * pan * 2)
    # shaker + soft kick
    if mood != 'dark' and t0 > 8:
        for i in range(16):
            sn = int(.08 * SR); s = rng.standard_normal(sn).astype(np.float32) * np.exp(-np.arange(sn) / SR * 60).astype(np.float32)
            s = bandpass(s, 5000, 11000); add(L, s, t0 + i * BEAT / 2 + BEAT / 4, .018 if i % 2 else .01); add(R, s, t0 + i * BEAT / 2 + BEAT / 4, .014 if i % 2 else .012)
        for beat in (0, 4):
            kn = int(.3 * SR); ktt = np.arange(kn) / SR; k = np.sin(2 * np.pi * (50 + 80 * np.exp(-ktt * 30)) * ktt) * np.exp(-ktt * 12)
            add(L, k.astype(np.float32), t0 + beat * BEAT, .09); add(R, k.astype(np.float32), t0 + beat * BEAT, .09)

# chapter chime at each title card
for b in tl['beats']:
    if b['scene'] in ('titleCard', 'episodeTitle'):
        for j, m in enumerate((72, 76, 79, 84)):
            cn = int(2.5 * SR); ctt = np.arange(cn) / SR; f = midi(m)
            c = (np.sin(2 * np.pi * f * ctt) + .4 * np.sin(2 * np.pi * f * 2.76 * ctt) * np.exp(-ctt * 4)) * np.exp(-ctt * 2.2)
            add(L, c.astype(np.float32), b['start'] + .35 + j * .09, .05); add(R, c.astype(np.float32), b['start'] + .35 + j * .09, .05)

music = np.stack([L, R], 1)
# fades
fi = int(1.5 * SR); music[:fi] *= np.linspace(0, 1, fi)[:, None]
fo_start = int((TOTAL - 4) * SR); fo = N - fo_start; music[fo_start:] *= np.linspace(1, 0, fo)[:, None]

# ── SFX ───────────────────────────────────────────────────────────────────
S = np.zeros((N, 2), np.float32)
def put(x, at, g, pan=.5):
    i = int(at * SR); k = min(len(x), N - i)
    if i < 0 or k <= 0: return
    S[i:i + k, 0] += x[:k] * g * (1 - pan) * 2; S[i:i + k, 1] += x[:k] * g * pan * 2
def pop(seed):
    r = np.random.default_rng(seed); n = int(.09 * SR); tt = np.arange(n) / SR; f0 = 700 + r.random() * 500
    ph = 2 * np.pi * np.cumsum(f0 * (0.55 + .45 * np.exp(-tt * 40))) / SR
    return (np.sin(ph) * np.exp(-tt * 45)).astype(np.float32)
def whoosh(seed):
    r = np.random.default_rng(seed); n = int(.75 * SR); x = r.standard_normal(n).astype(np.float32)
    x = bandpass(x, 300, 2600); tt = np.linspace(0, 1, n); e = np.sin(np.pi * tt) ** 2 * np.exp(-tt * 1.2); return (x * e).astype(np.float32)
def stamp(seed):
    n = int(.25 * SR); tt = np.arange(n) / SR; th = np.sin(2 * np.pi * (90 + 120 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 18)
    cl = np.random.default_rng(seed).standard_normal(n) * np.exp(-tt * 120); return (th + .4 * cl).astype(np.float32)
def write(seed):
    r = np.random.default_rng(seed); n = int(1.0 * SR); x = bandpass(r.standard_normal(n).astype(np.float32), 2500, 7000)
    tt = np.arange(n) / SR; trem = (.5 + .5 * np.abs(np.sin(2 * np.pi * 7 * tt + r.random()))) * env_adsr(n, .05, .1, 1, .3); return (x * trem).astype(np.float32)

last = {}
for i, e in enumerate(sorted(sfx, key=lambda e: e['t'])):
    k, t = e['kind'], e['t']
    gap = {'pop': .07, 'whoosh': .5, 'stamp': .3, 'write': .8}[k]
    if t - last.get(k, -9) < gap: continue
    last[k] = t; pan = .35 + .3 * ((i * 37) % 10) / 10
    if k == 'pop': put(pop(i), t + .02, .05, pan)
    elif k == 'whoosh': put(whoosh(i), t + .05, .09)
    elif k == 'stamp': put(stamp(i), t + .12, .22)
    elif k == 'write': put(write(i), t + .1, .03, pan)

def save(name, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())

# ── voiceover (out/vo/lines/NNN.wav, placed at each caption's start) + ducking ──
VOD = os.path.join(OUT, 'vo', 'lines'); V = np.zeros(N, np.float32); have_vo = False
for i, l in enumerate(tl['lines']):
    f = os.path.join(VOD, f'{i:03d}.wav')
    if not os.path.exists(f): continue
    with wave.open(f) as w: x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    j = int(l['start'] * SR); k = min(len(x), N - j); V[j:j + k] += x[:k]; have_vo = True
if have_vo:
    V *= .5 / (np.percentile(np.abs(V[V != 0]), 99.5) + 1e-9)          # normalise narration
    hop = 441; env = np.abs(V[:len(V) // hop * hop]).reshape(-1, hop).max(1) > .02
    k = 60; env = np.convolve(env.astype(float), np.ones(k) / k, 'same') > 0        # hold through short gaps
    duck = np.repeat(np.convolve(env.astype(float), np.ones(30) / 30, 'same'), hop)  # ~0.3s ramps
    duck = np.pad(duck, (0, N - len(duck)), 'edge')[:N]
    music *= (1 - .55 * duck)[:, None]; S *= (1 - .3 * duck)[:, None]
    save_vo = True
mix = music + S + V[:, None]
rms0 = np.sqrt(np.mean(mix ** 2)); gain = 10 ** ((-17 - 20 * np.log10(rms0)) / 20)   # target ~-17 dBFS RMS
lim = lambda x: np.tanh(x / .95) * .95                                               # soft limiter
peak = np.max(np.abs(mix))
print('peak', round(float(peak), 3), 'gain', round(float(gain), 2), 'rms(dB)', round(float(20 * np.log10(np.sqrt(np.mean(lim(mix * gain) ** 2)))), 1))
save('music.wav', lim(music * gain)); save('sfx.wav', lim(S * gain)); save('mix.wav', lim(mix * gain))
if have_vo: save('voice.wav', lim(np.stack([V, V], 1) * gain))
print('wrote', OUT)
