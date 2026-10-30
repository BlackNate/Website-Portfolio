import {Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T, cue} from '../timing';

// Beat 3 · Real terms. Swap each metaphor for the exam vocabulary, side by side.
const rows: [cue: string, city: string, exam: string][] = [
  ['row-host', "Maya's laptop and phone", 'Host (end device)'],
  ['row-router', 'The box by the front door', 'Router (at home: a SOHO router)'],
  ['row-link', 'The cable between them', 'Link (copper twisted-pair Ethernet)'],
  ['row-light', 'The little green lamp', 'Link light (link LED)'],
  ['row-internet', 'The world outside', 'Internet (other networks)'],
  ['row-packet', 'The courier and envelope', 'Packet (a unit of data)'],
];

const cityWidth = 640;
const examWidth = 820;

function Row({city, exam, header = false}: {city: string; exam: string; header?: boolean}) {
  const color = header ? colors.muted : colors.text;
  const size = header ? sizes.small + 2 : sizes.body - 2;
  return (
    <Rect layout direction={'row'} gap={40} padding={[18, 28]} radius={12} fill={header ? null : colors.panel} opacity={header ? 1 : 0}>
      <Txt width={cityWidth} text={city} fill={color} fontFamily={fonts.body} fontSize={size} fontWeight={header ? 800 : 500} />
      <Txt width={examWidth} text={exam} fill={header ? colors.muted : colors.accent} fontFamily={fonts.body} fontSize={size} fontWeight={800} />
    </Rect>
  );
}

export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const table = createRef<Rect>();
  const heading = createRef<Txt>();

  view.add(
    <Txt ref={heading} text={'Real terms'} y={-440} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.heading} fontWeight={800} opacity={0} />,
  );
  view.add(
    <Rect ref={table} layout direction={'column'} gap={14} y={40}>
      <Row city={'In Packet City'} exam={'On the exam'} header />
      {rows.map(([, city, exam]) => (
        <Row city={city} exam={exam} />
      ))}
    </Rect>,
  );

  // [cue: intro]
  yield* heading().opacity(1, T.fade);
  yield* cue('intro');

  const rowNodes = table().children().slice(1) as Rect[];
  for (const [i, [name]] of rows.entries()) {
    const row = rowNodes[i];
    row.scale(0.96);
    yield* all(row.opacity(1, T.fade), row.scale(1, T.fade, easeOutCubic));
    yield* cue(name, name === 'row-router' ? 4 : T.read);
  }

  yield* cue('rows-done', 1);
});
