"""Score + UI sound kit for the 30s Trackscribe ad (numpy + ffmpeg, offline).
    python3 scripts/make_sfx.py  ->  public/sfx/*.mp3
The music is arranged to the scene beats in src/timing.ts (120 BPM, 0.5 s per beat).
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(11)
BEAT = 0.5

# scene beats (keep in sync with src/timing.ts)
PROBLEM, REVEAL, LOCKUP, END = 5.0, 11.6, 24.6, 30.0


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def lp(x, hi=None, lo=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g /= 1 + (f / hi) ** 4
    if lo:
        g /= 1 + (lo / np.maximum(f, 1e-3)) ** 4
    return np.fft.irfft(X * g, len(x))


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) or 1) * peak


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    if data.ndim == 1:
        data = np.stack([data, data], 1)
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    fd, path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-b:a", "192k",
                    os.path.join(OUT, name + ".mp3")], check=True)
    os.remove(path)
    print("wrote", name)


def note(f, dur, amp=1.0, decay=4.0, harm=(1, 0.45, 0.2, 0.1), attack=0.004):
    t = t_axis(dur)
    y = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    env = np.exp(-t * decay) * np.minimum(1, t / attack)
    return y * env * amp


def place(buf, x, at, pan=0.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    buf[i:i + n, 0] += x[:n] * (1 - max(0, pan))
    buf[i:i + n, 1] += x[:n] * (1 + min(0, pan))


def kick(amp=1.0):
    t = t_axis(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * amp


def clap(amp=1.0):
    t = t_axis(0.3)
    n = lp(rng.standard_normal(len(t)), hi=6000, lo=900)
    env = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, 0.012, 0.024)) * 0.5 + np.exp(-t * 18) * 0.6
    return n * env * amp


def hat(amp=1.0, open_=False):
    t = t_axis(0.25 if open_ else 0.06)
    return lp(rng.standard_normal(len(t)), lo=7000) * np.exp(-t * (14 if open_ else 70)) * amp


def tick(amp=1.0):
    t = t_axis(0.05)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) * amp


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def music():
    buf = np.zeros((int(SR * END), 2))

    # --- HOOK 0–5s: tense pulse, A minor arpeggio, four-on-floor (soft) ---
    arp = [57, 60, 64, 69, 64, 60]
    for k, at in enumerate(np.arange(0.0, PROBLEM, BEAT / 2)):
        place(buf, note(midi(arp[k % 6] + 12), 0.4, 0.16, 7), at, pan=0.3 if k % 2 else -0.3)
    for at in np.arange(0.0, PROBLEM - 0.25, BEAT):
        place(buf, kick(0.55), at)
        place(buf, hat(0.10), at + BEAT / 2)
    for at in (0.0, 2.0, 4.0):
        place(buf, note(midi(33), 2.0, 0.35, 0.8, (1, 0.5, 0.25)), at)

    # --- PROBLEM 5–11.6: half-time, dark drone + clock ticks ---
    for at in np.arange(PROBLEM, REVEAL - 1.0, BEAT * 2):
        place(buf, kick(0.5), at)
    for at in np.arange(PROBLEM, REVEAL - 0.2, BEAT):
        place(buf, tick(0.14), at)
    drone = note(midi(29), REVEAL - PROBLEM, 0.28, 0.08, (1, 0.6, 0.3, 0.15), attack=0.6)
    drone += note(midi(36), REVEAL - PROBLEM, 0.12, 0.1, (1, 0.3), attack=0.8)
    place(buf, lp(drone, hi=900), PROBLEM)

    # riser into the reveal
    rt = t_axis(1.2)
    rise = lp(rng.standard_normal(len(rt)), lo=600) * (rt / 1.2) ** 2.5 * 0.35
    rise += np.sin(2 * np.pi * np.cumsum(200 * 6 ** (rt / 1.2)) / SR) * (rt / 1.2) ** 2 * 0.15
    place(buf, rise, REVEAL - 1.2)

    # --- REVEAL + GROOVE 11.6–30: C major I–V–vi–IV, full kit ---
    prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]
    bar = BEAT * 4
    start = REVEAL
    for b, at in enumerate(np.arange(start, END - 1.0, bar)):
        root, chord = prog[b % 4]
        place(buf, note(midi(root - 12), bar, 0.42, 1.2, (1, 0.5, 0.2)), at)
        for beat in range(4):
            bt = at + beat * BEAT
            if bt >= END - 1.0:
                break
            place(buf, kick(0.75), bt)
            place(buf, hat(0.12), bt + BEAT / 2)
            if beat in (1, 3):
                place(buf, clap(0.35), bt)
            for i, m in enumerate(chord):
                place(buf, note(midi(m), 0.35, 0.09, 8), bt + BEAT / 2, pan=(i - 1) * 0.4)
        # sparkle melody every other bar
        if b % 2 == 0:
            for j, m in enumerate([72, 76, 79, 76]):
                place(buf, note(midi(m), 0.5, 0.07, 5, (1, 0.2)), at + j * BEAT, pan=0.5)

    # big hit at the lockup + ring-out chord
    place(buf, kick(1.0), LOCKUP)
    for m in (48, 55, 60, 64, 67, 72):
        place(buf, note(midi(m), END - LOCKUP, 0.12, 0.55, (1, 0.4, 0.2), attack=0.01), LOCKUP)

    # gentle master: soft clip + fade
    buf = np.tanh(buf * 1.2)
    fade = int(1.2 * SR)
    buf[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return norm(buf, 0.85)


def pop():
    t = t_axis(0.18)
    f = 500 + 900 * np.exp(-t * 40)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26), 0.7)


def notif():
    y = np.zeros(int(0.9 * SR))
    for at, m in ((0, 88), (0.11, 93)):
        x = note(midi(m), 0.7, 1, 6, (1, 0.3))
        i = int(at * SR)
        y[i:i + len(x)] += x[:len(y) - i]
    return norm(y, 0.7)


def coin():
    y = np.zeros(int(0.8 * SR))
    for at, m in ((0, 95), (0.07, 100)):
        x = note(midi(m), 0.7, 1, 7, (1, 0.6, 0.3, 0.2))
        i = int(at * SR)
        y[i:i + len(x)] += x[:len(y) - i]
    return norm(y, 0.6)


def whoosh():
    t = t_axis(0.7)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    ch = 1024
    for i in range(0, len(n), ch):
        fc = 300 * (12 ** (i / len(n)))
        seg = n[i:i + ch * 2]
        out[i:i + len(seg)] += lp(seg, hi=fc * 1.8, lo=fc / 1.8) * np.hanning(len(seg))
    return norm(out * np.sin(np.pi * t / 0.7) ** 2, 0.7)


def impact():
    t = t_axis(1.6)
    f = 32 + 100 * np.exp(-t * 7)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    y += lp(rng.standard_normal(len(t)), hi=2500) * np.exp(-t * 20) * 0.5
    return norm(y, 0.9)


def sparkle():
    y = np.zeros(int(1.6 * SR))
    for k, m in enumerate((96, 100, 103, 108, 103, 107)):
        x = note(midi(m), 1.0, 0.5, 4, (1, 0.2))
        i = int(k * 0.06 * SR)
        y[i:i + len(x)] += x[:len(y) - i]
    return norm(y, 0.5)


if __name__ == "__main__":
    save("music", music())
    save("pop", pop())
    save("notif", notif())
    save("coin", coin())
    save("whoosh", whoosh())
    save("impact", impact())
    save("sparkle", sparkle())
