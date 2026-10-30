import {Circle, Line, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutBack, sequence} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

export type DeviceKind =
  | 'laptop'
  | 'phone'
  | 'router'
  | 'switch'
  | 'ap'
  | 'firewall'
  | 'server'
  | 'cloud';

export interface DeviceProps extends NodeProps {
  kind: DeviceKind;
  label?: string;
  /** Start powered on. Defaults to false so scenes can call powerOn(). */
  powered?: boolean;
}

/**
 * One network device drawn from simple shapes, with a label underneath.
 * Every device has a `screen` (the part that lights up) and a status LED.
 */
export class Device extends Node {
  public readonly kind: DeviceKind;
  private readonly screen = createRef<Rect>();
  private readonly led = createRef<Circle>();
  private readonly labelTxt = createRef<Txt>();

  public constructor(props: DeviceProps) {
    super({...props});
    this.kind = props.kind;
    const on = props.powered ?? false;
    const screenFill = on ? colors.screenOn : colors.screenOff;
    const ledFill = on ? colors.ok : colors.dim;

    this.add(this.drawBody(screenFill, ledFill));
    this.add(
      <Txt
        ref={this.labelTxt}
        text={props.label ?? ''}
        y={this.labelY()}
        fill={colors.text}
        fontFamily={fonts.body}
        fontSize={sizes.label}
        fontWeight={600}
      />,
    );
  }

  /** Where the label sits, and where a link should attach below or beside. */
  public labelY() {
    return {laptop: 95, phone: 90, router: 80, switch: 60, ap: 80, firewall: 90, server: 120, cloud: 110}[
      this.kind
    ];
  }

  /** Screen and LED come alive. */
  public *powerOn(duration = T.fade) {
    yield* all(
      this.screen().fill(colors.screenOn, duration),
      this.led().fill(colors.ok, duration),
      this.led().scale(1.6, duration / 2).to(1, duration / 2),
    );
  }

  public *powerOff(duration = T.fade) {
    yield* all(this.screen().fill(colors.screenOff, duration), this.led().fill(colors.dim, duration));
  }

  /** Status LED flickers, like activity on a real device. */
  public *blink(times = 3) {
    for (let i = 0; i < times; i++) {
      yield* this.led().opacity(0.2, 0.08);
      yield* this.led().opacity(1, 0.08);
    }
  }

  /** Something is wrong: screen and LED go red, and the device shakes. */
  public *fail(duration = T.fade) {
    yield* all(
      this.screen().fill('#5a1c1c', duration),
      this.led().fill(colors.fault, duration),
      sequence(0.06, ...[-12, 12, -8, 8, 0].map(x => this.screen().x(x, 0.06))),
    );
  }

  /** Back to a healthy powered-on state. */
  public *recover(duration = T.fade) {
    yield* this.powerOn(duration);
  }

  /** Pop in from nothing. */
  public *appear(duration = T.pop) {
    this.scale(0);
    this.opacity(1);
    yield* this.scale(1, duration, easeOutBack);
  }

  public *setLabel(text: string, duration = T.fade) {
    yield* this.labelTxt().text(text, duration);
  }

  public *pulse() {
    yield* this.scale(1.12, 0.15).to(1, 0.2);
  }

  private drawBody(screenFill: string, ledFill: string) {
    const stroke = colors.text;
    switch (this.kind) {
      case 'laptop':
        return (
          <Node>
            <Rect ref={this.screen} width={150} height={100} y={-15} radius={8} fill={screenFill} stroke={stroke} lineWidth={5} />
            <Rect width={190} height={16} y={45} radius={6} fill={colors.panelEdge} stroke={stroke} lineWidth={4} />
            <Circle ref={this.led} size={12} x={78} y={45} fill={ledFill} />
          </Node>
        );
      case 'phone':
        return (
          <Node>
            <Rect ref={this.screen} width={70} height={120} radius={14} fill={screenFill} stroke={stroke} lineWidth={5} />
            <Circle ref={this.led} size={10} y={-46} fill={ledFill} />
          </Node>
        );
      case 'router':
        return (
          <Node>
            <Line points={[[-60, -30], [-75, -80]]} stroke={stroke} lineWidth={5} lineCap={'round'} />
            <Line points={[[60, -30], [75, -80]]} stroke={stroke} lineWidth={5} lineCap={'round'} />
            <Rect ref={this.screen} width={200} height={70} radius={14} fill={screenFill} stroke={stroke} lineWidth={5} />
            <Circle ref={this.led} size={14} x={70} fill={ledFill} />
          </Node>
        );
      case 'switch':
        return (
          <Node>
            <Rect ref={this.screen} width={240} height={50} radius={8} fill={screenFill} stroke={stroke} lineWidth={5} />
            {[-80, -50, -20, 10, 40, 70].map(x => (
              <Rect x={x + 10} width={18} height={14} radius={2} fill={colors.panelEdge} />
            ))}
            <Circle ref={this.led} size={10} x={-100} fill={ledFill} />
          </Node>
        );
      case 'ap':
        return (
          <Node>
            <Circle size={90} y={-40} startAngle={-150} endAngle={-30} stroke={stroke} lineWidth={4} />
            <Circle size={50} y={-40} startAngle={-150} endAngle={-30} stroke={stroke} lineWidth={4} />
            <Rect ref={this.screen} width={150} height={40} radius={20} fill={screenFill} stroke={stroke} lineWidth={5} />
            <Circle ref={this.led} size={12} fill={ledFill} />
          </Node>
        );
      case 'firewall':
        return (
          <Node>
            <Rect ref={this.screen} width={150} height={120} radius={8} fill={screenFill} stroke={stroke} lineWidth={5} />
            {[-30, 0, 30].map(y => (
              <Line points={[[-75, y], [75, y]]} stroke={stroke} lineWidth={3} opacity={0.6} />
            ))}
            <Circle ref={this.led} size={12} x={55} y={-45} fill={ledFill} />
          </Node>
        );
      case 'server':
        return (
          <Node>
            <Rect ref={this.screen} width={120} height={180} radius={10} fill={screenFill} stroke={stroke} lineWidth={5} />
            {[-50, -10, 30].map(y => (
              <Rect y={y} width={90} height={22} radius={4} fill={colors.panelEdge} />
            ))}
            <Circle ref={this.led} size={12} x={35} y={70} fill={ledFill} />
          </Node>
        );
      case 'cloud': {
        // An outline layer, then a fill layer that follows the screen color.
        const puffs: [number, number, number][] = [[-70, 10, 100], [0, -20, 130], [70, 10, 100]];
        const fill = () => this.screen().fill();
        return (
          <Node>
            {puffs.map(([x, y, size]) => (
              <Circle x={x} y={y} size={size + 10} fill={stroke} />
            ))}
            <Rect y={35} width={250} height={70} radius={35} fill={stroke} />
            {puffs.map(([x, y, size]) => (
              <Circle x={x} y={y} size={size} fill={fill} />
            ))}
            <Rect ref={this.screen} y={35} width={240} height={60} radius={30} fill={screenFill} />
            <Circle ref={this.led} size={12} x={95} y={40} fill={ledFill} />
          </Node>
        );
      }
    }
  }
}
