import {Txt, makeScene2D} from '@motion-canvas/2d';
import {createRef} from '@motion-canvas/core';
import {RecapCard} from '../components/RecapCard';
import {colors, fonts, sizes} from '../theme';
import {T, cue} from '../timing';

// Beat 6 · Recap. Two-sentence summary and the objective tag.
export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const card = createRef<RecapCard>();
  const next = createRef<Txt>();
  view.add(<RecapCard ref={card} y={-60} />);
  view.add(
    <Txt ref={next} text={'Next: Lesson 2 · Two Houses'} y={400} fill={colors.muted} fontFamily={fonts.body} fontSize={sizes.label} fontWeight={700} opacity={0} />,
  );

  // [cue: recap]
  yield* card().show(
    'Hosts are the devices people use, links join them, and a router connects the home network to other networks like the internet. ' +
      "A link light shows that a cable is connected and alive at both ends; if it's dark, check the physical connection first.",
    'Network+ N10-009 · 1.2 Networking appliances · 5.2 Cabling and interface issues',
    'Lesson 1 recap: First Hello',
  );
  yield* cue('recap', 6);

  // [cue: next]
  yield* next().opacity(1, T.fade);
  yield* cue('next', 3);
});
