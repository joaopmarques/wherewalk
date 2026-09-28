import type { ReactNode } from "react";

/** Puts its children side by side at equal widths. */
export function SignRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5 *:min-w-0 *:flex-1">{children}</div>;
}
