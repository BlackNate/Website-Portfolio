# Maya's Financial Decisions — Episode 1
### *Maya wants to start investing — but where does she begin?*

A full-length (~18 min, 1920×1080, 30 fps) explainer motion-graphics episode built entirely in code.
The look follows the supplied reference clip: crumpled off-white paper, soft pastel paint blobs, hand-drawn
brush strokes, bold navy-outlined flat icons, springy "pop" entrances and whole-scene slide transitions.
The editorial structure is documentary-style (chapter cards, highlighter headlines, animated diagrams).

Everything is procedural, with no stock assets, so every scene, number, label and timing can be edited.

## What's here

| Path | What it does |
|---|---|
| `index.html` | Preview player (open in Chrome): play, scrub, jump to any scene, captions on/off |
| `src/script.js` | The full narration split into **sections → beats (scenes) → lines (captions)** |
| `src/engine.js` | Paper texture, paint blobs, brush strokes, type, ~60 icons, the Maya character, charts |
| `src/main.js` | Timeline (timing from word count), transitions, chapter tag, captions, chapter cards |
| `src/scenes1-3.js` | One function per scene (cold open → next-episode end card) |
| `tools/events.mjs` | Fast pass that exports `out/timeline.json` and SFX cue points |
| `tools/audio.py` | Procedural music bed (darker during the Risks chapter) and synced SFX → `out/*.wav` |
| `tools/render.mjs` | Parallel headless-Chromium renderer → `out/video_nosound.mp4` |
| `tools/vo_align.py` | Splits chapter VO files into line clips and writes `src/timings.js` |
| `tools/srt.py` | Writes `out/captions.srt` (YouTube closed captions or a VO cue sheet) |

## Build

```bash
# needs node + playwright (chromium), ffmpeg, python3 + numpy
node tools/events.mjs out                 # timeline + sfx cues
python3 tools/audio.py out                # music.wav, sfx.wav, mix.wav
python3 tools/srt.py out                  # captions.srt
node tools/render.mjs --workers 4         # out/video_nosound.mp4  (add --nocaps for a clean version)
ffmpeg -i out/video_nosound.mp4 -i out/mix.wav -c:v copy -c:a aac -b:a 192k -shortest out/maya_ep1.mp4
```

Preview a single moment: `index.html?t=245` · Stills for review: `node tools/stills.mjs <dir> beats`.

## Voiceover

Narration is ElevenLabs (voice: *Jennica*, warm documentary narrator, model `eleven_v4`), generated one
chapter at a time into `out/vo/<chunk>.mp3` (chunk list: `out/vo/chunks.json`). Then:

```bash
python3 tools/vo_align.py     # splits each chapter into per-line clips at the pauses, writes src/timings.js
node tools/events.mjs out && python3 tools/audio.py out   # places each clip at its caption, ducks the music
```

`src/timings.js` holds the measured length of every line. Every animation is keyed to line start times,
so all scenes re-time themselves to the read. A line with no recording (`null`) falls back to word-count timing.

All companies, countries and currencies (Northstar Technologies, the Republic of Arbordale, "units of currency")
are fictional, and every number is illustrative, as in the script.
