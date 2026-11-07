import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';

export const C = {
  bg0: '#0B0616',
  bg1: '#1A0B2E',
  violet: '#8B5CF6',
  violetD: '#6D28D9',
  lilac: '#C4B5FD',
  yellow: '#FFD23F',
  red: '#FF4D5E',
  mint: '#2EE6A6',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.62)',
};
export const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {frame, fps, t: frame / fps};
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 spring starting at `at` seconds. */
export const useSpringAt = (at: number, config = {damping: 16, stiffness: 140, mass: 0.9}) => {
  const {frame, fps} = useT();
  return spring({frame: frame - Math.round(at * fps), fps, config});
};

/** Fade/scale out helper: 1 until `at`, then 0 over `dur`. */
export const outAt = (t: number, at: number, dur = 0.35) => interpolate(t, [at, at + dur], [1, 0], clamp);

type Word = string | {w: string; color?: string; under?: boolean};

/**
 * Kinetic headline: each word rises out of its own mask, staggered.
 * Exits by sliding up and fading at `out`.
 */
export const Kinetic: React.FC<{
  words: Word[];
  at: number;
  out?: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
  stagger?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({words, at, out, size = 104, color = C.white, align = 'center', stagger = 0.07, weight = 800, style}) => {
  const {frame, fps, t} = useT();
  const exit = out === undefined ? 0 : interpolate(t, [out, out + 0.3], [0, 1], clamp);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: -size * 0.035,
        color,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 60}px)`,
        ...style,
      }}
    >
      {words.map((raw, i) => {
        const w = typeof raw === 'string' ? {w: raw} : raw;
        const s = spring({frame: frame - Math.round((at + i * stagger) * fps), fps, config: {damping: 15, stiffness: 160}});
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - s) * 150}%) rotate(${(1 - s) * 6}deg)`,
                color: w.color ?? color,
                position: 'relative',
              }}
            >
              {w.w}
              {w.under && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: size * 0.02,
                    height: size * 0.11,
                    borderRadius: size,
                    background: w.color ?? C.yellow,
                    transformOrigin: 'left',
                    transform: `scaleX(${interpolate(t, [at + i * stagger + 0.25, at + i * stagger + 0.6], [0, 1], clamp)})`,
                    opacity: 0.9,
                  }}
                />
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Lottie placed by centre point, with pop-in and optional exit. */
export const LottieAt: React.FC<{
  data: unknown;
  x: number;
  y: number;
  size: number;
  at?: number;
  out?: number;
  loop?: boolean;
  speed?: number;
  pop?: boolean;
}> = ({data, x, y, size, at = 0, out, loop = false, speed = 1, pop = true}) => {
  const {t} = useT();
  const s = useSpringAt(at, {damping: 13, stiffness: 170, mass: 0.8});
  const o = out === undefined ? 1 : outAt(t, out);
  if (t < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${(pop ? 0.6 + 0.4 * s : 1) * (0.85 + 0.15 * o)})`,
        opacity: Math.min(1, s * 1.4) * o,
      }}
    >
      <Lottie animationData={data as LottieAnimationData} loop={loop} playbackRate={speed} />
    </div>
  );
};

/** Initial-letter tile used instead of third-party logos. */
export const AppTile: React.FC<{letter: string; color: string; size?: number}> = ({letter, color, size = 84}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: color,
      color: '#fff',
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.15)',
    }}
  >
    {letter}
  </div>
);

/** Bank-style charge notification card. */
export const ChargeCard: React.FC<{
  name: string;
  letter: string;
  tile: string;
  amount: string;
  sub?: string;
  style?: React.CSSProperties;
  flag?: React.ReactNode;
}> = ({name, letter, tile, amount, sub = 'Debit order · just now', style, flag}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      padding: '26px 30px',
      width: 780,
      borderRadius: 40,
      background: 'rgba(255,255,255,0.96)',
      boxShadow: '0 30px 60px rgba(8,2,20,0.45), 0 2px 0 rgba(255,255,255,0.6) inset',
      fontFamily: FONT,
      position: 'relative',
      ...style,
    }}
  >
    <AppTile letter={letter} color={tile} />
    <div style={{flex: 1}}>
      <div style={{fontWeight: 800, fontSize: 40, color: '#1A0B2E', letterSpacing: -0.5}}>{name}</div>
      <div style={{fontWeight: 500, fontSize: 28, color: '#7A6E92'}}>{sub}</div>
    </div>
    <div style={{fontWeight: 800, fontSize: 44, color: C.red, letterSpacing: -1}}>{amount}</div>
    {flag}
  </div>
);

/** Ambient brand background: gradient, drifting light orbs, fine grid. */
export const Backdrop: React.FC<{danger: number; bright: number}> = ({danger, bright}) => {
  const {t} = useT();
  const orb = (x: number, y: number, r: number, color: string, o: number) => (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        opacity: o,
      }}
    />
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${C.bg1} 0%, ${C.bg0} 70%)`, overflow: 'hidden'}}>
      {orb(200 + Math.sin(t * 0.6) * 80, 380 + Math.cos(t * 0.5) * 60, 620, '#7C3AED', 0.55 * (1 - danger * 0.6) + bright * 0.3)}
      {orb(900 + Math.cos(t * 0.45) * 90, 1500 + Math.sin(t * 0.55) * 80, 700, '#A855F7', 0.4 * (1 - danger * 0.6) + bright * 0.3)}
      {orb(540, 1000, 800, '#FF4D5E', danger * 0.45)}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${(t * 12) % 90}px`,
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Simplified Google Play badge (drawn, not an image asset). */
export const PlayBadge: React.FC<{scale?: number; glow?: number}> = ({scale = 1, glow = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 26 * scale,
      background: '#000',
      border: `${3 * scale}px solid rgba(255,255,255,0.55)`,
      borderRadius: 28 * scale,
      padding: `${22 * scale}px ${46 * scale}px ${22 * scale}px ${36 * scale}px`,
      boxShadow: `0 0 ${60 * glow}px rgba(139,92,246,${0.7 * glow}), 0 24px 50px rgba(0,0,0,0.5)`,
    }}
  >
    <svg width={86 * scale} height={96 * scale} viewBox="0 0 90 100">
      <path d="M5 5 L55 50 L5 95 Z" fill="#00D7FE" />
      <path d="M5 5 L70 41 L55 50 Z" fill="#00F076" />
      <path d="M5 95 L70 59 L55 50 Z" fill="#FF3A44" />
      <path d="M70 41 L88 50 L70 59 L55 50 Z" fill="#FFD400" />
    </svg>
    <div style={{color: '#fff', fontFamily: FONT}}>
      <div style={{fontSize: 28 * scale, fontWeight: 500, letterSpacing: 2 * scale}}>GET IT ON</div>
      <div style={{fontSize: 62 * scale, fontWeight: 700, lineHeight: 1, letterSpacing: -1 * scale}}>Google Play</div>
    </div>
  </div>
);

export const Wordmark: React.FC<{size?: number; reveal?: number}> = ({size = 120, reveal = 1}) => {
  const letters = 'Trackscribe'.split('');
  return (
    <div style={{display: 'flex', fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.04, color: '#fff'}}>
      {letters.map((l, i) => {
        const p = Math.min(1, Math.max(0, reveal * letters.length * 1.4 - i * 1.0) / 1.6);
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
            {l}
          </span>
        );
      })}
    </div>
  );
};
