# Design system

The look is a North American guide sign. Keep it. A redesign is planned. Build so it touches only `src/ui/` and `src/components/sign/`.

## Tokens: `src/ui/tokens.css`

1. **Primitives**: raw values, such as `--green-500`. Only tier 2 reads them.
2. **Semantic roles**, with shadcn names: `--card` (the Sign), `--primary` (the Exit Button), `--secondary`, `--input`, `--warning`, `--destructive`, `--ring`, `--shade`. Gradients have their own stops, such as `--card-top` and `--card-bottom`, and `--gradient-*` tokens.
3. **Utilities**: the `@theme` block. Tailwind's default palette, type scale, radii, and breakpoints are off. Only tokens exist.

Colors in code:

- A class: `bg-card`, `text-primary-foreground`, `bg-shade/24`.
- A CSS variable: `var(--route-1)`, for example as a Candidate color.
- MapLibre cannot use CSS variables. Use `readToken("route-casing")` from `src/ui/read-token.ts`.

A raw color in a `.ts` or `.tsx` file fails lint.

## Names (provisional)

| Name | What |
|---|---|
| Sign | The green box over the map. |
| Panel | One screen's content in the Sign: Setup, Results, Walk, Finished, Resume, Settings. |
| Exit Button | The yellow main action. `SignButton variant="exit"`. |
| Plaque | A warning or error strip. |
| Shield | The route-number mark. |
| Candidate Chip | A pill that picks a Candidate. |

## Layers

- `src/ui/`: primitives from the shadcn CLI, on Base UI, restyled. Button, RadioGroup, Switch, Input, NativeSelect, Progress.
- `src/components/sign/`: sign parts made from primitives. They own the look.
- `src/components/panels/`: compose sign parts. No `className`, no `style`, no `ui/` imports.

A Panel needs something new? Add or extend a sign part. See `.agents/skills/add-panel-state`.

## Gotchas

- **Biome and `--*: initial`.** Biome moves the namespace resets in `@theme` to the end, and that deletes the theme. `src/ui/*.css` is excluded from Biome for this reason. Keep the resets first in their group.
- **tailwind-merge and `leading-*`.** Stock tailwind-merge drops `leading-*` when a text size follows it. `cn` turns that conflict off. Use `cn` from `src/ui/cn.ts`.
- **Sign children.** The Sign styles its direct children with `:where()`, so a part's own `grid` or `flex` still wins.
- **MapLibre CSS** is imported in a layer in `src/ui/styles.css`. Unlayered, it would beat utilities such as `absolute`.
- **Line height.** `html` uses `line-height: normal`, not Tailwind's 1.5. The Sign was drawn with it.
- **Base UI radios and switches** render native buttons (`nativeButton`). Arrow keys move the selection. Tests find them by role: `radio`, `switch`.

## Add a token

1. Add the raw value to tier 1, if it is new.
2. Add a semantic role in tier 2.
3. Map it in `@theme` if it needs a utility.
4. Add it to `src/ui/foundations.mdx`.
