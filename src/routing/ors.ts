import type { Router } from "../domain/planner";
import type { LngLat } from "../domain/types";

// api.openrouteservice.org is deprecated and runs with a restricted quota. HeiGIT serves ORS here now.
const ORS_URL =
  "https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson";
/** More points make the Loop rounder, with less walking on the same street twice. */
const LOOP_POINTS = 5;
/**
 * OpenStreetMap maps ferry lines, and the walking profile uses them. Without this, a Route in
 * Rotterdam can cross the Maas by ferry. Fords mean wading through water.
 */
export const AVOID_FEATURES = ["ferries", "fords"];
/**
 * ORS way category bit for motorways and trunk roads. The walking profile only penalizes these
 * roads, so the adapter checks each route and drops any that uses one.
 */
const WAY_CATEGORY_MOTOR_ROAD = 1;

export type RouterErrorKind =
  | "no-key"
  | "bad-key"
  | "quota"
  | "no-route"
  | "network";

export class RouterError extends Error {
  /** Only a missing route is local to one request. Every other error affects all requests. */
  readonly stopsPlanning: boolean;
  readonly kind: RouterErrorKind;

  constructor(kind: RouterErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.kind = kind;
    this.stopsPlanning = kind !== "no-route";
  }
}

const QUOTA_PATTERN = /quota/i;

/** The built-in shared key. A Walker's own key in settings overrides it. */
export const BUILT_IN_ORS_KEY: string = import.meta.env.VITE_ORS_KEY ?? "";

/** Router adapter for the hosted OpenRouteService API. A self-hosted ORS takes a different URL. */
export function createOrsRouter(apiKey: string, url = ORS_URL): Router {
  const request = async (body: object) => {
    if (!apiKey) {
      throw new RouterError("no-key", "No ORS key. Add one in settings.");
    }
    const response = await send(url, apiKey, body);
    if (!response.ok) {
      throw await statusError(response);
    }
    return parseRoute(await response.json());
  };

  return {
    loop: async (origin, lengthM, seed) => {
      const route = await request({
        coordinates: [origin],
        options: {
          avoid_features: AVOID_FEATURES,
          round_trip: {
            length: Math.round(lengthM),
            points: LOOP_POINTS,
            seed,
          },
        },
      });
      return { shape: "loop", ...route };
    },
    // The far point of an Out-and-back can land in a park or a lake, so let it snap to any street.
    path: (from, to) =>
      request({
        coordinates: [from, to],
        options: { avoid_features: AVOID_FEATURES },
        radiuses: [1000, -1],
      }),
  };
}

async function send(url: string, apiKey: string, body: object) {
  try {
    return await fetch(url, {
      body: JSON.stringify({
        ...body,
        elevation: false,
        extra_info: ["waycategory"],
        instructions: false,
      }),
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      method: "POST",
    });
  } catch (cause) {
    const message = navigator.onLine
      ? "Cannot reach the routing service. Wait a minute and try again."
      : "You are offline. Connect to the internet and try again.";
    // biome-ignore lint/style/useErrorCause: RouterError passes the cause to Error.
    throw new RouterError("network", message, { cause });
  }
}

async function statusError(response: Response): Promise<RouterError> {
  if (response.status === 401 || response.status === 403) {
    const text = await response.text();
    if (QUOTA_PATTERN.test(text)) {
      return new RouterError(
        "quota",
        "The daily routing quota is used up. Try again tomorrow, or add your own ORS key in settings."
      );
    }
    return new RouterError(
      "bad-key",
      "The ORS key is not valid. Check it in settings."
    );
  }
  if (response.status === 429) {
    return new RouterError(
      "quota",
      "The routing quota is used up. Wait a minute and try again, or add your own ORS key in settings."
    );
  }
  return new RouterError("no-route", "No walking route found from here.");
}

// biome-ignore lint/suspicious/noExplicitAny: the ORS response is untyped JSON.
function parseRoute(data: any): { coordinates: LngLat[]; lengthM: number } {
  const feature = data?.features?.[0];
  const coordinates: LngLat[] | undefined = feature?.geometry?.coordinates;
  const lengthM: number | undefined = feature?.properties?.summary?.distance;
  if (!coordinates || coordinates.length < 2 || lengthM === undefined) {
    throw new RouterError("no-route", "No walking route found from here.");
  }
  // Each value is [first point, last point, category bits] for one part of the route.
  const categories: [number, number, number][] =
    feature?.properties?.extras?.waycategory?.values ?? [];
  // biome-ignore lint/suspicious/noBitwiseOperators: ORS packs way categories into bit flags.
  if (categories.some(([, , bits]) => bits & WAY_CATEGORY_MOTOR_ROAD)) {
    throw new RouterError("no-route", "No walking route found from here.");
  }
  return { coordinates, lengthM };
}
