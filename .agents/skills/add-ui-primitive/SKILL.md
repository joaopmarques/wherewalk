---
name: add-ui-primitive
description: Add a generic UI primitive to src/ui from the shadcn registry, on Base UI, restyled to the sign look. Use when a sign part needs a control that src/ui does not have yet, such as a dialog, slider, or tooltip.
---

# Add a UI primitive

1. Check `src/ui/` first. Extend a primitive before you add one.
2. Run `pnpm exec shadcn add <name>`. `components.json` puts it in `src/ui/`, on Base UI.
3. Change the `cn` import to `import { cn } from "./cn"`. Delete the `cn` package if the CLI added it.
4. Delete size and dark variants that nothing uses.
5. Replace the stock classes with semantic tokens: `bg-card`, `text-card-foreground`, `shadow-*`. No raw colors.
6. For a Base UI part that renders a button, pass `nativeButton` and `render={<button type="button" />}`.
7. Keep it generic. No domain words, no imports from `src/components`.
8. Add `src/ui/<name>.stories.tsx` with each variant and a focused state.
9. Use it from a sign part in `src/components/sign/`, not from a Panel.
10. Run `pnpm check`, `pnpm test`, and `pnpm test:visual:update src/ui`. Look at every new screenshot.
