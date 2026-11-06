import manifest from './audio-manifest.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** Source comic pages are 941x1672; all shot coordinates are in that space. */
export const SRC_W = 941;
export const SRC_H = 1672;

export type Speaker = 'narrator' | 'man' | 'nekuru';

export type Shot = {
  /** Fraction (0..1) of the line's duration at which this shot starts. */
  at: number;
  scene: number;
  x: number;
  y: number;
  zoom: number;
  shake?: boolean;
};

export type Line = {
  id: string;
  speaker: Speaker;
  text: string;
  /** Duration reported by ElevenLabs for the chosen take (seconds). */
  duration: number;
  /** Extra silence after the line, before the next one starts. */
  gap: number;
  shots: Shot[];
};

/** Voices used (ElevenLabs): */
export const VOICES: Record<Speaker, {name: string; voiceId: string}> = {
  narrator: {name: 'Adrian Vale - Cinematic Narrator', voiceId: 'S4WoGKoPsqqSNhvzIRmc'},
  man: {name: 'Louie the Legend', voiceId: 'ataV0GNgfIus2NWdTJP0'},
  nekuru: {name: 'Eldrin - Wise Ancient Wizard', voiceId: 'LvmvHEBEmMJBJw9UuhwO'},
};

const LINES_BASE: Line[] = [
  {
    id: '01', speaker: 'narrator', duration: 7.6, gap: 0.3,
    text: 'After thirty days of hard work, his salary had finally arrived. It was time to put his finances in order.',
    shots: [
      {at: 0, scene: 1, x: 470, y: 836, zoom: 1.0},
      {at: 0.22, scene: 1, x: 600, y: 300, zoom: 1.35},
      {at: 0.62, scene: 1, x: 700, y: 560, zoom: 1.6},
    ],
  },
  {
    id: '02', speaker: 'man', duration: 7.6, gap: 0.3,
    text: "Finally! Payday. Let's see... rent, groceries, transport, savings...",
    shots: [
      {at: 0, scene: 1, x: 900, y: 300, zoom: 1.4},
      {at: 0.38, scene: 1, x: 300, y: 700, zoom: 1.7},
    ],
  },
  {
    id: '03', speaker: 'narrator', duration: 5.52, gap: 0.2,
    text: 'But just as he began planning his month... an unexpected notification appeared.',
    shots: [
      {at: 0, scene: 1, x: 470, y: 960, zoom: 1.4},
      {at: 0.6, scene: 1, x: 680, y: 1300, zoom: 1.45},
    ],
  },
  {
    id: '04', speaker: 'man', duration: 6.64, gap: 0.5,
    text: 'DGT Media Services? R149.99? What is that?',
    shots: [
      {at: 0, scene: 1, x: 470, y: 1370, zoom: 1.3, shake: true},
      {at: 0.45, scene: 1, x: 330, y: 1400, zoom: 1.5, shake: true},
    ],
  },
  {
    id: '05', speaker: 'narrator', duration: 12.72, gap: 0.3,
    text: 'Determined to find the answer, he began investigating. He searched the internet, checked his emails and examined every transaction. But the more he searched... the more confused he became.',
    shots: [
      {at: 0, scene: 2, x: 470, y: 250, zoom: 1.35},
      {at: 0.2, scene: 2, x: 180, y: 665, zoom: 1.9},
      {at: 0.34, scene: 2, x: 470, y: 665, zoom: 1.9},
      {at: 0.48, scene: 2, x: 900, y: 690, zoom: 1.9},
      {at: 0.66, scene: 2, x: 200, y: 1090, zoom: 1.7},
      {at: 0.83, scene: 2, x: 900, y: 1060, zoom: 1.6},
    ],
  },
  {
    id: '06', speaker: 'man', duration: 6.4, gap: 0.6,
    text: "I've checked everything! I'm losing time. I just want to know where my money is going!",
    shots: [
      {at: 0, scene: 2, x: 900, y: 1460, zoom: 1.25, shake: true},
    ],
  },
  {
    id: '07', speaker: 'narrator', duration: 8.56, gap: 0.3,
    text: 'Then, in a place far removed from the noise of the city, he encountered someone who seemed to know exactly what he was searching for.',
    shots: [
      {at: 0, scene: 3, x: 500, y: 200, zoom: 1.3},
      {at: 0.45, scene: 3, x: 900, y: 580, zoom: 1.35},
    ],
  },
  {
    id: '08', speaker: 'nekuru', duration: 5.52, gap: 0.3,
    text: 'Young traveller... you seek answers in places where none can be found.',
    shots: [{at: 0, scene: 3, x: 900, y: 975, zoom: 1.3}],
  },
  {
    id: '09', speaker: 'man', duration: 1.92, gap: 0.3,
    text: 'Then where do I find them?',
    shots: [{at: 0, scene: 3, x: 700, y: 580, zoom: 1.3}],
  },
  {
    id: '10', speaker: 'nekuru', duration: 8.0, gap: 0.5,
    text: 'You must journey to the Mountain of Financial Clarity. Climb its heights... and discover the knowledge that awaits you.',
    shots: [
      {at: 0, scene: 3, x: 900, y: 975, zoom: 1.3},
      {at: 0.5, scene: 3, x: 470, y: 1430, zoom: 1.25},
    ],
  },
  {
    id: '11', speaker: 'narrator', duration: 12.72, gap: 0.4,
    text: 'And so, with nothing but determination and a backpack, he began his journey. Through storms, across treacherous paths, he climbed... until at last, he reached the summit.',
    shots: [
      {at: 0, scene: 4, x: 470, y: 250, zoom: 1.3},
      {at: 0.2, scene: 4, x: 470, y: 665, zoom: 1.3},
      {at: 0.42, scene: 4, x: 470, y: 1050, zoom: 2.0, shake: true},
      {at: 0.54, scene: 4, x: 165, y: 1050, zoom: 2.0},
      {at: 0.64, scene: 4, x: 785, y: 1050, zoom: 2.0},
      {at: 0.74, scene: 4, x: 470, y: 1440, zoom: 1.25},
      {at: 0.87, scene: 5, x: 500, y: 230, zoom: 1.3},
    ],
  },
  {
    id: '12', speaker: 'narrator', duration: 6.32, gap: 0.3,
    text: 'Before him stood a mysterious gateway. Its name... Trackscribe.',
    shots: [
      {at: 0, scene: 5, x: 520, y: 680, zoom: 1.35},
      {at: 0.66, scene: 5, x: 560, y: 1180, zoom: 1.4},
    ],
  },
  {
    id: '13', speaker: 'man', duration: 2.96, gap: 0.4,
    text: 'Trackscribe... What is this?',
    shots: [
      {at: 0, scene: 5, x: 430, y: 860, zoom: 1.45},
      {at: 0.6, scene: 6, x: 470, y: 170, zoom: 1.35},
    ],
  },
  {
    id: '14', speaker: 'narrator', duration: 8.32, gap: 0.3,
    text: 'Inside, he discovered a way to track his subscriptions, monitor upcoming renewals and understand exactly what he was paying for.',
    shots: [
      {at: 0, scene: 6, x: 600, y: 530, zoom: 1.4},
      {at: 0.38, scene: 6, x: 600, y: 860, zoom: 1.4},
      {at: 0.7, scene: 6, x: 520, y: 1170, zoom: 1.35},
    ],
  },
  {
    id: '15', speaker: 'man', duration: 2.32, gap: 0.5,
    text: "Now I know what I'm paying for!",
    shots: [{at: 0, scene: 6, x: 470, y: 1485, zoom: 1.3}],
  },
  {
    id: '16', speaker: 'narrator', duration: 9.6, gap: 0,
    text: "Don't let forgotten subscriptions catch you by surprise. Track them. Stay informed. Take control. Trackscribe. Find it on Google Play.",
    shots: [
      {at: 0, scene: 7, x: 900, y: 320, zoom: 1.25},
      {at: 0.28, scene: 7, x: 520, y: 780, zoom: 1.35},
      {at: 0.62, scene: 7, x: 470, y: 1460, zoom: 1.25},
    ],
  },
];

type ManifestEntry = {file: string; duration: number};
const audio = manifest as Record<string, ManifestEntry>;

/** Use the real downloaded audio length when available. */
export const LINES: Line[] = LINES_BASE.map((l) => ({
  ...l,
  duration: audio[l.id]?.duration ?? l.duration,
}));

export const hasAudio = (id: string) => Boolean(audio[id]);
export const audioFile = (id: string) => audio[id]?.file;

export const INTRO = 1.6; // opening on the full first page
export const OUTRO = 3.0; // hold on the full final page

export type TimedLine = Line & {start: number; end: number};

export const TIMED_LINES: TimedLine[] = (() => {
  let t = INTRO;
  return LINES.map((l) => {
    const start = t;
    const end = start + l.duration;
    t = end + l.gap;
    return {...l, start, end};
  });
})();

export const TOTAL_SECONDS = TIMED_LINES[TIMED_LINES.length - 1].end + OUTRO;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS);

export type TimedShot = Shot & {start: number; end: number; lineId: string};

export const TIMED_SHOTS: TimedShot[] = (() => {
  const flat: TimedShot[] = [];
  // Intro: full first page, slightly pushed in.
  flat.push({at: 0, scene: 1, x: 470, y: 836, zoom: 1.0, start: 0, end: INTRO, lineId: 'intro'});
  TIMED_LINES.forEach((l) => {
    l.shots.forEach((s) => {
      flat.push({...s, start: l.start + s.at * l.duration, end: 0, lineId: l.id});
    });
  });
  // Outro: pull back to the full final page.
  const last = TIMED_LINES[TIMED_LINES.length - 1];
  flat.push({at: 1, scene: 7, x: 470, y: 836, zoom: 1.0, start: last.end + 0.6, end: 0, lineId: 'outro'});
  flat.forEach((s, i) => {
    s.end = flat[i + 1] ? flat[i + 1].start : TOTAL_SECONDS;
  });
  return flat;
})();

export const lineById = (id: string) => TIMED_LINES.find((l) => l.id === id)!;
