import {makeScene2D} from '@motion-canvas/2d';
import {all, createRef} from '@motion-canvas/core';
import {Packet} from '../components/Packet';
import {TermChip} from '../components/TermChip';
import {back, route} from '../paths';
import {colors} from '../theme';
import {T, cue} from '../timing';
import {oneHouse} from '../topologies';

// Beat 2 · Concept. Assemble the network piece by piece: hosts, a router,
// the internet, a link with its link light, then the first packet out and back.
export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const net = oneHouse(view, false);
  const {laptop, phone, router, internet, homeLink, wanLink, phoneLink} = net;
  const chip = createRef<TermChip>();
  const packet = createRef<Packet>();
  view.add(<TermChip ref={chip} position={[0, -420]} />);
  view.add(<Packet ref={packet} protocol={'icmp'} transport={'icmp'} label={'hello'} />);

  // [cue: laptop]
  yield* laptop.appear();
  yield* laptop.powerOn();
  yield* cue('laptop');

  // [cue: host-chip]
  chip().position([-560, -330]);
  yield* chip().introduce('Host', 'Any device that sends or receives data', laptop.absolutePosition().addY(-60));
  yield* cue('host-chip', T.read);

  // [cue: phone]
  yield* phone.appear();
  yield* phone.powerOn();
  yield* phone.blink();
  yield* cue('phone', T.read);
  yield* chip().dismiss();

  // [cue: router] The phone's Wi-Fi joins once there is a router to join.
  yield* router.appear();
  yield* router.powerOn();
  phoneLink.opacity(1);
  yield* phoneLink.connect();
  yield* phoneLink.linkUp();
  yield* all(phone.opacity(0.35, T.fade), phoneLink.opacity(0.35, T.fade));
  yield* cue('router');

  // [cue: router-chip]
  chip().position([-60, -330]);
  yield* chip().introduce('Router', 'Connects networks and passes traffic between them', router.absolutePosition().addY(-90));
  yield* cue('router-chip', T.read);
  yield* chip().dismiss();

  // [cue: house]
  yield* net.showHouse();
  yield* cue('house');

  // [cue: internet]
  yield* internet.appear();
  yield* all(internet.powerOn(), wanLink.connect());
  yield* wanLink.linkUp();
  yield* cue('internet', T.read);

  // [cue: cable]
  yield* homeLink.connect(1.2);
  yield* cue('cable', 0.4);

  // [cue: link-chip]
  chip().position([-310, 260]);
  yield* chip().introduce('Link', 'A connection between two devices');
  yield* cue('link-chip', T.read);
  yield* chip().dismiss();

  // [cue: light]
  yield* homeLink.linkUp(0.5);
  yield* router.blink();
  yield* cue('light');

  // [cue: light-chip]
  chip().position([-60, 330]);
  yield* chip().introduce('Link light', 'On: the cable is connected and alive at both ends', homeLink.lightPosition());
  yield* cue('light-chip', T.read);
  yield* chip().dismiss();

  // [cue: first-packet]
  const out = route(laptop, router, internet);
  yield* packet().travel(out.slice(0, 2), 1);
  yield* cue('first-packet', 0.3);

  // [cue: out]
  yield* router.blink(2);
  yield* packet().travel(out.slice(1), 1);
  yield* internet.blink(2);
  yield* cue('out', 0.3);

  // [cue: reply]
  yield* packet().relabel('reply');
  yield* packet().travel(back(out), 1);
  yield* laptop.pulse();
  yield* cue('reply');
  yield* packet().disappear();

  // [cue: key-idea]
  yield* all(laptop.pulse(), homeLink.linkUp(), router.pulse(), internet.pulse());
  yield* cue('key-idea', 3);
});
