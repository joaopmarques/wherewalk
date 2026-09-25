/** A big value with a smaller unit, like "0.5 miles". */
export function BigValue({ unit, value }: { unit: string; value: string }) {
  return (
    <p className="big-value">
      <span className="big-number">{value}</span>{" "}
      <span className="big-unit">{unit}</span>
    </p>
  );
}
