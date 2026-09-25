import { describe, expect, it } from "vitest";
import { destination, distanceM } from "./geo";
import { planRoutes, type Router } from "./planner";
import {
  isFinished,
  matchProgress,
  measureRoute,
  sliceRoute,
} from "./progress";
import { metersToTargetUnit, targetToMeters } from "./target";
import { fitsTarget } from "./tolerance";
import type { LngLat, Route } from "./types";

const settings = { paceKmh: 5, strideM: 0.75 };
const origin: LngLat = [-8.6291, 41.1579];

/** A square Loop with 250 m sides that starts and ends at the Origin, going north first. */
function squareLoop(): LngLat[] {
  const n = destination(origin, 250, 0);
  const ne = destination(n, 250, 90);
  const e = destination(origin, 250, 90);
  return [origin, n, ne, e, origin];
}

describe("Target conversion", () => {
  it("converts time, distance, and steps to meters", () => {
    expect(targetToMeters({ kind: "time", value: 30 }, settings)).toBeCloseTo(
      2500
    );
    expect(targetToMeters({ kind: "distance", value: 3000 }, settings)).toBe(
      3000
    );
    expect(
      targetToMeters({ kind: "steps", value: 5000 }, settings)
    ).toBeCloseTo(3750);
  });

  it("converts meters back to the Target unit", () => {
    expect(metersToTargetUnit(2500, "time", settings)).toBeCloseTo(30);
    expect(metersToTargetUnit(3750, "steps", settings)).toBeCloseTo(5000);
  });
});

describe("Tolerance", () => {
  it("accepts lengths within 10% of the Target", () => {
    expect(fitsTarget(2700, 3000)).toBe(true);
    expect(fitsTarget(3300, 3000)).toBe(true);
    expect(fitsTarget(2650, 3000)).toBe(false);
    expect(fitsTarget(3350, 3000)).toBe(false);
  });
});

describe("Progress", () => {
  const route = measureRoute(squareLoop());

  it("measures the Route length", () => {
    expect(route.lengthM).toBeCloseTo(1000, -1);
  });

  it("starts at zero at the Origin, not at the end of the Loop", () => {
    expect(matchProgress(route, origin, 0)).toBeCloseTo(0, 0);
  });

  it("moves forward along the Route", () => {
    const p = destination(origin, 100, 0);
    expect(matchProgress(route, p, 0)).toBeCloseTo(100, -1);
  });

  it("never goes backward", () => {
    const behind = destination(origin, 50, 0);
    expect(matchProgress(route, behind, 200)).toBe(200);
  });

  it("jumps forward after a gap in positions", () => {
    const onEastSide = destination(destination(origin, 250, 90), 100, 0);
    expect(matchProgress(route, onEastSide, 100)).toBeCloseTo(650, -1);
  });

  it("holds Progress when the Walker is far from the Route", () => {
    const faraway = destination(origin, 500, 225);
    expect(matchProgress(route, faraway, 120)).toBe(120);
  });

  it("picks the earliest leg of an Out-and-back", () => {
    const far = destination(origin, 500, 0);
    const outAndBack = measureRoute([origin, far, origin]);
    const p = destination(origin, 200, 0);
    expect(matchProgress(outAndBack, p, 0)).toBeCloseTo(200, -1);
    expect(matchProgress(outAndBack, p, 600)).toBeCloseTo(800, -1);
  });

  it("finishes only after halfway, back near the Origin", () => {
    expect(isFinished(route, origin, 0, origin)).toBe(false);
    expect(isFinished(route, origin, 980, origin)).toBe(true);
    expect(isFinished(route, destination(origin, 250, 0), 600, origin)).toBe(
      false
    );
  });

  it("slices the walked part of the Route", () => {
    const walked = sliceRoute(route, 125);
    expect(walked).toHaveLength(2);
    expect(distanceM(walked[0], walked[1])).toBeCloseTo(125, -1);
  });
});

describe("Route planner", () => {
  /**
   * A fake router that behaves like ORS: each seed returns a Loop whose length is the asked
   * length times a fixed factor. Each seed has its own middle point, so the Loops are distinct.
   */
  function fakeRouter(loopFactors: number[], pathFactor = 1.3) {
    const calls = { loop: 0, path: 0 };
    const router: Router = {
      loop: async (o, lengthM, seed) => {
        calls.loop++;
        const mid: LngLat = [seed, seed];
        return {
          coordinates: [o, mid, o],
          lengthM: lengthM * loopFactors[seed % loopFactors.length],
          shape: "loop",
        };
      },
      path: async (from, to) => {
        calls.path++;
        return {
          coordinates: [from, to],
          lengthM: distanceM(from, to) * pathFactor,
        };
      },
    };
    return { calls, router };
  }

  it("returns fitting Loops sorted by closeness to the Target", async () => {
    const { router, calls } = fakeRouter([1.05, 2, 0.97, 3, 1.02]);
    const result = await planRoutes(origin, 3000, router);
    expect(result.kind).toBe("candidates");
    if (result.kind !== "candidates") {
      return;
    }
    expect(result.candidates.map((r) => Math.round(r.lengthM))).toEqual([
      3060, 2910, 3150,
    ]);
    // Three Candidates fit in the first round, so no correction round runs.
    expect(calls.loop).toBe(5);
  });

  it("corrects Loops that come back much too long", async () => {
    const { router, calls } = fakeRouter([2.1, 3.4, 1.3, 2.2, 2.8]);
    const result = await planRoutes(origin, 2500, router);
    expect(result.kind).toBe("candidates");
    if (result.kind !== "candidates") {
      return;
    }
    expect(result.candidates).toHaveLength(5);
    expect(
      result.candidates.every(
        (r) => r.shape === "loop" && fitsTarget(r.lengthM, 2500)
      )
    ).toBe(true);
    expect(calls.loop).toBe(10);
    expect(calls.path).toBe(0);
  });

  it("removes duplicate Loops from different seeds", async () => {
    const same: Route = {
      coordinates: [origin, [1, 1], origin],
      lengthM: 3000,
      shape: "loop",
    };
    const router: Router = {
      loop: async () => same,
      path: () => Promise.reject(new Error("unused")),
    };
    const result = await planRoutes(origin, 3000, router);
    expect(result).toEqual({ candidates: [same], kind: "candidates" });
  });

  it("falls back to Out-and-backs when no Loop fits", async () => {
    const failingLoops: Router = {
      ...fakeRouter([1]).router,
      loop: () => Promise.reject(new Error("no loop")),
    };
    const result = await planRoutes(origin, 3000, failingLoops);
    expect(result.kind).toBe("candidates");
    if (result.kind !== "candidates") {
      return;
    }
    expect(result.candidates.every((r) => r.shape === "out-and-back")).toBe(
      true
    );
    expect(result.candidates.every((r) => fitsTarget(r.lengthM, 3000))).toBe(
      true
    );
  });

  it("returns the Closest Route when nothing fits", async () => {
    // Lengths that ignore the request, so correction cannot help.
    const lengths = [2000, 1500, 4000];
    let call = 0;
    const router: Router = {
      loop: async (o, _lengthM, seed) => ({
        coordinates: [o, [seed, seed], o],
        lengthM: lengths[call++ % 3],
        shape: "loop",
      }),
      path: async (from, to) => ({ coordinates: [from, to], lengthM: 300 }),
    };
    const result = await planRoutes(origin, 3000, router);
    expect(result.kind).toBe("closest");
    if (result.kind !== "closest") {
      return;
    }
    expect(result.route.lengthM).toBe(2000);
  });

  it("stops sending requests after an error that stops planning", async () => {
    const quota = Object.assign(new Error("quota"), { stopsPlanning: true });
    let calls = 0;
    const router: Router = {
      loop: () => (calls++, Promise.reject(quota)),
      path: () => (calls++, Promise.reject(quota)),
    };
    await expect(planRoutes(origin, 3000, router)).rejects.toThrow("quota");
    expect(calls).toBe(5);
  });

  it("keeps Candidates found before an error that stops planning", async () => {
    const quota = Object.assign(new Error("quota"), { stopsPlanning: true });
    const router: Router = {
      loop: async (o, lengthM, seed) => {
        if (seed === 1) {
          throw quota;
        }
        return {
          coordinates: [o, [seed, seed], o],
          lengthM: seed === 0 ? lengthM : lengthM * 3,
          shape: "loop",
        };
      },
      path: () => Promise.reject(new Error("unused")),
    };
    const result = await planRoutes(origin, 3000, router);
    expect(result.kind).toBe("candidates");
    if (result.kind !== "candidates") {
      return;
    }
    expect(result.candidates.map((r) => r.lengthM)).toEqual([3000]);
  });

  it("fails when every request fails", async () => {
    const failing: Router = {
      loop: () => Promise.reject(new Error("bad key")),
      path: () => Promise.reject(new Error("bad key")),
    };
    await expect(planRoutes(origin, 3000, failing)).rejects.toThrow("bad key");
  });
});
