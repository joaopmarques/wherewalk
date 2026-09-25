import { OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** A strip under the Sign content, like the plaques under a guide sign. */
export function Plaque({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "warning" | "error";
}) {
  const Icon = variant === "warning" ? TriangleAlert : OctagonAlert;
  return (
    <p
      className={`plaque plaque-${variant}`}
      role={variant === "error" ? "alert" : undefined}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}
