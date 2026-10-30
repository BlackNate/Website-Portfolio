import {Line, Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {PossibleVector2, ThreadGenerator, Vector2, all, createRef, easeOutBack} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

/**
 * A glossary label that appears the first time a term is used:
 * the term in bold, its plain meaning underneath, and an optional
 * pointer line to the thing it names.
 */
export class TermChip extends Node {
  private readonly card = createRef<Rect>();
  private readonly term = createRef<Txt>();
  private readonly meaning = createRef<Txt>();
  private readonly pointer = createRef<Line>();

  public constructor(props: NodeProps) {
    super({...props});
    this.add(
      <Line ref={this.pointer} points={[Vector2.zero, Vector2.zero]} stroke={colors.accent} lineWidth={3} lineDash={[8, 6]} end={0} />,
    );
    this.add(
      <Rect
        ref={this.card}
        layout
        direction={'column'}
        alignItems={'start'}
        padding={[14, 22]}
        gap={4}
        radius={12}
        fill={colors.panel}
        stroke={colors.accent}
        lineWidth={3}
        scale={0}
      >
        <Txt ref={this.term} fill={colors.accent} fontFamily={fonts.body} fontSize={sizes.body} fontWeight={800} />
        <Txt ref={this.meaning} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.small} />
      </Rect>,
    );
  }

  /**
   * Pops the chip in. `pointAt` is a world position the dashed pointer
   * line reaches toward, such as a device or a link light.
   */
  public *introduce(term: string, meaning: string, pointAt?: PossibleVector2, duration = T.pop) {
    this.term().text(term);
    this.meaning().text(meaning);
    const tweens: ThreadGenerator[] = [this.card().scale(1, duration, easeOutBack)];
    if (pointAt) {
      const target = new Vector2(pointAt).transformAsPoint(this.worldToLocal());
      this.pointer().points([Vector2.zero, target]);
      tweens.push(this.pointer().end(1, T.draw));
    }
    yield* all(...tweens);
  }

  public *dismiss(duration = T.fade) {
    yield* all(this.card().scale(0, duration), this.pointer().end(0, duration));
  }
}
