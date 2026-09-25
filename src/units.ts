import type { UnitPreference, Units } from "./domain/types";

export const M_PER_MI = 1609.344;
export const M_PER_KM = 1000;
export const CM_PER_IN = 2.54;

/** Countries that measure walking distance in miles. */
const IMPERIAL_REGIONS = new Set(["US", "GB", "LR", "MM"]);

export function resolveUnits(preference: UnitPreference): Units {
  if (preference !== "auto") return preference;
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return region && IMPERIAL_REGIONS.has(region) ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

export const distanceUnit = (units: Units) =>
  units === "imperial" ? "mi" : "km";
export const metersPerUnit = (units: Units) =>
  units === "imperial" ? M_PER_MI : M_PER_KM;

export function formatDistanceNumber(meters: number, units: Units): string {
  const value = meters / metersPerUnit(units);
  return value.toFixed(value < 10 ? 1 : 0);
}

export const formatDistance = (meters: number, units: Units) =>
  `${formatDistanceNumber(meters, units)} ${distanceUnit(units)}`;

export function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const m = rounded % 60;
  return m === 0
    ? `${rounded / 60} h`
    : `${Math.floor(rounded / 60)} h ${m} min`;
}

export const formatSteps = (steps: number) =>
  Math.round(steps).toLocaleString();
