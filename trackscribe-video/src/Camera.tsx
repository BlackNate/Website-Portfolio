import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FPS, HEIGHT, SRC_H, SRC_W, TIMED_SHOTS, TimedShot, WIDTH} from './timeline';

const BASE = HEIGHT / SRC_H; // page height fills the frame at zoom 1
const PAGE_W = SRC_W * BASE;
const PAGE_H = SRC_H * BASE;

const MOVE = 0.75; // seconds for a camera move within a page
const CUT = 0.5; // seconds for a crossfade between pages

type Pose = {x: number; y: number; zoom: number};

const ease = Easing.bezier(0.65, 0, 0.35, 1);

/** Slow push-in while a shot holds — keeps every frame alive. */
const drifted = (s: TimedShot, t: number): Pose => {
  const p = Math.min(1, Math.max(0, (t - s.start) / Math.max(0.5, s.end - s.start)));
  return {x: s.x + p * 6, y: s.y - p * 4, zoom: s.zoom * (1 + 0.045 * p)};
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const shake = (s: TimedShot, t: number) => {
  if (!s.shake) return {dx: 0, dy: 0};
  const k = t - s.start;
  if (k < 0 || k > 0.9) return {dx: 0, dy: 0};
  const amp = 16 * (1 - k / 0.9);
  return {dx: Math.sin(k * 71) * amp, dy: Math.cos(k * 53) * amp * 0.8};
};

const Page: React.FC<{scene: number; pose: Pose; opacity: number; offset?: {dx: number; dy: number}}> = ({
  scene,
  pose,
  opacity,
  offset = {dx: 0, dy: 0},
}) => {
  const w = PAGE_W * pose.zoom;
  const h = PAGE_H * pose.zoom;
  let left = WIDTH / 2 - pose.x * BASE * pose.zoom;
  let top = HEIGHT / 2 - pose.y * BASE * pose.zoom;
  left = Math.min(0, Math.max(WIDTH - w, left));
  top = Math.min(0, Math.max(HEIGHT - h, top));
  return (
    <AbsoluteFill style={{opacity}}>
      <Img
        src={staticFile(`scenes/scene${scene}.jpg`)}
        style={{
          position: 'absolute',
          width: PAGE_W,
          height: PAGE_H,
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${left + offset.dx}px, ${top + offset.dy}px) scale(${pose.zoom})`,
          filter: 'contrast(1.06) saturate(1.12)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  let i = TIMED_SHOTS.findIndex((s) => t >= s.start && t < s.end);
  if (i === -1) i = TIMED_SHOTS.length - 1;
  const cur = TIMED_SHOTS[i];
  const prev = TIMED_SHOTS[i - 1];
  const k = t - cur.start;
  const sh = shake(cur, t);

  // Same page: glide the camera from where the last shot was to this one.
  if (!prev || prev.scene === cur.scene) {
    const target = drifted(cur, t);
    if (!prev || k >= MOVE) {
      return <Page scene={cur.scene} pose={target} opacity={1} offset={sh} />;
    }
    const from = drifted(prev, cur.start);
    const p = ease(k / MOVE);
    const pose = {
      x: lerp(from.x, target.x, p),
      y: lerp(from.y, target.y, p),
      // dip the zoom slightly mid-move for a more physical camera
      zoom: lerp(from.zoom, target.zoom, p) * (1 - 0.06 * Math.sin(Math.PI * p)),
    };
    return <Page scene={cur.scene} pose={pose} opacity={1} offset={sh} />;
  }

  // New page: crossfade with a punch-in on the incoming panel.
  const p = interpolate(k, [0, CUT], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const incoming = drifted(cur, t);
  const punch = {...incoming, zoom: incoming.zoom * (1 + 0.1 * (1 - p))};
  const outgoing = drifted(prev, t);
  return (
    <AbsoluteFill>
      {p < 1 && <Page scene={prev.scene} pose={{...outgoing, zoom: outgoing.zoom * (1 + 0.05 * p)}} opacity={1} />}
      <Page scene={cur.scene} pose={punch} opacity={p} offset={sh} />
    </AbsoluteFill>
  );
};

/** Times (seconds) at which the camera cuts to a new page — used for flashes and whooshes. */
export const PAGE_CUTS: number[] = TIMED_SHOTS.filter(
  (s, i) => i > 0 && TIMED_SHOTS[i - 1].scene !== s.scene,
).map((s) => s.start);
