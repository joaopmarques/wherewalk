import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

export interface SegmentedOption<T extends string> {
  icon: LucideIcon;
  label: string;
  value: T;
}

/** Three options with one sliding pill. */
export function Segmented<T extends string>({
  labelledBy,
  onChange,
  options,
  value,
}: {
  labelledBy: string;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  value: T;
}) {
  const index = options.findIndex((o) => o.value === value);
  return (
    <div aria-labelledby={labelledBy} className="segmented" role="radiogroup">
      <span
        aria-hidden="true"
        className="segmented-pill"
        style={{ "--index": index } as CSSProperties}
      />
      {options.map(({ icon: Icon, label, value: option }) => (
        <button
          aria-checked={option === value}
          className={option === value ? "is-active" : ""}
          key={option}
          onClick={() => onChange(option)}
          role="radio"
          type="button"
        >
          <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
          <span className="segmented-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
