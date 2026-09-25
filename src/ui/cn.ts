import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// In Tailwind v4, leading-* wins over the line height of text-*, in any order.
// So a text size must not remove a leading-* class. The class sorter often puts leading-* first.
const twMerge = extendTailwindMerge({
  override: { conflictingClassGroups: { "font-size": [] } },
});

/** Joins class names. A later Tailwind class wins over an earlier one of the same kind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
