import type { LngLat } from "./types";

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance between two positions, in meters. */
export function distanceM(a: LngLat, b: LngLat): number {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial compass bearing from a to b, in degrees clockwise from north. */
export function bearingDeg(a: LngLat, b: LngLat): number {
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const dLng = toRad(b[0] - a[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** The position at a distance and bearing from a start position. */
export function destination(
  start: LngLat,
  distance: number,
  bearing: number
): LngLat {
  const d = distance / EARTH_RADIUS_M;
  const b = toRad(bearing);
  const lat1 = toRad(start[1]);
  const lng1 = toRad(start[0]);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(b) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [((toDeg(lng2) + 540) % 360) - 180, toDeg(lat2)];
}

/**
 * Projects a point onto the segment a–b.
 * Returns the fraction along the segment (0 to 1) and the distance from the point to the segment.
 * It uses a flat local projection, which is accurate enough for street-length segments.
 */
export function projectOnSegment(
  p: LngLat,
  a: LngLat,
  b: LngLat
): { t: number; offsetM: number } {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos(toRad(p[1]));
  const ax = (a[0] - p[0]) * metersPerDegLng;
  const ay = (a[1] - p[1]) * metersPerDegLat;
  const bx = (b[0] - p[0]) * metersPerDegLng;
  const by = (b[1] - p[1]) * metersPerDegLat;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0
      ? 0
      : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSq));
  return { t, offsetM: Math.hypot(ax + t * dx, ay + t * dy) };
}
