import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/ui/cn";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";

export interface SegmentedOption<T extends string> {
  icon: LucideIcon;
  label: string;
  value: T;
}

/** Three options with one sliding pill. Arrow keys move between them. */
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
    <RadioGroup
      aria-labelledby={labelledBy}
      className="relative grid grid-cols-3 gap-1 rounded-xl bg-shade/24 p-1 shadow-well"
      onValueChange={(next) => onChange(next as T)}
      value={value}
    >
      {/* One pill slides under the options. Each step is one pill width plus the 4px gap. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1 left-1 w-[calc((100%-16px)/3)] rounded-md",
          "bg-(image:--gradient-secondary) shadow-pill will-change-transform",
          "translate-x-[calc(var(--index)*(100%+4px))] transition-transform duration-200 ease-move",
          "motion-reduce:transition-none"
        )}
        style={{ "--index": index } as CSSProperties}
      />
      {options.map(({ icon: Icon, label, value: option }) => (
        <RadioGroupItem
          className={cn(
            "relative inline-flex min-h-10.5 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent",
            "font-bold text-card-foreground/86 text-md",
            // The label color changes with the pill, so both use the pill timing.
            "[transition:background-color_150ms_ease,color_200ms_var(--ease-move)] motion-reduce:transition-none",
            "data-checked:text-card-bottom data-checked:text-shadow-none",
            "hover:not-data-checked:bg-card-foreground/8 hover:not-data-checked:text-card-foreground"
          )}
          key={option}
          value={option}
        >
          <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
          {/*
           * Overpass has a deep descender area, so its capitals sit about 2px above the middle of
           * the line box. Trim the box to the capitals where the browser supports it, else shift down.
           */}
          <span className="relative top-[0.12em] supports-[text-box:trim-both_cap_alphabetic]:top-0 supports-[text-box:trim-both_cap_alphabetic]:[text-box:trim-both_cap_alphabetic]">
            {label}
          </span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
