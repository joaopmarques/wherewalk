import { Input } from "@/ui/input";

/** The big number input for the Target. */
export function TargetInput({
  label,
  onChange,
  unit,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  unit: string;
  value: string;
}) {
  return (
    <label className="flex items-baseline gap-2.5 border-card-foreground/50 border-b-3 pb-0.5 transition-colors duration-150 ease-[ease] focus-within:border-card-foreground motion-reduce:transition-none">
      <Input
        aria-label={label}
        inputMode="decimal"
        min="0"
        onChange={(e) => onChange(e.target.value)}
        step="any"
        type="number"
        value={value}
        variant="display"
      />
      <span className="font-bold text-xl">{unit}</span>
    </label>
  );
}
