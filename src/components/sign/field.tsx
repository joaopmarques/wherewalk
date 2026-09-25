import type { InputHTMLAttributes } from "react";

/** A labeled text or number input on the Settings Panel. */
export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
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
    <label className="field">
      <span>{label}</span>
      <select onChange={(e) => onChange(e.target.value as T)} value={value}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
