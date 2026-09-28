# Base UI instead of Radix under shadcn

The `src/ui/` primitives use Base UI, not Radix, which is shadcn's default. Both give the ARIA patterns we need. We chose Base UI so this repo matches pixelmatters-website, and one set of patterns works in both. Changing it later means rewriting every primitive in `src/ui/`.
