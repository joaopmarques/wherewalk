import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** A big icon beside a column of text. The Walk, Finished, and Resume Panels use it. */
export function IconHeader({
  children,
  icon: Icon,
  live = false,
}: {
  children: ReactNode;
  icon: LucideIcon;
  /** Announce changes to screen readers. */
  live?: boolean;
}) {
  return (
    <div className="walk-sign">
      <Icon
        aria-hidden="true"
        className="walk-icon"
        size={44}
        strokeWidth={2.25}
      />
      <div aria-live={live ? "polite" : undefined}>{children}</div>
    </div>
  );
}
