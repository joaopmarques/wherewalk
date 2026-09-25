import type { ReactNode } from "react";
import { cn } from "@/ui/cn";

/** The top line of a Panel: a mark, a title or value, and an optional icon button at the end. */
export function SignHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 *:data-[variant=icon]:ml-auto [&>svg]:flex-none">
      {children}
    </div>
  );
}

/** `brand` is the app name. `title` names a Panel. */
export function SignTitle({
  children,
  size = "title",
}: {
  children: ReactNode;
  size?: "brand" | "title";
}) {
  return (
    <h1
      className={cn(
        "m-0 flex-1 font-extrabold leading-[1.1] tracking-tight",
        size === "brand" ? "short:text-2xl text-3xl" : "text-xl"
      )}
    >
      {children}
    </h1>
  );
}
