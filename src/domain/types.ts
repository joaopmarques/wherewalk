/** A position as [longitude, latitude], the order that GeoJSON and MapLibre use. */
export type LngLat = [number, number];

export type RouteShape = "loop" | "out-and-back";

/** A planned path that starts and ends at the Origin. */
export interface Route {
  shape: RouteShape;
  coordinates: LngLat[];
  lengthM: number;
}

export type TargetKind = "time" | "distance" | "steps";

/**
 * How much the Walker wants to walk.
 * The value is in minutes for time, meters for distance, and a count for steps.
 */
export interface Target {
  kind: TargetKind;
  value: number;
}

export type UnitPreference = "auto" | "metric" | "imperial";
export type Units = "metric" | "imperial";

export interface WalkerSettings {
  paceKmh: number;
  strideM: number;
  units: UnitPreference;
  /** The Walker's own ORS key. An empty string means "use the built-in key". */
  orsKey: string;
}
