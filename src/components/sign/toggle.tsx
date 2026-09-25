import type { ReactNode } from "react";

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
    <label className="toggle">
      <input
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" className="toggle-track" />
      {children}
    </label>
  );
}
