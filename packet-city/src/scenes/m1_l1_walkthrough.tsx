import {makeScene2D} from '@motion-canvas/2d';
import {createRef} from '@motion-canvas/core';
import {Packet} from '../components/Packet';
import {Terminal} from '../components/Terminal';
import {back, route} from '../paths';
import {colors} from '../theme';
import {T, cue} from '../timing';
import {oneHouse} from '../topologies';

// Beat 4 · Walkthrough. Three pings out and back, one hop at a time,
// with the terminal printing each reply as it arrives.
const replies = [
  '64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=14.2 ms',
  '64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=13.9 ms',
  '64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=14.6 ms',
];

export default makeScene2D(function* (view) {
  view.fill(colors.bg);
  const net = oneHouse(view, true);
  net.layer.position([60, -200]).scale(0.8);
  const {laptop, router, internet} = net;

  const term = createRef<Terminal>();
  const packet = createRef<Packet>();
  view.add(<Terminal ref={term} title={"Maya's laptop — terminal"} y={290} width={1200} />);
  view.add(<Packet ref={packet} protocol={'icmp'} transport={'icmp'} label={'ping'} />);
  const out = route(laptop, router, internet);

  // [cue: ping-intro]
  yield* cue('ping-intro', 2);

  // [cue: type]
  yield* term().type('ping -c 3 1.1.1.1');
  yield* term().print('PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.');
  yield* cue('type', 1);

  for (const [i, reply] of replies.entries()) {
    // The first ping is slow enough to narrate; the next two are quick.
    const hop = i === 0 ? 1 : 0.25;
    yield* packet().relabel('ping', 0);
    yield* packet().travel(out, hop);
    yield* internet.blink(1);
    yield* packet().relabel('reply', 0.2);
    yield* packet().travel(back(out), hop);
    yield* packet().disappear(0.2);
    yield* term().print(reply, colors.text, 0);
    if (i === 0) yield* term().flashLast();
    // [cue: hop-1] after the first ping, [cue: hops-2-3] after the last.
    if (i === 0) yield* cue('hop-1', 0.5);
  }
  yield* cue('hops-2-3', 0.5);

  // [cue: read-result]
  yield* term().print(
    [
      ' ',
      '--- 1.1.1.1 ping statistics ---',
      '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
      'rtt min/avg/max/mdev = 13.9/14.2/14.6/0.3 ms',
    ],
    colors.text,
    0.15,
  );
  yield* term().flashLast(colors.accent);
  yield* cue('read-result', 4);
});
