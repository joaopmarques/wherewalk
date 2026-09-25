import { destination } from "./geo";
import { fitsTarget } from "./tolerance";
import type { LngLat, Route } from "./types";

/**
 * The routing service that plans streets. The ORS adapter implements it.
 * An error with `stopsPlanning: true`, such as a used-up quota, stops all further requests.
 */
export interface Router {
  /** A Loop of about the given length. Different seeds give different Loops. */
  loop(origin: LngLat, lengthM: number, seed: number): Promise<Route>;
  /** A one-way walking path between two points. */
  path(
    from: LngLat,
    to: LngLat
  ): Promise<{ coordinates: LngLat[]; lengthM: number }>;
}

export type PlanResult =
  | { kind: "candidates"; candidates: Route[] }
  | { kind: "closest"; route: Route };

export const MAX_CANDIDATES = 5;
/** Stop the correction rounds early when this many Candidates fit. */
const ENOUGH_CANDIDATES = 3;
/** Extra rounds that re-ask each missed attempt with a scaled length. */
const CORRECTION_ROUNDS = 2;

/** Streets are longer than a straight line. This is a typical ratio for walking. */
const DETOUR_FACTOR = 1.3;

const stopsPlanning = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { stopsPlanning?: unknown }).stopsPlanning === true;

/** Carries the Candidates found so far out of the planner when a request stops planning. */
class PlanningStopped {
  constructor(
    readonly error: unknown,
    readonly fits: Route[]
  ) {}
}

/**
 * One way to reach the Target, such as one Loop seed or one Out-and-back direction.
 * `size` is the value sent to the Router: a Loop length or a straight-line reach.
 */
interface Attempt {
  size: number;
  make: (size: number) => Promise<Route>;
  last?: Route;
}

/**
 * Plans Candidates for a Target distance, in this order:
 * 1. Loops.
 * 2. Out-and-backs in several directions, only when no Loop fits.
 * 3. The Closest Route of all tries, only when nothing fits.
 *
 * The router does not return exact lengths. In an area with few streets, ORS can return a
 * Loop three times longer than asked. So each shape gets correction rounds: the planner
 * asks again with the size scaled by how far the last result missed.
 */
export async function planRoutes(
  origin: LngLat,
  targetM: number,
  router: Router,
  seed = 0
): Promise<PlanResult> {
  try {
    return await plan(origin, targetM, router, seed);
  } catch (e) {
    if (!(e instanceof PlanningStopped)) throw e;
    // Show what fits so far. Without a Candidate, the Walker needs to see the reason.
    if (e.fits.length > 0)
      return {
        kind: "candidates",
        candidates: sortByCloseness(e.fits, targetM),
      };
    throw e.error;
  }
}

const sortByCloseness = (routes: Route[], targetM: number) =>
  [...routes]
    .sort(
      (a, b) => Math.abs(a.lengthM - targetM) - Math.abs(b.lengthM - targetM)
    )
    .slice(0, MAX_CANDIDATES);

async function plan(
  origin: LngLat,
  targetM: number,
  router: Router,
  seed: number
): Promise<PlanResult> {
  const everything: Route[] = [];
  const errors: unknown[] = [];

  const run = async (attempts: Attempt[]): Promise<Route[]> => {
    const fits: Route[] = [];
    for (let round = 0; round <= CORRECTION_ROUNDS; round++) {
      const pending =
        round === 0
          ? attempts
          : attempts.filter(
              (a) => a.last && !fitsTarget(a.last.lengthM, targetM)
            );
      if (pending.length === 0) break;
      if (round > 0)
        for (const a of pending) a.size *= targetM / a.last!.lengthM;

      const results = await Promise.allSettled(
        pending.map((a) => a.make(a.size))
      );
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          errors.push(r.reason);
        } else {
          pending[i].last = r.value;
          everything.push(r.value);
          if (fitsTarget(r.value.lengthM, targetM)) fits.push(r.value);
        }
      });
      const fatal = results.find(
        (r) => r.status === "rejected" && stopsPlanning(r.reason)
      );
      if (fatal)
        throw new PlanningStopped(
          (fatal as PromiseRejectedResult).reason,
          distinct(fits)
        );
      if (distinct(fits).length >= ENOUGH_CANDIDATES) break;
    }
    return distinct(fits);
  };

  const toResult = (fits: Route[]): PlanResult => ({
    kind: "candidates",
    candidates: sortByCloseness(fits, targetM),
  });

  // 1. Loops, one attempt per seed.
  const loops = await run(
    Array.from({ length: MAX_CANDIDATES }, (_, i) => ({
      size: targetM,
      make: (size: number) => router.loop(origin, size, seed + i),
    }))
  );
  if (loops.length > 0) return toResult(loops);

  // 2. Out-and-backs. The far point starts at half the Target away, in evenly spaced directions.
  const startBearing = (seed * 37) % 360;
  const outAndBacks = await run(
    Array.from({ length: MAX_CANDIDATES }, (_, i) => {
      const bearing = startBearing + (360 / MAX_CANDIDATES) * i;
      return {
        size: targetM / 2 / DETOUR_FACTOR,
        make: async (reach: number) =>
          toOutAndBack(
            await router.path(origin, destination(origin, reach, bearing))
          ),
      };
    })
  );
  if (outAndBacks.length > 0) return toResult(outAndBacks);

  // 3. Nothing fits. Show the Closest Route, or fail when every request failed.
  if (everything.length === 0) throw errors[0] ?? new Error("No route found.");
  const closest = everything.reduce((best, r) =>
    Math.abs(r.lengthM - targetM) < Math.abs(best.lengthM - targetM) ? r : best
  );
  return { kind: "closest", route: closest };
}

function toOutAndBack(path: { coordinates: LngLat[]; lengthM: number }): Route {
  const back = path.coordinates.slice(0, -1).reverse();
  return {
    shape: "out-and-back",
    coordinates: [...path.coordinates, ...back],
    lengthM: path.lengthM * 2,
  };
}

/** Different seeds can give the same Loop. Routes with the same length and middle point count as one. */
function distinct(routes: Route[]): Route[] {
  const seen = new Set<string>();
  return routes.filter((r) => {
    const [lng, lat] = r.coordinates[Math.floor(r.coordinates.length / 2)];
    const key = `${Math.round(r.lengthM / 10)}:${lng.toFixed(4)}:${lat.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
