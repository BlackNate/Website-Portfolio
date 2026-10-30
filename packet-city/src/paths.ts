import {Node} from '@motion-canvas/2d';
import {Vector2} from '@motion-canvas/core';

/**
 * Turns a list of devices into a packet route: the absolute (world) position
 * of each stop. Pass the devices in the order the packet visits them.
 */
export function route(...stops: Node[]): Vector2[] {
  return stops.map(stop => stop.absolutePosition());
}

/** The same route, travelled backwards (for replies). */
export function back(path: Vector2[]): Vector2[] {
  return [...path].reverse();
}
