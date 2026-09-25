import type { ReactNode } from "react";
import { Switch } from "@/ui/switch";

export function Toggle({
  checked,
  children,
  onChange,
}: {
  checked: boolean;
  children: ReactNode;
  onChange: (checked: boolean) => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Switch inside is the control.
    <label className="relative flex cursor-pointer items-center gap-2.5 self-start font-bold text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {children}
    </label>
  );
}
