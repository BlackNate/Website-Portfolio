import {useLogger, useScene, useTime, waitFor, waitUntil} from '@motion-canvas/core';

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
 * A narration cue. Call it after the animation for a line of narration;
 * `waitUntil(name)` adds a time event you can drag in the editor timeline
 * to the moment the next line starts. Cue names match the [cue: ...]
 * markers in notes/<lesson>.md.
 *
 * Before narration exists, `pause` keeps the preview watchable. Once a
 * lesson's project sets `variables: {narrated: true}`, the pause is skipped
 * so the time events alone follow the voice-over, and a cue the animation
 * reaches after its event's time is logged as a warning.
 */
export function* cue(name: string, pause = T.beat) {
  const narrated = useScene().variables.get('narrated', false)();
  if (!narrated) {
    yield* waitFor(pause);
    yield* waitUntil(name);
    return;
  }
  const reached = useTime();
  yield* waitUntil(name);
  if (useTime() === reached) {
    useLogger().warn(`cue "${name}" reached at ${reached.toFixed(2)}s, at or after its event time`);
  }
}
