import type { ReactNode } from "react";

/** The top line of a Panel: a mark, a title or value, and an optional button. */
export function SignHeader({ children }: { children: ReactNode }) {
  return <div className="sign-header">{children}</div>;
}

/** `brand` is the app name. `title` names a Panel. */
export function SignTitle({
  children,
  size = "title",
}: {
  children: ReactNode;
  size?: "brand" | "title";
}) {
  return <h1 className={size}>{children}</h1>;
}
