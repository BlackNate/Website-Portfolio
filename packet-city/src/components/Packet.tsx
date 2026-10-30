import {Line, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {
  Vector2,
  all,
  createRef,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
} from '@motion-canvas/core';
import {ProtocolName, colors, fonts, protocol, sizes} from '../theme';
import {T} from '../timing';

/**
 * TCP packets are solid envelopes, UDP packets are outlined ones, so the two
 * stay distinct without color. ICMP (ping) is not TCP or UDP; it is drawn
 * solid with a dashed border until a lesson needs to separate it further.
 */
export type Transport = 'tcp' | 'udp' | 'icmp';

export interface PacketProps extends NodeProps {
  protocol?: ProtocolName;
  transport?: Transport;
  /** Short caption under the envelope, such as "ping" or "reply". */
  label?: string;
}

/**
 * A courier carrying an envelope. Place it anywhere; travel() moves it in
 * world coordinates, so a route from paths.ts works from any parent.
 */
export class Packet extends Node {
  private readonly body = createRef<Node>();
  private readonly envelope = createRef<Rect>();
  private readonly caption = createRef<Txt>();
  private readonly reasonTag = createRef<Rect>();
  private readonly reasonTxt = createRef<Txt>();
  private readonly packetProps: PacketProps;

  public constructor(props: PacketProps) {
    super({opacity: 0, ...props});
    this.packetProps = props;
    const color = protocol[props.protocol ?? 'generic'];
    const transport = props.transport ?? 'tcp';
    const solid = transport !== 'udp';

    this.add(
      <Node ref={this.body}>
        <Rect
          ref={this.envelope}
          width={78}
          height={52}
          radius={7}
          fill={solid ? color : colors.bg}
          stroke={solid ? colors.bg : color}
          lineWidth={solid ? 3 : 6}
          lineDash={transport === 'icmp' ? [8, 5] : []}
        >
          <Line
            points={[[-36, -23], [0, 4], [36, -23]]}
            stroke={solid ? colors.bg : color}
            lineWidth={4}
            lineJoin={'round'}
          />
        </Rect>
        <Txt
          ref={this.caption}
          text={props.label ?? ''}
          y={-50}
          fill={colors.text}
          fontFamily={fonts.mono}
          fontSize={sizes.small}
          fontWeight={700}
        />
      </Node>,
    );
    this.add(
      <Rect
        ref={this.reasonTag}
        y={-80}
        padding={[8, 16]}
        radius={8}
        fill={colors.fault}
        layout
        opacity={0}
        scale={0.6}
      >
        <Txt ref={this.reasonTxt} fill={colors.bg} fontFamily={fonts.body} fontSize={sizes.small} fontWeight={700} />
      </Rect>,
    );
  }

  /** Fade in at a world position. */
  public *appear(at?: Vector2, duration = T.pop) {
    if (at) this.absolutePosition(at);
    this.scale(0.4);
    yield* all(this.opacity(1, duration), this.scale(1, duration, easeOutBack));
  }

  public *disappear(duration = T.fade) {
    yield* all(this.opacity(0, duration), this.scale(0.4, duration));
  }

  /**
   * Hop along a route of world positions, one stop at a time.
   * The packet jumps to the first stop and fades in if it is hidden.
   */
  public *travel(path: Vector2[], hop = T.hop) {
    if (path.length === 0) return;
    if (this.opacity() < 1) yield* this.appear(path[0]);
    else this.absolutePosition(path[0]);
    for (const stop of path.slice(1)) {
      const leftward = stop.x < this.absolutePosition().x;
      yield* all(
        this.absolutePosition(stop, hop, easeInOutCubic),
        this.body().rotation(leftward ? -6 : 6, hop / 2).to(0, hop / 2),
      );
    }
  }

  /** Change the caption, for example "ping" to "reply". */
  public *relabel(text: string, duration = T.pop) {
    yield* this.caption().text(text, duration);
  }

  /** The packet is lost: it falls and fades, and a red tag says why. */
  public *drop(reason: string, duration = T.draw) {
    this.reasonTxt().text(reason);
    yield* all(
      this.body().position.y(140, duration, easeInCubic),
      this.body().rotation(35, duration, easeInCubic),
      this.body().opacity(0, duration, easeInCubic),
      this.reasonTag().opacity(1, T.pop),
      this.reasonTag().scale(1, T.pop, easeOutBack),
    );
  }

  /** A copy of this packet, added beside it and ready to travel on its own. */
  public duplicate(): Packet {
    const copy = new Packet({...this.packetProps, opacity: 1});
    this.parent()?.add(copy);
    copy.absolutePosition(this.absolutePosition());
    return copy;
  }
}
