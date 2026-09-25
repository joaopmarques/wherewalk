# Routing

[OpenRouteService](https://openrouteservice.org) (ORS) plans the walking routes. `src/routing/ors.ts` is the only file that talks to it.

## The adapter

- URL: `api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson`. The old `api.openrouteservice.org` is deprecated.
- A Loop uses `round_trip` with 5 points and a seed.
- It avoids ferries and fords.
- It drops any route that uses a motorway or trunk road (way category bit 1). The walking profile only penalizes those roads.
- Errors map to `RouterError` kinds: `no-key`, `bad-key`, `quota`, `no-route`, `network`. Every kind except `no-route` stops planning.

## The planner: `src/domain/planner.ts`

1. It asks for 5 Loops, one per seed.
2. ORS lengths miss, sometimes by 3x in sparse areas. So each missed attempt gets up to 2 correction rounds, with its length scaled by the miss.
3. It stops early when 3 Candidates fit. A fit is within ±10% of the Target.
4. With no Loop, it tries 5 Out-and-backs in spread directions.
5. With nothing that fits, it shows the Closest Route.

## Limits

- The free plan: about 2,000 requests a day and 40 a minute. All Walkers on the built-in key share them.
- One plan costs 5 requests in a dense grid, and up to 30 in a sparse area.
- ORS does not plan round trips over 100 km. The app refuses Targets over 100 km or under 200 m.

## Keys

`VITE_ORS_KEY` is the built-in key. It is public in the page source on purpose. A Walker's own key in settings overrides it.
If someone misuses it, make a new key in the ORS dashboard and redeploy.
