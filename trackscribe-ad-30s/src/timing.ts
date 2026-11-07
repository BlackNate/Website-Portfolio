import manifest from './audio-manifest.json';

export const FPS = 30;
export const DURATION = 30; // seconds

/** Scene beats (seconds), locked to the ElevenLabs voiceover takes. */
export const S = {
  hook: {netflix: 0.45, spotify: 1.2, gym: 1.95},
  problem: {start: 5.0, year: 7.6, notice: 8.9, end: 11.6},
  reveal: {start: 11.6, end: 14.0},
  features: {a: 14.1, b: 16.6, c: 18.85, end: 21.7},
  cta: {start: 21.95, lockup: 24.6, badge: 25.6, end: DURATION},
};

/** Voiceover lines: narrator, ElevenLabs voice "Adrian Vale - Cinematic Narrator". */
export const VO = [
  {id: '01', at: 0.35, duration: 4.32, text: 'Netflix. Spotify. That gym membership you forgot about.'},
  {id: '02', at: 5.05, duration: 6.24, text: 'Every month, small subscriptions quietly drain your account... and most of us never notice.'},
  {id: '03', at: 12.0, duration: 1.76, text: 'Meet Trackscribe.'},
  {id: '04', at: 14.2, duration: 6.96, text: "Track every subscription in one place. Get reminded before you're charged. And see exactly what you're spending."},
  {id: '05', at: 22.0, duration: 5.36, text: 'Never miss a subscription again. Trackscribe. Get it on Google Play.'},
];

const audio = manifest as Record<string, {file: string; duration: number}>;
export const voiceFile = (id: string) => audio[id]?.file;
