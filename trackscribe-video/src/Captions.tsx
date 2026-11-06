import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import {FPS, TIMED_LINES, TimedLine} from './timeline';

const LETTERING = "'Comic Neue', 'Comic Sans MS', sans-serif";
const DISPLAY = "'Bangers', 'Impact', sans-serif";

/** Words that get the red "comic emphasis" treatment. */
const EMPHASIS = new Set([
  'DGT', 'R149.99?', 'MONEY', 'GOING!', 'FINANCIAL', 'CLARITY.', 'TRACKSCRIBE.', 'TRACKSCRIBE...',
  'CONTROL.', 'PAYDAY.', 'EVERYTHING!', 'SUMMIT.', 'PLAY.',
]);

const Words: React.FC<{line: TimedLine; t: number; color: string; emph: string}> = ({line, t, color, emph}) => {
  const words = line.text.toUpperCase().split(' ');
  const span = line.duration * 0.88;
  const per = span / words.length;
  return (
    <>
      {words.map((w, i) => {
        const appear = (t - line.start - i * per) * FPS;
        const o = interpolate(appear, [0, 4], [0.18, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const y = interpolate(appear, [0, 5], [6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const isEmph = EMPHASIS.has(w);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: o,
              transform: `translateY(${y}px)`,
              marginRight: '0.28em',
              color: isEmph ? emph : color,
            }}
          >
            {w}
          </span>
        );
      })}
    </>
  );
};

const NarratorBox: React.FC<{line: TimedLine; t: number; s: number}> = ({line, t, s}) => (
  <div
    style={{
      position: 'absolute',
      left: 60,
      right: 60,
      bottom: 150,
      transform: `rotate(-1.2deg) scale(${0.85 + 0.15 * s})`,
      opacity: s,
      background: '#ffe14d',
      border: '6px solid #111',
      boxShadow: '10px 10px 0 rgba(0,0,0,0.85)',
      padding: '26px 34px',
      fontFamily: LETTERING,
      fontWeight: 700,
      fontSize: 46,
      lineHeight: 1.18,
      letterSpacing: 0.5,
    }}
  >
    <Words line={line} t={t} color="#111" emph="#c4121a" />
  </div>
);

const Bubble: React.FC<{line: TimedLine; t: number; s: number; variant: 'man' | 'nekuru'}> = ({line, t, s, variant}) => {
  const isMan = variant === 'man';
  const bg = isMan ? '#ffffff' : '#1d0b33';
  const fg = isMan ? '#111' : '#f7e9c6';
  const border = isMan ? '#111' : '#f5c542';
  const tailLeft = isMan ? 140 : undefined;
  const tailRight = isMan ? undefined : 150;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        bottom: 190,
        opacity: s,
        transform: `scale(${0.6 + 0.4 * s})`,
        transformOrigin: isMan ? '15% 100%' : '85% 100%',
      }}
    >
      {!isMan && (
        <div
          style={{
            position: 'absolute',
            top: -54,
            right: 40,
            fontFamily: DISPLAY,
            fontSize: 44,
            letterSpacing: 3,
            color: '#f5c542',
            textShadow: '3px 3px 0 #000',
          }}
        >
          NEKURU
        </div>
      )}
      <div
        style={{
          position: 'relative',
          background: bg,
          border: `6px solid ${border}`,
          borderRadius: 70,
          padding: '34px 46px',
          boxShadow: isMan ? '8px 10px 0 rgba(0,0,0,0.8)' : '0 0 40px rgba(168,85,247,0.55), 8px 10px 0 rgba(0,0,0,0.8)',
          fontFamily: LETTERING,
          fontWeight: 700,
          fontSize: isMan ? 52 : 48,
          lineHeight: 1.15,
          textAlign: 'center',
        }}
      >
        <Words line={line} t={t} color={fg} emph={isMan ? '#d0141c' : '#c084fc'} />
      </div>
      {/* tail */}
      <svg
        width={90}
        height={80}
        viewBox="0 0 90 80"
        style={{position: 'absolute', bottom: -66, left: tailLeft, right: tailRight}}
      >
        <path
          d={isMan ? 'M10 0 L80 0 L5 75 Z' : 'M10 0 L80 0 L85 75 Z'}
          fill={bg}
          stroke={border}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <rect x={4} y={-6} width={82} height={10} fill={bg} />
      </svg>
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const line = TIMED_LINES.find((l) => t >= l.start - 0.1 && t < l.end + Math.min(0.35, l.gap + 0.1));
  if (!line) return null;
  const inS = spring({frame: frame - Math.round((line.start - 0.1) * FPS), fps: FPS, config: {damping: 13, stiffness: 180}});
  const out = interpolate(t, [line.end + Math.min(0.35, line.gap + 0.1) - 0.15, line.end + Math.min(0.35, line.gap + 0.1)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const s = Math.min(inS, out);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {line.speaker === 'narrator' ? (
        <NarratorBox line={line} t={t} s={s} />
      ) : (
        <Bubble line={line} t={t} s={s} variant={line.speaker} />
      )}
    </AbsoluteFill>
  );
};
