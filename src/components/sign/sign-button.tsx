import type { ComponentProps } from "react";
import { Button } from "@/ui/button";

/**
 * A button on the Sign. `exit` is the yellow Exit Button, the main action of a Panel.
 * `icon` needs an `aria-label`.
 */
export function SignButton({
  type = "button",
  ...props
}: ComponentProps<typeof Button> & {
  variant: "exit" | "outline" | "link" | "icon";
}) {
  return <Button type={type} {...props} />;
}
