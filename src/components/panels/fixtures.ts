// Data for stories and tests only. The app never imports this file.
import type { PlanResult } from "@/domain/planner";
import type { LngLat, Route, WalkerSettings } from "@/domain/types";
import type { ActiveWalk } from "@/storage";
import { DEFAULT_SETTINGS } from "@/storage";

export const FIXED_NOW = Date.UTC(2026, 8, 25, 17, 0);

export const ORIGIN: LngLat = [-9.1395, 38.7115];

export const COLORS = ["#2563eb", "#e11d48", "#d97706", "#7c3aed", "#0d9488"];

export const SETTINGS: WalkerSettings = { ...DEFAULT_SETTINGS };

const route = (lengthM: number, shape: Route["shape"] = "loop"): Route => ({
  coordinates: [ORIGIN, [-9.135, 38.714], [-9.138, 38.709], ORIGIN],
  lengthM,
  shape,
});

export const CANDIDATES: PlanResult = {
  candidates: [route(2460), route(2380), route(2610)],
  kind: "candidates",
};

export const ONE_CANDIDATE: PlanResult = {
  candidates: [route(2510)],
  kind: "candidates",
};

export const OUT_AND_BACK: PlanResult = {
  candidates: [route(2440, "out-and-back")],
  kind: "candidates",
};

export const CLOSEST: PlanResult = { kind: "closest", route: route(3420) };

export const routesOf = (result: PlanResult) =>
  result.kind === "candidates" ? result.candidates : [result.route];

export const walk = (overrides: Partial<ActiveWalk> = {}): ActiveWalk => ({
  color: COLORS[0],
  origin: ORIGIN,
  progressM: 1100,
  route: route(2500),
  startedAt: FIXED_NOW - 13 * 60_000,
  target: { kind: "time", value: 30 },
  ...overrides,
});
