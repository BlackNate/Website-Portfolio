# Trackscribe — Episode 001: The Mystery of the Missing Money

A comic-style cinematic vertical video (1080×1920, 30 fps, ~2 min) built with [Remotion](https://remotion.dev)
from the seven Trackscribe comic pages, with a three-character ElevenLabs voice cast.

## What's in the video
- **Camera work:** a virtual camera glides between panels on each page, with eased moves, a slow push-in on holds,
  a punch-in plus white flash on page cuts, and shake with speed lines on the shock beats ("DGT Media Services?!", "I've checked everything!").
- **No added text:** the comic pages already carry their own lettering, so shots are framed to keep each character
  and their speech bubbles in view instead of overlaying captions.
- **Atmosphere:** film grain, vignette, rain and lightning in the storm panel, purple sparks around the portal and app, and a sunrise glow at the finale.
- Fades up on the full first page and ends by pulling back to the full final page (with its Google Play badge).
- **Sound:** a tension drone bed that crossfades into a hopeful major pad at the summit, plus whooshes, a notification ping,
  hits, thunder, a riser into the gateway reveal, and brand booms (all synthesised by `scripts/make_sfx.py`).

## Voice cast (ElevenLabs, model `eleven_v4`)
| Character | Voice | Voice ID |
|---|---|---|
| Narrator | Adrian Vale – Cinematic Narrator | `S4WoGKoPsqqSNhvzIRmc` |
| The Man | Louie the Legend | `ataV0GNgfIus2NWdTJP0` |
| Nekuru | Eldrin – Wise Ancient Wizard | `LvmvHEBEmMJBJw9UuhwO` |

All 16 lines were generated in the ElevenLabs flow "Trackscribe Ep001 - Missing Money VO", two takes each.
Take 1 of each line is the one wired into the timeline.

## Render
```bash
npm install
ELEVENLABS_API_KEY=sk_... npm run fetch-audio   # downloads the 16 voice takes and writes src/audio-manifest.json
npm run render                                   # -> out/trackscribe-episode-001.mp4
```
`fetch-audio` re-times the whole video to the real clip lengths. Without voice files the video still renders, with music and SFX only.

Other commands:
- `npm run studio` opens the Remotion Studio to tweak shots live.
- `npm run sfx` regenerates the music beds and SFX.

## Editing
- `src/timeline.ts` holds every line: speaker, caption text, duration, and the camera shots
  (the caption text is only for reference; `at` = fraction of the line, `x/y` = point on the 941×1672 comic page, `zoom`).
- `src/Camera.tsx` handles the panel camera, `src/Overlays.tsx` the effects and fades,
  and `src/Sound.tsx` the music, voice and SFX mix.
