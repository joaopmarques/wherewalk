import { cva } from "class-variance-authority";
import { OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const plaque = cva(
  [
    "m-0 flex items-start gap-2.5 rounded-lg px-3.5 py-3 shadow-raised",
    "font-semibold text-sm leading-[1.4] outline-2 -outline-offset-5",
    "[&_svg]:mt-px [&_svg]:flex-none",
  ],
  {
    variants: {
      variant: {
        error:
          "bg-(image:--gradient-destructive) text-destructive-foreground outline-destructive-foreground",
        warning:
          "bg-(image:--gradient-warning) text-shadow-none text-warning-foreground outline-warning-foreground",
      },
    },
  }
);

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
      className={plaque({ variant })}
      role={variant === "error" ? "alert" : undefined}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}
