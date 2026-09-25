import type { CSSProperties } from "react";

export interface CandidateOption {
  color: string;
  label: string;
}

/** One Candidate Chip per Candidate. Each chip has its Candidate's color. */
export function CandidatePicker({
  onSelect,
  options,
  selected,
}: {
  onSelect: (index: number) => void;
  options: CandidateOption[];
  selected: number;
}) {
  return (
    <div aria-label="Routes" className="candidates" role="radiogroup">
      {options.map((o, i) => (
        <button
          aria-checked={i === selected}
          className={`candidate ${i === selected ? "is-active" : ""}`}
          // biome-ignore lint/suspicious/noArrayIndexKey: Candidates have no id, and their order is fixed.
          key={i}
          onClick={() => onSelect(i)}
          role="radio"
          style={{ "--candidate": o.color } as CSSProperties}
          type="button"
        >
          <span aria-hidden="true" className="dot" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A dot in the Selected Route's color. */
export function RouteSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="route-swatch"
      style={{ "--candidate": color } as CSSProperties}
    />
  );
}
