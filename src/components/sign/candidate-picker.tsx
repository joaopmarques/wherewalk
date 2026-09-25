import type { CSSProperties } from "react";
import { cn } from "@/ui/cn";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

export interface CandidateOption {
  /** A color token, such as "var(--route-1)", or a resolved color. */
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
    <RadioGroup
      aria-label="Routes"
      className="flex flex-wrap gap-2.5"
      onValueChange={(value) => onSelect(value as number)}
      value={selected}
    >
      {options.map((o, i) => (
        <RadioGroupItem
          className={cn(
            "inline-flex min-h-10 items-center gap-2 rounded-full border-0 px-3.5",
            "bg-(image:--gradient-secondary) text-secondary-foreground text-shadow-none shadow-raised",
            "font-bold text-sm tabular-nums",
            "[transition:box-shadow_150ms_ease,transform_150ms_var(--ease-out-quart)] motion-reduce:transition-none",
            "active:scale-97 data-checked:-translate-y-px data-checked:shadow-chip-active"
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: Candidates have no id, and their order is fixed.
          key={i}
          style={{ "--candidate": o.color } as CSSProperties}
          value={i}
        >
          <span
            aria-hidden="true"
            className="size-3 rounded-full bg-(--candidate) shadow-dot"
          />
          {o.label}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}

/** A dot in the Selected Route's color. */
export function RouteSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-4 flex-none self-center rounded-full bg-(--candidate) shadow-swatch"
      style={{ "--candidate": color } as CSSProperties}
    />
  );
}
