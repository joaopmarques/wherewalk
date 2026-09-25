# Testing

| Layer | Where | Runs with |
|---|---|---|
| Unit | `src/**/*.test.ts` | `pnpm test` (Node) |
| Interaction | a story's `play` function | `pnpm test` (Chromium) |
| Accessibility | axe on every story | `pnpm test`. A violation fails. |
| Visual | a screenshot of every story | `pnpm test:visual` (Docker) |

Vitest has three projects: `unit`, `storybook`, and `visual`. See `vitest.config.ts`.

## Stories

- Every sign part and Panel state has a story. Stories for Panels use `parameters: { backdrop: "sign" }`. That puts the story in the Sign over a still map.
- Fixtures are in `src/components/panels/fixtures.ts`. Colors are `var(--route-n)`.
- The clock is fixed at `FIXED_NOW` in every story. Clock times never change.
- The live map has no stories. It needs WebGL and network tiles.

## Visual tests

Screenshots differ between macOS and Linux, so baselines come only from Docker: the `mcr.microsoft.com/playwright:v1.63.0-noble` image. CI uses the same image. Do not run the `visual` project directly on a Mac.

- Baselines: `.storybook/__screenshots__/`. Tolerance is zero.
- On a failure, the diffs are in `.vitest-attachments/`. CI uploads them.
- The test window is 1280x1000, so the 390x844 frame is not scaled. A scaled frame blurs and hides small diffs.

## When a screenshot fails

1. Open the diff. Find the cause.
2. An unplanned change is a bug. Fix the code.
3. A planned change: update only that story's baseline. Say why in the commit.

Never update baselines to make CI green. See `.agents/skills/update-baselines`.
