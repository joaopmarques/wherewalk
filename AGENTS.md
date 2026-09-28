# Where2Walk — agent guide

This file is a router. Read it first, then read the doc for your area.
`CLAUDE.md` imports this file. Other agents read it directly.

## The writing rule

Write simply and tersely. Go straight to the point.
This covers comments, docs, commits, PR text, and UI copy. Details: [writing](.agents/docs/writing.md).

## What this is

A client-only PWA. It plans a walk that starts and ends where the Walker is.
React 19, Vite 8, TypeScript 7, Tailwind v4, Base UI, MapLibre. pnpm, Node 26.
Domain words (Walker, Route, Loop, Target, Candidate, Progress) are in [CONTEXT.md](CONTEXT.md). Use them.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server on :5173. |
| `pnpm check` / `pnpm fix` | Ultracite (Biome) lint and format. |
| `pnpm typecheck` | TypeScript. |
| `pnpm test` | Unit tests, plus every story as a browser test with axe. |
| `pnpm test:visual` | Screenshot tests in Docker. `:update` writes baselines. |
| `pnpm storybook` | Storybook on :6006. |
| `pnpm build` | Static site in `dist/`. |

Done means: `pnpm check`, `pnpm typecheck`, `pnpm test`, and `pnpm test:visual` all pass.

## Hard rules

1. No raw colors in code. Tokens live in `src/ui/tokens.css`. Lint enforces it.
2. Layers: `ui/` ← `components/sign/` ← `components/panels/`. Panels never import `ui/` and have no `className`. Lint enforces it.
3. `src/domain/` is plain TypeScript. No React, no UI.
4. Never update a visual baseline to hide a diff. A diff is a bug until you can say why it is right.
5. A new UI state gets a story.

## Where to read

| Working on | Read | Skill |
|---|---|---|
| App flow, phases, data, storage | [architecture](.agents/docs/architecture.md) | — |
| Tokens, components, styling | [design-system](.agents/docs/design-system.md) | `add-ui-primitive` |
| A new Panel state | [design-system](.agents/docs/design-system.md) | `add-panel-state` |
| Tests, stories, screenshots | [testing](.agents/docs/testing.md) | `update-baselines` |
| Route planning, ORS | [routing](.agents/docs/routing.md) | — |
| Deploys, env vars | [deploy](.agents/docs/deploy.md) | — |
| Why a decision was made | [docs/adr](docs/adr) | — |

Skills live in `.agents/skills/`. `.claude/skills` links to that folder.
