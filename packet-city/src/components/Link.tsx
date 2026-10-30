import {Circle, Line, Node, NodeProps, Rect} from '@motion-canvas/2d';
import {
  PossibleVector2,
  ThreadGenerator,
  Vector2,
  all,
  createRef,
  createSignal,
  easeInOutCubic,
} from '@motion-canvas/core';
import {colors} from '../theme';
import {T} from '../timing';

export type LinkKind = 'copper' | 'fiber' | 'wireless';

export interface LinkProps extends NodeProps {
  from: PossibleVector2;
  to: PossibleVector2;
  kind?: LinkKind;
  /** Which end has a port with a link light. Usually the router or switch end. */
  light?: 'from' | 'to' | 'none';
  /** Start already drawn and up. Defaults to false so scenes can call connect(). */
  up?: boolean;
}

// Each kind differs by style as well as color: copper is thick and solid,
// fiber is thin and solid, wireless is dashed.
const look: Record<LinkKind, {color: string; width: number; dash: number[]}> = {
  copper: {color: '#e0a868', width: 10, dash: []},
  fiber: {color: '#8ff3ff', width: 5, dash: []},
  wireless: {color: colors.accent, width: 5, dash: [18, 14]},
};

/**
 * A connection between two points, drawn in the parent's coordinates.
 * The link light sits beside the port at the `light` end, like the small
 * LED next to a real Ethernet port.
 */
export class Link extends Node {
  public readonly kind: LinkKind;
  private readonly start: Vector2;
  private readonly port: Vector2;
  /** Where the cable's plug currently is; moves when the cable is pulled out. */
  private readonly plug = createSignal(Vector2.zero);
  private readonly line = createRef<Line>();
  private readonly plugHead = createRef<Rect>();
  private readonly led = createRef<Circle>();
  private readonly lightEnd: 'from' | 'to' | 'none';

  public constructor(props: LinkProps) {
    super({...props});
    this.kind = props.kind ?? 'copper';
    this.lightEnd = props.light ?? 'to';
    const a = new Vector2(props.from);
    const b = new Vector2(props.to);
    // Store the line so that its second point is always the port end,
    // which keeps unplug() and the link light simple.
    [this.start, this.port] = this.lightEnd === 'from' ? [b, a] : [a, b];
    this.plug(this.port);

    const style = look[this.kind];
    const up = props.up ?? false;
    const dir = this.port.sub(this.start).normalized;
    const normal = new Vector2(dir.y, -dir.x);
    // Just inside the device, above the port, like the LED beside an RJ45 socket.
    const ledAt = this.port.add(normal.scale(normal.y > 0 ? -34 : 34)).add(dir.scale(22));

    this.add(
      <Line
        ref={this.line}
        points={() => [this.start, this.plug()]}
        stroke={up ? style.color : colors.dim}
        lineWidth={style.width}
        lineDash={style.dash}
        lineCap={'round'}
        end={up ? 1 : 0}
      />,
    );
    if (this.kind !== 'wireless') {
      this.add(
        <Rect
          ref={this.plugHead}
          position={() => this.plug()}
          rotation={dir.degrees}
          width={26}
          height={22}
          radius={4}
          fill={colors.muted}
          opacity={up ? 1 : 0}
        />,
      );
    }
    if (this.lightEnd !== 'none') {
      this.add(
        <Circle
          ref={this.led}
          position={ledAt}
          size={22}
          fill={up ? colors.ok : colors.screenOff}
          stroke={colors.muted}
          lineWidth={3}
          shadowColor={colors.ok}
          shadowBlur={up ? 24 : 0}
          opacity={up ? 1 : 0}
        />,
      );
    }
  }

  /** Draws the cable from the first device to the second. Light stays off. */
  public *connect(duration = T.draw) {
    this.line().stroke(colors.dim);
    yield* this.line().end(1, duration, easeInOutCubic);
    const parts = [this.plugHead(), this.led()].filter(Boolean);
    yield* all(...parts.map(part => part.opacity(1, T.pop)));
  }

  /** Both ends agree the connection is alive: cable colors in, light turns green. */
  public *linkUp(duration = T.pop) {
    const tweens: ThreadGenerator[] = [this.line().stroke(look[this.kind].color, duration)];
    if (this.led()) {
      tweens.push(this.led().fill(colors.ok, duration), this.led().shadowBlur(24, duration));
    }
    yield* all(...tweens);
  }

  /** The connection is dead: cable greys out, light goes dark. */
  public *linkDown(duration = T.pop) {
    const tweens: ThreadGenerator[] = [this.line().stroke(colors.dim, duration)];
    if (this.led()) {
      tweens.push(this.led().fill(colors.screenOff, duration), this.led().shadowBlur(0, duration));
    }
    yield* all(...tweens);
  }

  /** The plug slides partway out of the port, then the link goes down. */
  public *unplug(gap = 45, duration = T.draw) {
    const back = this.port.sub(this.start).normalized.scale(-gap);
    yield* this.plug(this.port.add(back), duration, easeInOutCubic);
    yield* this.linkDown();
  }

  /** The plug clicks back into the port, then the link comes up. */
  public *plugIn(duration = T.draw) {
    yield* this.plug(this.port, duration, easeInOutCubic);
    yield* this.linkUp();
  }

  /** The cable is severed: it turns red and broken (dashed), and the link goes down. */
  public *cut(duration = T.fade) {
    yield* all(
      this.line().stroke(colors.fault, duration),
      this.line().lineDash([24, 24], duration),
      this.linkDown(duration),
    );
  }

  /** Draws the eye to the link light. */
  public *pulseLight(times = 2) {
    if (!this.led()) return;
    for (let i = 0; i < times; i++) yield* this.led().scale(1.8, 0.2).to(1, 0.25);
  }

  /** Where the cable's port is, in the parent's coordinates. */
  public portPosition() {
    return this.port;
  }

  /** The world position of the link light, for pointing chips at it. */
  public lightPosition() {
    return this.led() ? this.led().absolutePosition() : this.absolutePosition();
  }
}
