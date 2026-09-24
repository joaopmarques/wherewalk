import { afterEach, describe, expect, it, vi } from 'vitest'
import { AVOID_FEATURES, createOrsRouter } from './ors'

describe('ORS adapter', () => {
  afterEach(() => vi.unstubAllGlobals())

  /** Fakes ORS. `categoryBits` sets the way category of the one route part. */
  function captureRequests(categoryBits = 64) {
    const bodies: Record<string, unknown>[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        bodies.push(JSON.parse(String(init.body)))
        const feature = {
          geometry: { coordinates: [[0, 0], [0, 0.01]] },
          properties: { summary: { distance: 1000 }, extras: { waycategory: { values: [[0, 1, categoryBits]] } } },
        }
        return new Response(JSON.stringify({ features: [feature] }), { status: 200 })
      }),
    )
    return bodies
  }

  it('asks for Loops without ferries or fords', async () => {
    const bodies = captureRequests()
    await createOrsRouter('key').loop([4.48, 51.91], 3000, 7)
    expect(bodies[0].options).toEqual({
      round_trip: { length: 3000, points: 5, seed: 7 },
      avoid_features: AVOID_FEATURES,
    })
  })

  it('asks for Out-and-back paths without ferries or fords', async () => {
    const bodies = captureRequests()
    await createOrsRouter('key').path([4.48, 51.91], [4.5, 51.92])
    expect(bodies[0].options).toEqual({ avoid_features: AVOID_FEATURES })
  })

  it('asks ORS for the way category of each route part', async () => {
    const bodies = captureRequests()
    await createOrsRouter('key').loop([4.48, 51.91], 3000, 7)
    expect(bodies[0].extra_info).toEqual(['waycategory'])
  })

  it('drops a route that uses a motorway or trunk road', async () => {
    captureRequests(1 | 64)
    await expect(createOrsRouter('key').loop([4.48, 51.91], 3000, 7)).rejects.toMatchObject({ kind: 'no-route' })
    await expect(createOrsRouter('key').path([4.48, 51.91], [4.5, 51.92])).rejects.toMatchObject({ kind: 'no-route' })
  })

  it('keeps a route on paved streets', async () => {
    captureRequests(64)
    await expect(createOrsRouter('key').loop([4.48, 51.91], 3000, 7)).resolves.toMatchObject({ lengthM: 1000 })
  })
})
