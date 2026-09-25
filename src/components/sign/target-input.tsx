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
    <label className="target-input">
      <input
        aria-label={label}
        inputMode="decimal"
        min="0"
        onChange={(e) => onChange(e.target.value)}
        step="any"
        type="number"
        value={value}
      />
      <span>{unit}</span>
    </label>
  );
}
