# Packet City

Animated Network+ lessons built with [Motion Canvas](https://motioncanvas.io). Each lesson is a separate Motion Canvas project made from a short chain of scenes, one per beat of the lesson template.

## Run it

```bash
cd packet-city
npm install
npm start        # opens the editor at http://localhost:9000
```

In the editor, use **Video Settings → Render** to export. Choose the "Video (FFmpeg)" exporter for an `.mp4`, or "Image sequence" for PNG frames. Output goes to `output/`, which is not committed.

`npm run check` type-checks everything.

## Narration

1. Generate one ElevenLabs clip per beat from `notes/<lesson>_elevenlabs.txt` and save them as `audio/<lesson>_<beat>.mp3`.
2. Run `python3 scripts/build-audio.py <lesson>` (needs ffmpeg and `pip install pocketsphinx`). It aligns each clip to its text, sets every cue in the scene `.meta` files to the moment its line is spoken, adds back any long pause the voice skipped, and writes the combined track `audio/<lesson>.mp3`.
3. In the lesson's project file, import that track as `audio` and set `variables: {narrated: true}`. This turns off the preview pauses so the cues alone follow the voice.
4. Open the editor. If an animation runs longer than its line, the editor's console warns that the cue was reached late; shorten the animation or drag the cue.

## Layout

```text
src/
  m1_l1.ts           project file for Module 1, Lesson 1 (one per lesson)
  theme.ts           colors, fonts and sizes
  timing.ts          standard durations and the cue() narration helper
  paths.ts           turn devices into packet routes
  topologies.tsx     saved starting networks (oneHouse)
  components/        CityMap, Device, Link, Packet, Terminal,
                     FaultMarker, TermChip, GuessCard, RecapCard
  scenes/            m1_l1_hook, _concept, _realterms, _walkthrough, _wrong, _recap
notes/m1_l1.md       narration script with [cue: …] markers and accuracy notes
quizzes/m1_l1.json   5 tagged quiz questions
audio/               narration clips per beat, and the combined m1_l1.mp3
scripts/build-audio.py  lines narration up with the scenes
labs/                module labs
```

The `.meta` files next to the project and scenes are written by the editor. They store render settings and the timing of each narration cue, so commit them.

## Adding a lesson

1. Write `notes/m<M>_l<L>.md` in the seven beats, with a `[cue: name]` before each line of narration.
2. Create the scenes in `src/scenes/` and call `yield* cue('name')` at the matching points.
3. Add `src/m<M>_l<L>.ts` and list it in `vite.config.ts` under `project`.
4. Record narration and follow the Narration steps above.
