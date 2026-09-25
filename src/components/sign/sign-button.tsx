import type { ButtonHTMLAttributes } from "react";

type Variant = "exit" | "outline" | "link" | "icon";

const CLASS: Record<Variant, string> = {
  exit: "btn-exit",
  icon: "icon-button",
  link: "link",
  outline: "btn-outline",
};

/**
 * `exit` is the yellow Exit Button, the main action of a Panel.
 * `icon` needs an `aria-label`.
 */
export function SignButton({
  type = "button",
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant: Variant }) {
  // biome-ignore lint/a11y/useButtonType: the type comes from props.
  return <button className={CLASS[variant]} type={type} {...props} />;
}
