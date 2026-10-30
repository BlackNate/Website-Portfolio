import {Node, Txt, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic} from '@motion-canvas/core';
import {CityMap} from '../components/CityMap';
import {Device} from '../components/Device';
import {FaultMarker} from '../components/FaultMarker';
import {colors, fonts, modules, sizes} from '../theme';
import {T, cue} from '../timing';

// Beat 1 · Hook. A citizen has a problem; show the symptom on the city map.
export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const map = createRef<CityMap>();
  const closeUp = createRef<Node>();
  const laptop = createRef<Device>();
  const fault = createRef<FaultMarker>();
  const title = createRef<Node>();

  view.add(<CityMap ref={map} opacity={0} />);
  view.add(
    <Node ref={closeUp} opacity={0}>
      <Device ref={laptop} kind={'laptop'} label={"Maya's laptop"} scale={2} powered />
      <FaultMarker ref={fault} position={[300, -120]} />
    </Node>,
  );
  view.add(
    <Node ref={title} opacity={0} y={360}>
      <Txt text={'Lesson 1 · First Hello'} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.title} fontWeight={800} />
      <Txt
        text={`Module 1 · ${modules.m1.name}`}
        y={70}
        fill={modules.m1.main}
        fontFamily={fonts.body}
        fontSize={sizes.label}
        fontWeight={700}
      />
    </Node>,
  );

  // [cue: city]
  yield* map().opacity(1, T.fade);
  yield* cue('city', 1.5);

  // [cue: house]
  const housePos: [number, number] = [-160, 0];
  const house = yield* map().addHouse(housePos, "Maya's house", modules.m1.main);
  yield* map().highlight(house);
  yield* cue('house');

  // [cue: zoom]
  yield* map().focus(housePos, 3.5);
  yield* all(map().opacity(0, T.fade), closeUp().opacity(1, T.fade));
  yield* cue('zoom', 1.2);

  // [cue: no-internet]
  yield* laptop().fail();
  yield* fault().show('No internet');
  yield* cue('no-internet', 1.5);

  // [cue: title]
  yield* all(
    closeUp().position.y(-80, T.draw, easeOutCubic),
    closeUp().scale(0.8, T.draw, easeOutCubic),
    title().opacity(1, T.draw),
  );
  yield* cue('title', 3);
});
