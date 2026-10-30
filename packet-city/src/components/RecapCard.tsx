import {Node, NodeProps, Rect, Txt} from '@motion-canvas/2d';
import {all, createRef, easeOutBack, sequence} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

/** The closing card: a two-sentence summary and the exam objective tag. */
export class RecapCard extends Node {
  private readonly card = createRef<Rect>();
  private readonly heading = createRef<Txt>();
  private readonly summary = createRef<Txt>();
  private readonly tag = createRef<Rect>();
  private readonly tagTxt = createRef<Txt>();

  public constructor(props: NodeProps) {
    super({...props});
    this.add(
      <Rect
        ref={this.card}
        layout
        direction={'column'}
        alignItems={'start'}
        gap={36}
        padding={64}
        width={1400}
        radius={28}
        fill={colors.panel}
        stroke={colors.accent}
        lineWidth={4}
        scale={0}
      >
        <Txt ref={this.heading} fill={colors.accent} fontFamily={fonts.body} fontSize={sizes.heading} fontWeight={800} />
        <Txt ref={this.summary} width={1270} textWrap fill={colors.text} fontFamily={fonts.body} fontSize={sizes.body + 4} lineHeight={'150%'} opacity={0} />
        <Rect ref={this.tag} layout padding={[10, 20]} radius={10} fill={colors.accent} opacity={0}>
          <Txt ref={this.tagTxt} fill={colors.bg} fontFamily={fonts.mono} fontSize={sizes.small + 2} fontWeight={700} />
        </Rect>
      </Rect>,
    );
  }

  public *show(text: string, tag: string, heading = 'Recap') {
    this.heading().text(heading);
    this.summary().text(text);
    this.tagTxt().text(tag);
    yield* this.card().scale(1, T.pop, easeOutBack);
    yield* sequence(T.beat, this.summary().opacity(1, T.fade), this.tag().opacity(1, T.fade));
  }

  public *dismiss(duration = T.fade) {
    yield* all(this.card().scale(0, duration));
  }
}
