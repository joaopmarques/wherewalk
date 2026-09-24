import type { Router } from '../domain/planner'
import type { LngLat } from '../domain/types'

// api.openrouteservice.org is deprecated and runs with a restricted quota. HeiGIT serves ORS here now.
const ORS_URL = 'https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson'
/** More points make the Loop rounder, with less walking on the same street twice. */
const LOOP_POINTS = 5

export type RouterErrorKind = 'no-key' | 'bad-key' | 'quota' | 'no-route' | 'network'

export class RouterError extends Error {
  /** Only a missing route is local to one request. Every other error affects all requests. */
  readonly stopsPlanning: boolean

  constructor(
    readonly kind: RouterErrorKind,
    message: string,
  ) {
    super(message)
    this.stopsPlanning = kind !== 'no-route'
  }
}

/** The built-in shared key. A Walker's own key in settings overrides it. */
export const BUILT_IN_ORS_KEY: string = import.meta.env.VITE_ORS_KEY ?? ''

/** Router adapter for the hosted OpenRouteService API. A self-hosted ORS takes a different URL. */
export function createOrsRouter(apiKey: string, url = ORS_URL): Router {
  const request = async (body: object) => {
    if (!apiKey) throw new RouterError('no-key', 'No ORS key. Add one in settings.')
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, instructions: false, elevation: false }),
      })
    } catch {
      if (!navigator.onLine) throw new RouterError('network', 'You are offline. Connect to the internet and try again.')
      throw new RouterError('network', 'Cannot reach the routing service. Wait a minute and try again.')
    }
    if (response.status === 401 || response.status === 403) {
      const body = await response.text()
      if (/quota/i.test(body)) {
        throw new RouterError('quota', 'The daily routing quota is used up. Try again tomorrow, or add your own ORS key in settings.')
      }
      throw new RouterError('bad-key', 'The ORS key is not valid. Check it in settings.')
    }
    if (response.status === 429) {
      throw new RouterError('quota', 'The routing quota is used up. Wait a minute and try again, or add your own ORS key in settings.')
    }
    if (!response.ok) throw new RouterError('no-route', 'No walking route found from here.')

    const data = await response.json()
    const feature = data?.features?.[0]
    const coordinates: LngLat[] | undefined = feature?.geometry?.coordinates
    const lengthM: number | undefined = feature?.properties?.summary?.distance
    if (!coordinates || coordinates.length < 2 || lengthM === undefined) {
      throw new RouterError('no-route', 'No walking route found from here.')
    }
    return { coordinates, lengthM }
  }

  return {
    loop: async (origin, lengthM, seed) => {
      const route = await request({
        coordinates: [origin],
        options: { round_trip: { length: Math.round(lengthM), points: LOOP_POINTS, seed } },
      })
      return { shape: 'loop', ...route }
    },
    // The far point of an Out-and-back can land in a park or a lake, so let it snap to any street.
    path: (from, to) => request({ coordinates: [from, to], radiuses: [1000, -1] }),
  }
}
