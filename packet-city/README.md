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
audio/               narration tracks (m1_l1.wav)
labs/                module labs
```

The `.meta` files next to the project and scenes are written by the editor. They store render settings and the timing of each narration cue, so commit them.

## Adding a lesson

1. Write `notes/m<M>_l<L>.md` in the seven beats, with a `[cue: name]` before each line of narration.
2. Create the scenes in `src/scenes/` and call `yield* cue('name')` at the matching points.
3. Add `src/m<M>_l<L>.ts` and list it in `vite.config.ts` under `project`.
4. Record narration, then drag each cue in the editor timeline to line up with the voice-over.
