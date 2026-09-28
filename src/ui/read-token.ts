/**
 * Reads a token's resolved value, such as "#2563eb" for "route-1".
 * MapLibre paints with plain color strings, so it cannot use a CSS variable.
 */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
}

/** The Candidate colors, in order. */
export const routeColors = () =>
  [1, 2, 3, 4, 5].map((n) => readToken(`route-${n}`));
