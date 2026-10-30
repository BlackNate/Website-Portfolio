import {Line, Node, Txt, View2D} from '@motion-canvas/2d';
import {ThreadGenerator, all, createRef} from '@motion-canvas/core';
import {Device} from './components/Device';
import {Link} from './components/Link';
import {colors, fonts, sizes} from './theme';
import {T} from './timing';

/**
 * Saved starting networks. Scenes import these instead of redrawing them,
 * so the same house looks the same in every beat of every lesson.
 */

export interface OneHouse {
  layer: Node;
  houseOutline: Line;
  houseLabel: Txt;
  laptop: Device;
  phone: Device;
  router: Device;
  internet: Device;
  /** Copper cable from the laptop to the router; its link light is at the router. */
  homeLink: Link;
  /** The router's connection out to the internet provider. */
  wanLink: Link;
  /** Wi-Fi between the phone and the router; starts hidden. */
  phoneLink: Link;
  /** Fades in the house outline and its label. */
  showHouse(): ThreadGenerator;
}

/**
 * Maya's house: a laptop cabled to a home router, which connects out to the
 * internet. A phone on Wi-Fi is included but starts hidden.
 *
 * `built: true` gives the finished, working network (for walkthroughs);
 * `built: false` gives every part hidden and powered off (for concept scenes
 * that assemble it piece by piece).
 */
export function oneHouse(view: View2D, built = true): OneHouse {
  const layer = createRef<Node>();
  const houseOutline = createRef<Line>();
  const houseLabel = createRef<Txt>();
  const laptop = createRef<Device>();
  const phone = createRef<Device>();
  const router = createRef<Device>();
  const internet = createRef<Device>();
  const homeLink = createRef<Link>();
  const wanLink = createRef<Link>();
  const phoneLink = createRef<Link>();
  const shown = built ? 1 : 0;

  view.add(
    <Node ref={layer}>
      <Line
        ref={houseOutline}
        points={[[-720, 240], [-720, -110], [-285, -300], [150, -110], [150, 240]]}
        closed
        stroke={colors.muted}
        lineWidth={4}
        lineDash={[18, 12]}
        opacity={shown}
      />
      <Txt
        ref={houseLabel}
        text={"Maya's house"}
        position={[-285, -170]}
        fill={colors.muted}
        fontFamily={fonts.body}
        fontSize={sizes.label}
        fontWeight={700}
        opacity={shown}
      />
      <Device ref={laptop} kind={'laptop'} label={'Laptop'} position={[-560, 60]} powered={built} opacity={shown} />
      <Device ref={phone} kind={'phone'} label={'Phone'} position={[-430, -110]} powered={built} opacity={0} />
      <Device ref={router} kind={'router'} label={'Router'} position={[-60, 85]} powered={built} opacity={shown} />
      <Device ref={internet} kind={'cloud'} label={'Internet'} position={[560, 25]} powered={built} opacity={shown} />
      {/* Links after devices so each link light draws on top of its device. */}
      <Link ref={homeLink} from={[-465, 105]} to={[-160, 105]} kind={'copper'} light={'to'} up={built} />
      <Link ref={phoneLink} from={[-385, -100]} to={[-95, 20]} kind={'wireless'} light={'none'} opacity={0} />
      <Link ref={wanLink} from={[40, 85]} to={[435, 85]} kind={'fiber'} light={'none'} up={built} />
    </Node>,
  );

  return {
    layer: layer(),
    houseOutline: houseOutline(),
    houseLabel: houseLabel(),
    laptop: laptop(),
    phone: phone(),
    router: router(),
    internet: internet(),
    homeLink: homeLink(),
    wanLink: wanLink(),
    phoneLink: phoneLink(),
    *showHouse() {
      yield* all(houseOutline().opacity(1, T.fade), houseLabel().opacity(1, T.fade));
    },
  };
}
