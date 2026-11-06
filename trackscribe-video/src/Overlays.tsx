import React from 'react';
import {AbsoluteFill, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import {PAGE_CUTS} from './Camera';
import {FPS, HEIGHT, INTRO, TIMED_SHOTS, TOTAL_SECONDS, WIDTH, lineById} from './timeline';

const DISPLAY = "'Bangers', 'Impact', sans-serif";
const LETTERING = "'Comic Neue', 'Comic Sans MS', sans-serif";
const PURPLE = '#a855f7';

export const LogoMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c084fc" />
        <stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect x="8" y="16" width="84" height="76" rx="16" fill="url(#lg)" stroke="#fff" strokeWidth="4" />
    <rect x="8" y="16" width="84" height="20" rx="10" fill="#6d28d9" />
    <rect x="26" y="6" width="9" height="22" rx="4" fill="#fff" />
    <rect x="65" y="6" width="9" height="22" rx="4" fill="#fff" />
    {[0, 1, 2, 3].map((c) =>
      [0, 1, 2].map((r) => (
        <rect key={`${c}-${r}`} x={20 + c * 16} y={44 + r * 15} width={11} height={10} rx={2} fill="#fff" />
      )),
    )}
  </svg>
);

export const Wordmark: React.FC<{scale?: number}> = ({scale = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22 * scale}}>
    <LogoMark size={130 * scale} />
    <div style={{position: 'relative'}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 140 * scale,
          color: '#fff',
          letterSpacing: 4 * scale,
          lineHeight: 1,
          textShadow: `${6 * scale}px ${6 * scale}px 0 #000, 0 0 ${40 * scale}px rgba(168,85,247,0.8)`,
          transform: 'skewX(-6deg)',
        }}
      >
        TRACKSCRIBE
      </div>
      <div
        style={{
          height: 12 * scale,
          marginTop: 6 * scale,
          background: `linear-gradient(90deg, ${PURPLE}, #7c3aed 70%, transparent)`,
          borderRadius: 6,
          transform: 'skewX(-20deg)',
        }}
      />
    </div>
  </div>
);

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

/** Title card over the first page. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t > INTRO + 0.2) return null;
  const out = interpolate(t, [INTRO - 0.45, INTRO], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logo = spring({frame: frame - 8, fps: FPS, config: {damping: 9, stiffness: 160}});
  const ep = spring({frame: frame - 26, fps: FPS, config: {damping: 12}});
  const sub = interpolate(frame, [36, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dark = interpolate(t, [0, 0.4], [1, 0.72], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <AbsoluteFill style={{background: `rgba(10,4,22,${dark})`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40}}>
        <div style={{transform: `scale(${0.4 + 0.6 * logo}) rotate(${(1 - logo) * -8}deg)`, opacity: Math.min(1, logo * 1.5)}}>
          <Wordmark scale={0.9} />
        </div>
        <div
          style={{
            transform: `translateX(${(1 - ep) * 600}px) rotate(-3deg)`,
            background: '#ffe14d',
            border: '6px solid #111',
            boxShadow: '8px 8px 0 #000',
            padding: '10px 36px',
            fontFamily: DISPLAY,
            fontSize: 72,
            letterSpacing: 4,
            color: '#111',
          }}
        >
          EPISODE 001
        </div>
        <div
          style={{
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
            fontFamily: LETTERING,
            fontWeight: 700,
            fontSize: 50,
            color: '#fff',
            textAlign: 'center',
            letterSpacing: 2,
            textShadow: '4px 4px 0 #000',
            padding: '0 80px',
          }}
        >
          THE MYSTERY OF THE
          <br />
          <span style={{color: '#ff4d4d', fontSize: 72, fontFamily: DISPLAY, letterSpacing: 4}}>MISSING MONEY</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Closing brand card. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const a = TOTAL_SECONDS - 2.6;
  if (t < a) return null;
  const f = frame - Math.round(a * FPS);
  const bg = interpolate(t, [a, a + 0.5], [0, 0.82], {extrapolateRight: 'clamp'});
  const logo = spring({frame: f, fps: FPS, config: {damping: 10, stiffness: 150}});
  const tag = spring({frame: f - 10, fps: FPS, config: {damping: 14}});
  const badge = spring({frame: f - 18, fps: FPS, config: {damping: 12}});
  const fade = interpolate(t, [TOTAL_SECONDS - 0.4, TOTAL_SECONDS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = 0.6 + 0.4 * Math.sin(t * 5);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(12,4,26,${bg})`}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 60}}>
        <div style={{transform: `scale(${logo})`}}>
          <Wordmark scale={0.9} />
        </div>
        <div
          style={{
            opacity: tag,
            transform: `translateY(${(1 - tag) * 40}px)`,
            fontFamily: DISPLAY,
            fontSize: 70,
            color: '#fff',
            textAlign: 'center',
            letterSpacing: 3,
            lineHeight: 1.15,
            textShadow: '5px 5px 0 #000',
          }}
        >
          TRACK IT. DON&apos;T LOSE IT.
          <br />
          <span style={{color: '#ffe14d'}}>TAKE CONTROL OF YOUR MONEY.</span>
        </div>
        <div
          style={{
            transform: `scale(${badge})`,
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            background: '#000',
            border: '4px solid #ffd54a',
            borderRadius: 26,
            padding: '20px 44px',
            boxShadow: `0 0 ${50 * glow}px rgba(255,213,74,0.7)`,
          }}
        >
          <svg width={90} height={100} viewBox="0 0 90 100">
            <path d="M5 5 L55 50 L5 95 Z" fill="#00d7fe" />
            <path d="M5 5 L70 41 L55 50 Z" fill="#00f076" />
            <path d="M5 95 L70 59 L55 50 Z" fill="#ff3a44" />
            <path d="M70 41 L88 50 L70 59 L55 50 Z" fill="#ffd400" />
          </svg>
          <div style={{color: '#fff', fontFamily: 'Arial, sans-serif'}}>
            <div style={{fontSize: 30, letterSpacing: 2}}>GET IT ON</div>
            <div style={{fontSize: 64, fontWeight: 700, lineHeight: 1}}>Google Play</div>
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
