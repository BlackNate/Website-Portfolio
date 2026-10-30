import {Circle, Node, NodeProps, Polygon, Rect, Txt} from '@motion-canvas/2d';
import {
  PossibleVector2,
  Vector2,
  all,
  createRef,
  easeInOutCubic,
  easeOutBack,
} from '@motion-canvas/core';
import {colors, fonts, sizes} from '../theme';
import {T} from '../timing';

export interface CityMapProps extends NodeProps {
  /** Half-size of the ground in each direction. */
  extent?: number;
  /** Distance between streets. */
  block?: number;
}

/**
 * The city seen from above: ground, a street grid, and houses and districts
 * that are added as the course grows. Children live in `world`, so
 * focus() can zoom the whole city around one spot.
 */
export class CityMap extends Node {
  private readonly world = createRef<Node>();
  private readonly districts = createRef<Node>();
  private readonly houses = createRef<Node>();

  public constructor(props: CityMapProps) {
    super({...props});
    const extent = props.extent ?? 1400;
    const block = props.block ?? 320;
    const streets: number[] = [];
    for (let s = -extent + block / 2; s < extent; s += block) streets.push(s);

    this.add(
      <Node ref={this.world}>
        <Rect width={extent * 2} height={extent * 2} fill={colors.ground} />
        {streets.map(s => (
          <Rect x={s} width={34} height={extent * 2} fill={colors.street} />
        ))}
        {streets.map(s => (
          <Rect y={s} width={extent * 2} height={34} fill={colors.street} />
        ))}
        <Node ref={this.districts} />
        <Node ref={this.houses} />
      </Node>,
    );
  }

  /** Builds a house at a map position and pops it in. Returns the house node. */
  public *addHouse(at: PossibleVector2, label = '', color: string = colors.accent) {
    const house = (
      <Node position={at} scale={0}>
        <Polygon sides={3} size={120} y={-50} fill={color} stroke={colors.bg} lineWidth={4} />
        <Rect width={100} height={70} y={10} fill={colors.text} stroke={colors.bg} lineWidth={4} />
        <Rect width={24} height={38} y={26} fill={colors.panelEdge} />
        <Txt text={label} y={78} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.small} fontWeight={700} />
      </Node>
    ) as Node;
    this.houses().add(house);
    yield* house.scale(1, T.pop, easeOutBack);
    return house;
  }

  /** Outlines a district with a soft color and a name. */
  public *addDistrict(name: string, at: PossibleVector2, size: PossibleVector2, color: string) {
    const area = new Vector2(size);
    const district = (
      <Rect position={at} size={area} radius={40} fill={color} opacity={0} stroke={colors.text} lineWidth={3} lineDash={[16, 12]}>
        <Txt text={name} y={-area.y / 2 + 40} fill={colors.text} fontFamily={fonts.body} fontSize={sizes.label} fontWeight={800} />
      </Rect>
    ) as Rect;
    this.districts().add(district);
    yield* district.opacity(0.85, T.fade);
    return district;
  }

  /** Draws attention to a node on the map with an expanding ring. */
  public *highlight(target: Node, color: string = colors.warn) {
    const ring = (
      <Circle position={target.position()} size={160} stroke={color} lineWidth={8} opacity={0} />
    ) as Circle;
    this.houses().add(ring);
    for (let i = 0; i < 2; i++) {
      ring.size(160).opacity(1);
      yield* all(ring.size(300, 0.9), ring.opacity(0, 0.9));
    }
    ring.remove();
  }

  /** Zooms the map so that `at` (in map coordinates) moves to the center. */
  public *focus(at: PossibleVector2, zoom = 2, duration = 1.4) {
    const target = new Vector2(at).scale(-zoom);
    yield* all(
      this.world().scale(zoom, duration, easeInOutCubic),
      this.world().position(target, duration, easeInOutCubic),
    );
  }
}
