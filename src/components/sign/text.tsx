import type { ReactNode } from "react";
import { cn } from "@/ui/cn";

/** Small capitals, like "EXIT ONTO US-101 N". */
export function Caption({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p className="m-0 font-bold text-xs uppercase tracking-wider" id={id}>
      {children}
    </p>
  );
}

/** Secondary text. An `action`, such as a link button, wraps beside it. */
export function Hint({
  action,
  children,
}: {
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "m-0 text-card-foreground/86 text-sm leading-[1.4]",
        "[&_a]:font-bold [&_a]:text-card-foreground [&_a]:underline",
        action !== undefined && "flex flex-wrap items-center gap-x-2.5 gap-y-1"
      )}
    >
      {children}
      {action}
    </p>
  );
}
