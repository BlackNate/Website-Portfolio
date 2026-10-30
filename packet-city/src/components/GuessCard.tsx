import {Circle, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutBack, linear, sequence, waitFor} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

const letters = ['A', 'B', 'C', 'D'];

/**
 * Pause and predict: a question, up to four options, and a countdown ring.
 * The narrator says "pause the video if you need longer" while it runs.
 */
export class GuessCard extends Node {
  private readonly card = createRef<Rect>();
  private readonly question = createRef<Txt>();
  private readonly ring = createRef<Circle>();
  private readonly count = createRef<Txt>();
  private readonly options = createRef<Rect>();
  private readonly why = createRef<Txt>();

  public constructor(props: NodeProps) {
    super({...props});
    this.add(
      <Rect
        ref={this.card}
        layout
        direction={'column'}
        gap={28}
        padding={48}
        width={1300}
        radius={24}
        fill={colors.panel}
        stroke={colors.warn}
        lineWidth={4}
        scale={0}
      >
        <Rect layout direction={'row'} gap={32} alignItems={'center'}>
          <Circle
            ref={this.ring}
            size={96}
            startAngle={-90}
            endAngle={270}
            stroke={colors.warn}
            lineWidth={8}
            layout
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Txt ref={this.count} fill={colors.warn} fontFamily={fonts.mono} fontSize={40} fontWeight={800} />
          </Circle>
          <Txt
            ref={this.question}
            width={1060}
            textWrap
            fill={colors.text}
            fontFamily={fonts.body}
            fontSize={sizes.body + 4}
            fontWeight={700}
          />
        </Rect>
        <Rect ref={this.options} layout direction={'column'} gap={16} />
        <Txt ref={this.why} width={1200} textWrap fill={colors.text} fontFamily={fonts.body} fontSize={sizes.body - 4} opacity={0} />
      </Rect>,
    );
  }

  /**
   * Shows the question and options, then runs the countdown.
   * Pass `seconds = 0` to show the card only, and call countdown() later.
   */
  public *ask(question: string, choices: string[], seconds = T.think) {
    this.question().text(question);
    this.options().removeChildren();
    for (const [i, choice] of choices.entries()) {
      this.options().add(
        <Rect layout direction={'row'} gap={20} alignItems={'center'} padding={[12, 18]} radius={12} fill={colors.panel} stroke={colors.panelEdge} lineWidth={3} opacity={0}>
          <Rect width={52} height={52} radius={26} fill={colors.panelEdge} layout justifyContent={'center'} alignItems={'center'}>
            <Txt text={letters[i]} fill={colors.text} fontFamily={fonts.body} fontSize={28} fontWeight={800} />
          </Rect>
          <Txt text={choice} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.body - 2} />
        </Rect>,
      );
    }
    this.count().text(String(seconds));
    yield* this.card().scale(1, T.pop, easeOutBack);
    yield* sequence(0.15, ...this.options().children().map(row => row.opacity(1, T.pop)));
    if (seconds > 0) yield* this.countdown(seconds);
  }

  /** Runs the ring and the number down to zero. */
  public *countdown(seconds = T.think) {
    this.count().text(String(seconds));
    yield* all(this.ring().endAngle(-90, seconds, linear), this.countNumbers(seconds));
  }

  /** Marks the right answer, dims the others, and shows a one-line reason. */
  public *reveal(correct: number, reason: string) {
    const rows = this.options().children() as Rect[];
    this.why().text(reason);
    yield* all(
      this.ring().opacity(0.3, T.fade),
      ...rows.map((row, i) =>
        i === correct
          ? all(row.stroke(colors.ok, T.fade), row.fill('#173b2a', T.fade), row.scale(1.04, T.pop).to(1, T.pop))
          : row.opacity(0.35, T.fade),
      ),
    );
    yield* this.why().opacity(1, T.fade);
  }

  public *dismiss(duration = T.fade) {
    yield* this.card().scale(0, duration);
  }

  private *countNumbers(seconds: number) {
    for (let left = seconds; left > 0; left--) {
      this.count().text(String(left));
      yield* waitFor(1);
    }
    this.count().text('0');
  }
}
