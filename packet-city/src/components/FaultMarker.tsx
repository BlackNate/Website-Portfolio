import {Circle, Line, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutBack} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

/**
 * A red cross with a puff of smoke and a reason tag. Place it on the
 * broken part; the cross shape means faults never rely on red alone.
 */
export class FaultMarker extends Node {
  private readonly cross = createRef<Node>();
  private readonly smoke = createRef<Node>();
  private readonly tag = createRef<Rect>();
  private readonly reason = createRef<Txt>();

  public constructor(props: NodeProps) {
    super({...props});
    this.add(
      <Node ref={this.smoke} opacity={0}>
        {[[-22, -10, 46], [18, -18, 54], [0, 14, 40]].map(([x, y, size]) => (
          <Circle x={x} y={y} size={size} fill={colors.muted} opacity={0.35} />
        ))}
      </Node>,
    );
    this.add(
      <Node ref={this.cross} scale={0}>
        <Circle size={76} fill={colors.bg} stroke={colors.fault} lineWidth={6} />
        <Line points={[[-20, -20], [20, 20]]} stroke={colors.fault} lineWidth={9} lineCap={'round'} />
        <Line points={[[20, -20], [-20, 20]]} stroke={colors.fault} lineWidth={9} lineCap={'round'} />
      </Node>,
    );
    this.add(
      <Rect ref={this.tag} y={72} layout padding={[8, 16]} radius={8} fill={colors.fault} opacity={0}>
        <Txt ref={this.reason} fill={colors.bg} fontFamily={fonts.body} fontSize={sizes.small} fontWeight={700} />
      </Rect>,
    );
  }

  public *show(reason: string, duration = T.pop) {
    this.reason().text(reason);
    yield* all(
      this.cross().scale(1, duration, easeOutBack),
      this.smoke().opacity(1, duration).to(0, 1.2),
      this.smoke().position.y(-40, duration + 1.2),
      this.tag().opacity(1, duration),
    );
  }

  public *clear(duration = T.fade) {
    yield* all(this.cross().scale(0, duration), this.tag().opacity(0, duration));
    this.smoke().position.y(0);
  }
}
