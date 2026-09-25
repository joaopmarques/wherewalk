---
name: add-panel-state
description: Add a new state or a new piece of content to a Panel (Setup, Results, Walk, Finished, Resume, Settings) with the right sign parts, a story, and a baseline. Use when a Panel must show something it does not show today.
---

# Add a Panel state

1. Name the state with [CONTEXT.md](../../../CONTEXT.md) words. Add a new domain term there first.
2. Model it as data in the Panel's props, not as a flag inside the Panel.
3. Build the look from parts in `src/components/sign/`. Missing a part? Add it there, with a story.
4. The Panel file has no `className`, no `style`, and no `@/ui` imports. Lint enforces it.
5. Add fixtures to `src/components/panels/fixtures.ts` if the state needs new data.
6. Add a story to the Panel's `.stories.tsx`. Add a `play` test for each new interaction.
7. Run `pnpm test`. Fix any axe violation.
8. Run `pnpm test:visual:update src/components/panels/<panel>.stories.tsx`.
9. Open the new screenshot. Check that it looks right.
10. Run `pnpm test:visual`. Every other baseline must still pass.
