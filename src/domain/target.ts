import type { Target, TargetKind, WalkerSettings } from "./types";

export const DEFAULT_PACE_KMH = 5;
export const DEFAULT_STRIDE_M = 0.75;

/** Converts a Target to the distance that Where2Walk plans for, in meters. */
export function targetToMeters(
  target: Target,
  settings: Pick<WalkerSettings, "paceKmh" | "strideM">
): number {
  switch (target.kind) {
    case "distance":
      return target.value;
    case "time":
      return (target.value / 60) * settings.paceKmh * 1000;
    case "steps":
      return target.value * settings.strideM;
  }
}

/** Converts a distance in meters to the unit of a Target kind: minutes, meters, or steps. */
export function metersToTargetUnit(
  meters: number,
  kind: TargetKind,
  settings: Pick<WalkerSettings, "paceKmh" | "strideM">
): number {
  switch (kind) {
    case "distance":
      return meters;
    case "time":
      return (meters / 1000 / settings.paceKmh) * 60;
    case "steps":
      return meters / settings.strideM;
  }
}
