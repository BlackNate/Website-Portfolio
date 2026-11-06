import React from 'react';
import {AbsoluteFill, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {PAGE_CUTS} from './Camera';
import {FPS, HEIGHT, TIMED_SHOTS, TOTAL_SECONDS, WIDTH, lineById} from './timeline';

const PURPLE = '#a855f7';

/** Film grain + vignette + gentle letterbox gradient. */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`gx${frame}`) * 512);
  const oy = Math.floor(random(`gy${frame}`) * 512);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundPosition: `${ox}px ${oy}px`,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

/** White comic flash whenever the camera jumps to a new page. */
export const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = PAGE_CUTS.find((x) => t >= x && t < x + 0.35);
  if (c === undefined) return null;
  const o = interpolate(t - c, [0, 0.06, 0.35], [0, 0.55, 0]);
  return <AbsoluteFill style={{background: '#fff', opacity: o, mixBlendMode: 'screen'}} />;
};

/** Radial speed lines burst on shock moments (shots marked shake). */
export const SpeedLines: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = TIMED_SHOTS.find((x) => x.shake && t >= x.start && t < x.start + 0.7);
  if (!s) return null;
  const k = (t - s.start) / 0.7;
  const o = interpolate(k, [0, 0.1, 1], [0, 0.85, 0]);
  const n = 44;
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 - 120;
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <svg width={WIDTH} height={HEIGHT}>
        {Array.from({length: n}).map((_, i) => {
          const a = (i / n) * Math.PI * 2 + random(`a${i}${s.start}`) * 0.1;
          const r0 = 520 + random(`r${i}${frame >> 1}`) * 160;
          const r1 = 1500;
          const w = 6 + random(`w${i}`) * 16;
          const p = (r: number, da: number) => `${cx + Math.cos(a + da) * r},${cy + Math.sin(a + da) * r}`;
          return <polygon key={i} points={`${p(r0, 0)} ${p(r1, w / 1500)} ${p(r1, -w / 1500)}`} fill="#fff" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Rain streaks during the storm panel (line 11). */
export const Storm: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const l = lineById('11');
  const a = l.start + l.duration * 0.4;
  const b = l.start + l.duration * 0.56;
  if (t < a || t > b) return null;
  const o = interpolate(t, [a, a + 0.3, b - 0.3, b], [0, 1, 1, 0]);
  const lightning = interpolate(t, [a + 0.35, a + 0.4, a + 0.55, a + 0.6, a + 0.7], [0, 0.6, 0.1, 0.45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#cfe3ff', opacity: lightning, mixBlendMode: 'screen'}} />
      <svg width={WIDTH} height={HEIGHT}>
        {Array.from({length: 140}).map((_, i) => {
          const x = random(`rx${i}`) * (WIDTH + 400) - 200;
          const speed = 1900 + random(`rs${i}`) * 900;
          const y = ((random(`ry${i}`) * HEIGHT + (frame / FPS) * speed) % (HEIGHT + 200)) - 100;
          const len = 50 + random(`rl${i}`) * 70;
          return (
            <line key={i} x1={x} y1={y} x2={x - len * 0.25} y2={y + len} stroke="rgba(210,225,255,0.55)" strokeWidth={2.5} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Floating purple sparks around the Trackscribe portal and app. */
export const PortalSparks: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = lineById('12').start - 0.3;
  const b = lineById('15').end + 0.3;
  if (t < a || t > b) return null;
  const o = interpolate(t, [a, a + 0.8, b - 0.6, b], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: 36}).map((_, i) => {
        const x = random(`px${i}`) * WIDTH;
        const sp = 60 + random(`ps${i}`) * 140;
        const y = HEIGHT - (((t - a) * sp + random(`py${i}`) * HEIGHT) % HEIGHT);
        const size = 6 + random(`pz${i}`) * 14;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.sin(t * 1.5 + i) * 30,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#f0abfc' : PURPLE,
              boxShadow: `0 0 ${size * 2}px ${size}px rgba(168,85,247,0.6)`,
              opacity: tw,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Warm sunrise glow for the resolution (scene 7). */
export const SunGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = lineById('16').start;
  if (t < a) return null;
  const o = interpolate(t, [a, a + 1.2], [0, 1], {extrapolateRight: 'clamp'});
  const pulse = 0.75 + 0.25 * Math.sin(t * 1.4);
  return (
    <AbsoluteFill
      style={{
        opacity: o * pulse * 0.55,
        mixBlendMode: 'screen',
        background: 'radial-gradient(circle at 78% 18%, rgba(255,190,90,0.9) 0%, rgba(255,140,60,0.25) 28%, rgba(0,0,0,0) 55%)',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Fade up from black at the start and down to black at the end. */
export const FadeInOut: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = Math.max(
    interpolate(t, [0, 0.6], [1, 0], {extrapolateRight: 'clamp'}),
    interpolate(t, [TOTAL_SECONDS - 0.8, TOTAL_SECONDS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  return <AbsoluteFill style={{background: '#000', opacity: o}} />;
};
