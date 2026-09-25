import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/ui/input";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";

function FieldLabel({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control comes in as children.
    <label className="flex flex-col gap-1.5">
      <span className="font-bold text-2xs uppercase tracking-wider">
        {label}
      </span>
      {children}
    </label>
  );
}

/** A labeled text or number input on the Settings Panel. */
export function Field({
  label,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <FieldLabel label={label}>
      <Input {...props} />
    </FieldLabel>
  );
}

/** A labeled native select. Phones show their own picker for it. */
export function SelectField<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  value: T;
}) {
  return (
    <FieldLabel label={label}>
      <NativeSelect
        onChange={(e) => onChange(e.target.value as T)}
        value={value}
      >
        {options.map((o) => (
          <NativeSelectOption key={o.value} value={o.value}>
            {o.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </FieldLabel>
  );
}
