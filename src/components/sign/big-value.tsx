/** A big value with a smaller unit, like "0.5 miles". */
export function BigValue({ unit, value }: { unit: string; value: string }) {
  return (
    <p className="m-0 flex flex-1 flex-wrap items-baseline gap-1.5">
      <span className="font-extrabold text-5xl tabular-nums leading-[0.95] tracking-tighter">
        {value}
      </span>{" "}
      <span className="font-bold text-xl">{unit}</span>
    </p>
  );
}
