import type { ReactNode } from "react";

/** Small capitals, like "EXIT ONTO US-101 N". */
export function Caption({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p className="caption" id={id}>
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
    <p className={action === undefined ? "hint" : "hint origin-hint"}>
      {children}
      {action}
    </p>
  );
}
