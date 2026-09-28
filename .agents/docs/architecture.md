# Architecture

No server, no accounts. Everything runs in the browser.

## Folders

| Folder | Holds | May import |
|---|---|---|
| `src/domain/` | Planning, Progress, Target maths. Pure functions. | nothing from the UI |
| `src/routing/` | The ORS adapter for the planner's `Router` interface. | `domain/` |
| `src/hooks/` | Browser APIs: GPS, wake lock, animated height. | — |
| `src/storage.ts` | Settings and the active Walk in `localStorage`. | `domain/` |
| `src/ui/` | Tokens and generic primitives. | nothing from the app |
| `src/components/sign/` | The sign parts. | `ui/`, `hooks/` |
| `src/components/panels/` | One file per Panel. | `sign/`, `domain/`, `storage`, `units` |
| `src/components/map/` | MapLibre view and markers. | `ui/` |
| `src/app.tsx` | State and wiring. | everything |

`biome.json` enforces these rules.

## Phases

`app.tsx` holds one `Phase`. Each phase shows one Panel in the Sign.

```
setup ──plan──▶ results ──start──▶ walking ──back at Origin──▶ finished ──done──▶ setup
  ▲                │                  │
  └──change target─┘                  └──end──▶ setup
resume (a saved Walk on load) ──resume──▶ walking
```

Settings is an overlay on any phase.

## Data flow

1. The Walker sets a Target. `targetToMeters` turns it into a distance.
2. `planRoutes` asks the `Router` for Loops, then Out-and-backs. It returns Candidates or a Closest Route.
3. Starting a Walk saves an `ActiveWalk` to storage.
4. Each GPS position runs `matchProgress`. Progress never goes back.
5. `isFinished` ends the Walk near the Origin, after the halfway point.

## Storage

Keys: `wherewalk.settings`, `wherewalk.walk`. An `ActiveWalk` stores its color as a resolved value, such as `#2563eb`.
Keep old saved shapes loadable. A Walker can have a Walk saved from an older version.
