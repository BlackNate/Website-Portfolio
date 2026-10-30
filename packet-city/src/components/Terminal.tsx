import {Circle, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, waitFor} from '@motion-canvas/core';
import {colors, fonts} from '../theme';
import {T} from '../timing';

export interface TerminalProps extends NodeProps {
  title?: string;
  width?: number;
  height?: number;
  prompt?: string;
}

/** A command-line window that types commands and prints their output. */
export class Terminal extends Node {
  private readonly lines = createRef<Rect>();
  private readonly prompt: string;

  public constructor(props: TerminalProps) {
    super({...props});
    const width = props.width ?? 900;
    const height = props.height ?? 380;
    this.prompt = props.prompt ?? '$ ';

    this.add(
      <Rect width={width} height={height} radius={14} fill={'#070b10'} stroke={colors.panelEdge} lineWidth={3} clip>
        <Rect y={-height / 2 + 22} width={width} height={44} fill={colors.panel} />
        {[0, 1, 2].map(i => (
          <Circle x={-width / 2 + 30 + i * 28} y={-height / 2 + 22} size={16} fill={[colors.fault, colors.warn, colors.ok][i]} />
        ))}
        <Txt
          y={-height / 2 + 22}
          text={props.title ?? 'terminal'}
          fill={colors.muted}
          fontFamily={fonts.body}
          fontSize={22}
        />
        <Rect
          ref={this.lines}
          y={22}
          width={width - 40}
          height={height - 64}
          layout
          direction={'column'}
          justifyContent={'end'}
          alignItems={'start'}
          gap={6}
          clip
        />
      </Rect>,
    );
  }

  /** Types a command one character at a time after the prompt. */
  public *type(command: string, perChar = T.typeChar) {
    const line = this.addLine(this.prompt, colors.text);
    for (const char of command) {
      line.text(line.text() + char);
      yield* waitFor(perChar);
    }
    yield* waitFor(T.pop);
  }

  /** Prints output lines, with a short gap between each one. */
  public *print(output: string | string[], color: string = colors.muted, gap = 0.25) {
    for (const text of Array.isArray(output) ? output : [output]) {
      const line = this.addLine(text, color);
      line.opacity(0);
      yield* line.opacity(1, 0.12);
      yield* waitFor(gap);
    }
  }

  /** Briefly highlights the last printed line. */
  public *flashLast(color: string = colors.ok) {
    const children = this.lines().children();
    const last = children[children.length - 1] as Txt | undefined;
    if (!last) return;
    const before = last.fill();
    yield* last.fill(color, 0.2).wait(0.6).to(before, 0.3);
  }

  public *clear(duration = T.fade) {
    const children = this.lines().children();
    yield* all(...children.map(child => child.opacity(0, duration)));
    this.lines().removeChildren();
  }

  private addLine(text: string, color: string) {
    const line = (
      <Txt text={text} fill={color} fontFamily={fonts.mono} fontSize={28} />
    ) as Txt;
    this.lines().add(line);
    return line;
  }
}
