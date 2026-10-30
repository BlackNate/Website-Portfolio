import {Rect, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeInOutCubic, waitUntil} from '@motion-canvas/core';
import {FaultMarker} from '../components/FaultMarker';
import {GuessCard} from '../components/GuessCard';
import {Packet} from '../components/Packet';
import {Terminal} from '../components/Terminal';
import {back, route} from '../paths';
import {colors} from '../theme';
import {T, cue} from '../timing';
import {oneHouse} from '../topologies';

// Beat 5 · What went wrong? The cable is not fully seated, the link light
// goes dark, and the viewer guesses the cause before the reveal.
export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const net = oneHouse(view, true);
  const {laptop, router, internet, homeLink} = net;
  const home = {position: [60, -200] as [number, number], scale: 0.8};
  net.layer.position(home.position).scale(home.scale);

  const fault = createRef<FaultMarker>();
  net.layer.add(<FaultMarker ref={fault} position={[-320, -10]} />);

  const term = createRef<Terminal>();
  const packet = createRef<Packet>();
  const shade = createRef<Rect>();
  const guess = createRef<GuessCard>();
  view.add(<Terminal ref={term} title={"Maya's laptop — terminal"} y={290} width={1200} />);
  view.add(<Packet ref={packet} protocol={'icmp'} transport={'icmp'} label={'ping'} />);
  view.add(<Rect ref={shade} width={1920} height={1080} fill={colors.bg} opacity={0} />);
  view.add(<GuessCard ref={guess} />);

  // [cue: next-day]
  yield* cue('next-day', 2);

  // [cue: broken]
  yield* homeLink.unplug(22);
  yield* laptop.fail();
  yield* cue('broken', 1);

  // [cue: ping-fail]
  yield* term().type('ping -c 3 1.1.1.1');
  yield* term().print('ping: connect: Network is unreachable', colors.fault);
  yield* cue('ping-fail', T.read);

  // [cue: guess]
  yield* shade().opacity(0.88, T.fade);
  yield* guess().ask(
    "The laptop is on. The router is on. But the link light on the router's port is dark. What's the most likely problem?",
    [
      "Maya's internet provider is down",
      "The cable isn't connected properly at one end",
      'The laptop needs a software update',
    ],
    0,
  );
  // The countdown starts when the narrator finishes asking.
  yield* waitUntil('guess-said');
  yield* guess().countdown();
  yield* cue('guess', 0.5);

  // [cue: reveal]
  yield* guess().reveal(
    1,
    'A dark link light means a physical problem on that one cable or its ports. An internet outage would not turn it off.',
  );
  yield* cue('reveal', 4);
  yield* all(guess().dismiss(), shade().opacity(0, T.fade));

  // [cue: zoom-fault] Bring the router port to the middle of the screen.
  const zoom = 1.4;
  const port = homeLink.portPosition();
  yield* all(
    net.layer.scale(zoom, 1.2, easeInOutCubic),
    net.layer.position([-port.x * zoom, -250 - port.y * zoom], 1.2, easeInOutCubic),
    term().opacity(0.4, 1.2),
  );
  yield* fault().show('Cable not clicked in');
  yield* cue('zoom-fault', T.read);

  // [cue: fix]
  yield* fault().clear();
  yield* homeLink.plugIn(0.6);
  yield* all(laptop.recover(), router.blink());
  yield* all(
    net.layer.scale(home.scale, 1, easeInOutCubic),
    net.layer.position(home.position, 1, easeInOutCubic),
    term().opacity(1, 1),
  );
  yield* term().clear();
  yield* term().type('ping -c 3 1.1.1.1');
  yield* term().print('PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.');
  const out = route(laptop, router, internet);
  yield* packet().travel(out, 0.45);
  yield* packet().relabel('reply', 0.2);
  yield* packet().travel(back(out), 0.45);
  yield* packet().disappear(0.2);
  yield* term().print(
    [
      '64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=14.1 ms',
      '64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=14.4 ms',
      '64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=13.8 ms',
    ],
    colors.text,
    0.3,
  );
  yield* term().flashLast();
  yield* cue('fix', 1);

  // [cue: rule]
  yield* homeLink.pulseLight();
  yield* cue('rule', 4);

  // [cue: but]
  yield* cue('but', 4);
});
