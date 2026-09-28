/** How far a Route's length may differ from the Target and still count as a match. */
export const TOLERANCE = 0.1;

export function fitsTarget(lengthM: number, targetM: number): boolean {
  return Math.abs(lengthM - targetM) <= targetM * TOLERANCE;
}
