// Shared look for every Packet City lesson. Reuse these tokens instead of
// hard-coding colors so viewers learn what each color means.
// Rule: never rely on color alone. Pair it with a shape or style
// (solid vs outlined packet, solid vs dashed link, a cross on faults).

export const colors = {
  bg: '#0e1621',
  ground: '#15212e',
  street: '#22303f',
  panel: '#1b2836',
  panelEdge: '#30425a',
  text: '#e8eef5',
  muted: '#8a9bb0',
  dim: '#3a4859',
  accent: '#4cc2ff',
  ok: '#3fd68a',
  fault: '#ff5d5d',
  warn: '#ffb547',
  screenOff: '#0a0f15',
  screenOn: '#1f6f9f',
};

// One color per protocol family. The packet's style (solid vs outlined)
// carries the TCP/UDP distinction so color is never the only signal.
export const protocol = {
  icmp: '#4cc2ff',
  web: '#ffb547',
  dns: '#c38bff',
  dhcp: '#3fd68a',
  mail: '#ff8fb1',
  generic: '#e8eef5',
};

export type ProtocolName = keyof typeof protocol;

// One palette per module, used for the district and title accents.
export const modules = {
  m1: {name: 'The Street', main: '#4cc2ff', soft: '#16384d'},
  m2: {name: 'The Neighborhood', main: '#3fd68a', soft: '#14402b'},
  m3: {name: 'The District', main: '#ffb547', soft: '#4a3612'},
  m4: {name: 'The Control Room', main: '#c38bff', soft: '#33204d'},
  m5: {name: 'The Fortress', main: '#ff5d5d', soft: '#4a1a1a'},
  m6: {name: 'The Detective Agency', main: '#ff8fb1', soft: '#4a2232'},
};

export const fonts = {
  body: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
};

export const sizes = {
  title: 72,
  heading: 52,
  body: 36,
  label: 28,
  small: 22,
};
