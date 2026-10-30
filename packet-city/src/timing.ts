import {waitFor, waitUntil} from '@motion-canvas/core';

// Standard durations in seconds, so every lesson moves at the same pace.
export const T = {
  hop: 0.7, // one packet hop between two devices
  fade: 0.4, // things appearing or disappearing
  pop: 0.35, // small emphasis (a chip, a light)
  draw: 0.8, // drawing a cable or a shape
  beat: 0.8, // breathing room between two actions
  read: 2.5, // time to read a short label
  think: 5, // GuessCard countdown before the reveal
  typeChar: 0.045, // one character typed in the Terminal
};

/**
 * A narration cue. `waitFor(pause)` keeps the preview watchable before any
 * voice-over exists; `waitUntil(name)` adds a time event you can drag in the
 * editor timeline to line the animation up with the recorded narration.
 * Cue names match the [cue: ...] markers in notes/m1_l1.md.
 */
export function* cue(name: string, pause = T.beat) {
  yield* waitFor(pause);
  yield* waitUntil(name);
}
