import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {FPS, S, VO, voiceFile} from './timing';

const f = (s: number) => Math.max(0, Math.round(s * FPS));

const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.5}) => (
  <Sequence from={f(at)} durationInFrames={f(2)} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

const hasVoice = VO.some((v) => voiceFile(v.id));
const talking = (sec: number) => VO.some((v) => sec >= v.at - 0.1 && sec <= v.at + v.duration + 0.1);

export const Sound: React.FC = () => (
  <>
    {/* score, ducked under the voiceover */}
    <Audio
      src={staticFile('sfx/music.mp3')}
      volume={(fr) => {
        const sec = fr / FPS;
        const base = interpolate(sec, [0, 0.4], [0, 0.6], {extrapolateRight: 'clamp'});
        return base * (hasVoice && talking(sec) ? 0.42 : 1);
      }}
    />

    {/* voiceover (ElevenLabs) */}
    {VO.filter((v) => voiceFile(v.id)).map((v) => (
      <Sequence key={v.id} from={f(v.at)} durationInFrames={f(v.duration + 0.6)} layout="none">
        <Audio src={staticFile(voiceFile(v.id)!)} />
      </Sequence>
    ))}

    {/* hook */}
    <Sfx at={S.hook.netflix} name="notif" volume={0.5} />
    <Sfx at={S.hook.spotify} name="notif" volume={0.5} />
    <Sfx at={S.hook.gym} name="notif" volume={0.55} />
    <Sfx at={S.hook.gym + 0.9} name="pop" volume={0.45} />
    {/* problem */}
    <Sfx at={S.problem.start - 0.2} name="whoosh" volume={0.45} />
    {[0.6, 0.95, 1.3, 1.65].map((d) => (
      <Sfx key={d} at={S.problem.start + d} name="coin" volume={0.25} />
    ))}
    <Sfx at={S.problem.year} name="pop" volume={0.5} />
    <Sfx at={S.problem.notice + 0.35} name="pop" volume={0.4} />
    {/* reveal */}
    <Sfx at={S.reveal.start} name="impact" volume={0.42} />
    <Sfx at={S.reveal.start + 0.3} name="sparkle" volume={0.5} />
    {/* features */}
    {[S.features.a, S.features.b, S.features.c].map((a) => (
      <Sfx key={a} at={a - 0.15} name="whoosh" volume={0.35} />
    ))}
    {[0.55, 0.7, 0.85].map((d) => (
      <Sfx key={`r${d}`} at={S.features.a + d} name="pop" volume={0.3} />
    ))}
    <Sfx at={S.features.b + 0.45} name="notif" volume={0.45} />
    <Sfx at={S.features.b + 0.9} name="notif" volume={0.4} />
    <Sfx at={S.features.c + 0.5} name="coin" volume={0.3} />
    {/* cta */}
    <Sfx at={S.cta.start - 0.15} name="whoosh" volume={0.4} />
    <Sfx at={S.cta.lockup} name="impact" volume={0.38} />
    <Sfx at={S.cta.lockup + 0.1} name="sparkle" volume={0.5} />
    <Sfx at={S.cta.badge} name="pop" volume={0.5} />
  </>
);
