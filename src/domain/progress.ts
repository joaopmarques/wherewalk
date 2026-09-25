import { distanceM, projectOnSegment } from "./geo";
import type { LngLat } from "./types";

/** A Route's coordinates with the distance from the start to each coordinate. */
export interface MeasuredRoute {
  coordinates: LngLat[];
  cumulativeM: number[];
  lengthM: number;
}

/** The Walker must be this close to the Route before Progress moves. */
const MAX_MATCH_OFFSET_M = 50;
/** Route points this close to the best match count as equally good. The earliest one wins. */
const TIE_OFFSET_M = 20;
/** How close to the Origin the Walker must be to finish. */
const FINISH_RADIUS_M = 40;

export function measureRoute(coordinates: LngLat[]): MeasuredRoute {
  const cumulativeM = [0];
  for (let i = 1; i < coordinates.length; i++) {
    cumulativeM.push(
      cumulativeM[i - 1] + distanceM(coordinates[i - 1], coordinates[i])
    );
  }
  return {
    coordinates,
    cumulativeM,
    lengthM: cumulativeM.at(-1) ?? 0,
  };
}

/**
 * Finds the new Progress for a position, in meters along the Route.
 *
 * The search looks only forward from the previous Progress, so Progress never goes backward.
 * A Loop passes near the Origin at its start and at its end, and an Out-and-back uses each
 * street twice. When several parts of the Route are equally close, the earliest one wins.
 * This also handles a gap in positions, for example while the screen was locked.
 */
export function matchProgress(
  route: MeasuredRoute,
  position: LngLat,
  previousM: number
): number {
  const { coordinates, cumulativeM } = route;
  const matches: { alongM: number; offsetM: number }[] = [];
  let bestOffset = Number.POSITIVE_INFINITY;

  for (let i = 0; i < coordinates.length - 1; i++) {
    if (cumulativeM[i + 1] < previousM) {
      continue;
    }
    const { t, offsetM } = projectOnSegment(
      position,
      coordinates[i],
      coordinates[i + 1]
    );
    const alongM = Math.max(
      previousM,
      cumulativeM[i] + t * (cumulativeM[i + 1] - cumulativeM[i])
    );
    matches.push({ alongM, offsetM });
    bestOffset = Math.min(bestOffset, offsetM);
  }

  if (bestOffset > MAX_MATCH_OFFSET_M) {
    return previousM;
  }

  let earliest = Number.POSITIVE_INFINITY;
  for (const m of matches) {
    if (m.offsetM <= bestOffset + TIE_OFFSET_M) {
      earliest = Math.min(earliest, m.alongM);
    }
  }
  return Math.max(previousM, earliest);
}

/** A Walk is Finished when Progress has passed halfway and the Walker is back near the Origin. */
export function isFinished(
  route: MeasuredRoute,
  position: LngLat,
  progressM: number,
  origin: LngLat
): boolean {
  if (progressM < route.lengthM / 2) {
    return false;
  }
  return (
    distanceM(position, origin) <= FINISH_RADIUS_M ||
    progressM >= route.lengthM - FINISH_RADIUS_M
  );
}

/** The part of the Route from the start up to a distance along it. */
export function sliceRoute(route: MeasuredRoute, untilM: number): LngLat[] {
  const { coordinates, cumulativeM } = route;
  if (untilM <= 0 || coordinates.length < 2) {
    return [];
  }
  const result: LngLat[] = [coordinates[0]];
  for (let i = 1; i < coordinates.length; i++) {
    if (cumulativeM[i] <= untilM) {
      result.push(coordinates[i]);
      continue;
    }
    const segment = cumulativeM[i] - cumulativeM[i - 1];
    const t = segment === 0 ? 0 : (untilM - cumulativeM[i - 1]) / segment;
    const [x1, y1] = coordinates[i - 1];
    const [x2, y2] = coordinates[i];
    result.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
    break;
  }
  return result;
}
