"""Synthesise the music bed and sound effects for the Trackscribe video.

Pure numpy + ffmpeg, so it runs offline. Writes MP3s to public/sfx/.
    python3 scripts/make_sfx.py
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def fft_filter(x, lo=None, hi=None):
    """Brick-ish band filter with a soft edge, done in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))


def sweep_filter(x, f_start, f_end, width=1.0, chunk=1024):
    """Band-pass whose centre glides from f_start to f_end (log)."""
    out = np.zeros_like(x)
    n = len(x)
    win = np.hanning(chunk * 2)
    for i in range(0, n, chunk):
        seg = x[i:i + chunk * 2]
        if len(seg) < 8:
            break
        p = i / n
        fc = f_start * (f_end / f_start) ** p
        y = fft_filter(seg, lo=fc / (1 + width), hi=fc * (1 + width))
        out[i:i + len(seg)] += y * win[:len(seg)]
    return out


def env(n, a, r, sustain_end=None):
    e = np.ones(n)
    ai = max(1, int(a * SR))
    ri = max(1, int(r * SR))
    e[:ai] = np.linspace(0, 1, ai)
    if sustain_end is None:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


def norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def stereo(l, r=None):
    if r is None:
        r = l
    return np.stack([l, r], axis=1)


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    if data.ndim == 1:
        data = stereo(data)
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        path = tmp.name
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    dst = os.path.join(OUT, name + ".mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path,
                    "-codec:a", "libmp3lame", "-b:a", "160k", dst], check=True)
    os.remove(path)
    print("wrote", dst)


def soft_tone(freq, t, harmonics=(1, 0.5, 0.25, 0.12), detune=0.0):
    y = np.zeros_like(t)
    for k, amp in enumerate(harmonics, start=1):
        y += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t)
    return y


def seamless(x, fade=2.0):
    """Crossfade tail into head so the file loops without a click."""
    n = int(fade * SR)
    head, tail = x[:n].copy(), x[-n:].copy()
    ramp = np.linspace(0, 1, n)[:, None] if x.ndim == 2 else np.linspace(0, 1, n)
    x = x[:-n].copy()
    x[:n] = tail * (1 - ramp) + head * ramp
    return x


# ---------- music beds ----------
def tension_bed(sec=64):
    t = t_axis(sec)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.08 * t)
    drone = (soft_tone(55, t) * 0.9 + soft_tone(82.41, t) * 0.5 +
             soft_tone(130.81, t, (1, 0.3)) * 0.18 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t)))
    drone *= lfo
    # heartbeat-like low pulse every 1.6s
    pulse = np.zeros_like(t)
    period = 1.6
    for start in np.arange(0, sec, period):
        for off, amp in ((0, 1.0), (0.22, 0.6)):
            i = int((start + off) * SR)
            n = int(0.35 * SR)
            if i + n >= len(t):
                continue
            tt = np.arange(n) / SR
            pulse[i:i + n] += amp * np.sin(2 * np.pi * (48 - 20 * tt) * tt) * np.exp(-tt * 14)
    wind = fft_filter(rng.standard_normal(len(t)), lo=200, hi=900) * 0.25
    wind *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + 1)
    l = drone + pulse * 0.9 + wind
    r = drone + pulse * 0.9 + np.roll(wind, 2000)
    return seamless(norm(stereo(l, r), 0.7))


def hope_bed(sec=64):
    t = t_axis(sec)
    chord = [110.0, 138.59, 164.81, 220.0, 277.18]
    pad = np.zeros_like(t)
    for i, f in enumerate(chord):
        swell = 0.7 + 0.3 * np.sin(2 * np.pi * (0.07 + i * 0.013) * t + i)
        pad += (soft_tone(f, t, (1, 0.35, 0.15)) + soft_tone(f, t, (1, 0.3), detune=0.003)) * swell
    pad = fft_filter(pad, hi=2500)
    # gentle arpeggio sparkle
    arp = np.zeros_like(t)
    notes = [440, 554.37, 659.25, 880, 659.25, 554.37]
    step = 0.4
    for k, start in enumerate(np.arange(0, sec, step)):
        i = int(start * SR)
        n = int(1.2 * SR)
        if i + n >= len(t):
            continue
        tt = np.arange(n) / SR
        f = notes[k % len(notes)]
        arp[i:i + n] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 4) * 0.22
    l = pad + arp
    r = pad + np.roll(arp, int(0.18 * SR))
    return seamless(norm(stereo(l, r), 0.7))


# ---------- one-shots ----------
def whoosh():
    sec = 0.9
    t = t_axis(sec)
    n = rng.standard_normal(len(t))
    y = sweep_filter(n, 300, 3500, 0.8)
    y *= np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 2
    return norm(y, 0.8)


def ping():
    sec = 1.2
    t = t_axis(sec)
    y = np.zeros_like(t)
    for start, f in ((0, 1318.5), (0.12, 1760)):
        tt = np.clip(t - start, 0, None)
        on = (t >= start).astype(float)
        y += on * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2 * tt)) * np.exp(-tt * 6)
    return norm(y, 0.8)


def boom():
    sec = 2.5
    t = t_axis(sec)
    f = 30 + 90 * np.exp(-t * 6)
    phase = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(phase) * np.exp(-t * 1.6)
    hit = fft_filter(rng.standard_normal(len(t)), hi=1800) * np.exp(-t * 18) * 0.6
    return norm(y + hit, 0.9)


def riser():
    sec = 3.0
    t = t_axis(sec)
    n = sweep_filter(rng.standard_normal(len(t)), 200, 6000, 0.6)
    f = 110 * (8 ** (t / sec))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    y = (n + tone) * (t / sec) ** 2
    y[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return norm(y, 0.8)


def shimmer():
    sec = 3.0
    t = t_axis(sec)
    y = np.zeros_like(t)
    freqs = [1760, 2217, 2637, 3520, 2637, 2217, 2960, 3520]
    for k, f in enumerate(freqs):
        st = k * 0.09
        tt = np.clip(t - st, 0, None)
        y += (t >= st) * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.5) * 0.4
    y += fft_filter(rng.standard_normal(len(t)), lo=5000) * np.exp(-t * 1.2) * 0.15
    return norm(y, 0.6)


def thunder():
    sec = 4.0
    t = t_axis(sec)
    n = fft_filter(rng.standard_normal(len(t)), hi=260)
    e = np.exp(-t * 1.1) * (1 - np.exp(-t * 30))
    crack = fft_filter(rng.standard_normal(len(t)), lo=800, hi=5000) * np.exp(-t * 9) * 0.4
    rain = fft_filter(rng.standard_normal(len(t)), lo=2500, hi=9000) * 0.12
    return norm(n * e + crack + rain, 0.85)


def hit():
    """Comic panel 'punch' accent."""
    sec = 0.6
    t = t_axis(sec)
    y = np.sin(2 * np.pi * (180 - 120 * t) * t) * np.exp(-t * 12)
    y += fft_filter(rng.standard_normal(len(t)), lo=1500) * np.exp(-t * 40) * 0.5
    return norm(y, 0.85)


if __name__ == "__main__":
    save("music_tension", tension_bed())
    save("music_hope", hope_bed())
    save("whoosh", whoosh())
    save("ping", ping())
    save("boom", boom())
    save("riser", riser())
    save("shimmer", shimmer())
    save("thunder", thunder())
    save("hit", hit())
