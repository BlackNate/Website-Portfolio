import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {PAGE_CUTS} from './Camera';
import {FPS, INTRO, TIMED_LINES, TIMED_SHOTS, TOTAL_FRAMES, TOTAL_SECONDS, audioFile, hasAudio, lineById} from './timeline';

const f = (sec: number) => Math.max(0, Math.round(sec * FPS));

const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.6}) => (
  <Sequence from={f(at)} durationInFrames={f(4)} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

/** Is any voice line playing at this frame? Used to duck the music under dialogue. */
const speaking = (frame: number) => {
  const t = frame / FPS;
  return TIMED_LINES.some((l) => t >= l.start - 0.15 && t <= l.end + 0.15);
};

export const Sound: React.FC = () => {
  const l11 = lineById('11');
  const l12 = lineById('12');
  const l16 = lineById('16');
  const swapStart = l11.start + l11.duration * 0.72;
  const swapEnd = l12.start;
  const anyVoice = TIMED_LINES.some((l) => hasAudio(l.id));

  const duck = (frame: number) => (anyVoice && speaking(frame) ? 0.55 : 1);

  return (
    <>
      {/* ---------- music beds ---------- */}
      <Audio
        src={staticFile('sfx/music_tension.mp3')}
        loop
        volume={(fr) => {
          const t = fr / FPS;
          const v = interpolate(t, [0, 1.2, swapStart, swapEnd], [0, 0.5, 0.42, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return v * duck(fr);
        }}
      />
      <Audio
        src={staticFile('sfx/music_hope.mp3')}
        loop
        volume={(fr) => {
          const t = fr / FPS;
          const v = interpolate(
            t,
            [swapStart, swapEnd, l16.start, TOTAL_SECONDS - 2.6, TOTAL_SECONDS - 0.4, TOTAL_SECONDS],
            [0, 0.38, 0.42, 0.6, 0.6, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );
          return v * duck(fr);
        }}
      />

      {/* ---------- voices (ElevenLabs) ---------- */}
      {TIMED_LINES.filter((l) => hasAudio(l.id)).map((l) => (
        <Sequence key={l.id} from={f(l.start)} durationInFrames={Math.min(f(l.duration + 1), TOTAL_FRAMES - f(l.start))} layout="none">
          <Audio src={staticFile(audioFile(l.id)!)} volume={1} />
        </Sequence>
      ))}

      {/* ---------- sound design ---------- */}
      <Sfx at={0.25} name="boom" volume={0.8} />
      <Sfx at={0.85} name="hit" volume={0.5} />
      <Sfx at={INTRO - 0.45} name="whoosh" volume={0.5} />
      {PAGE_CUTS.map((c) => (
        <Sfx key={c} at={c - 0.25} name="whoosh" volume={0.45} />
      ))}
      {/* notification ping (before "DGT Media Services?") */}
      <Sfx at={lineById('04').start - 0.55} name="ping" volume={0.7} />
      {TIMED_SHOTS.filter((s) => s.shake && s.scene !== 4).map((s) => (
        <Sfx key={`hit${s.start}`} at={s.start} name="hit" volume={0.55} />
      ))}
      {/* storm */}
      <Sfx at={l11.start + l11.duration * 0.42} name="thunder" volume={0.7} />
      {/* rising tension into the gateway reveal */}
      <Sfx at={l11.end - 2.2} name="riser" volume={0.45} />
      <Sfx at={l12.start + l12.duration * 0.66} name="boom" volume={0.7} />
      <Sfx at={l12.start + l12.duration * 0.66} name="shimmer" volume={0.6} />
      <Sfx at={lineById('14').start - 0.3} name="shimmer" volume={0.4} />
      {/* brand hit on "Trackscribe." in the closing line */}
      <Sfx at={l16.start + l16.duration * 0.66} name="boom" volume={0.6} />
      <Sfx at={TOTAL_SECONDS - 2.6} name="shimmer" volume={0.55} />
    </>
  );
};
