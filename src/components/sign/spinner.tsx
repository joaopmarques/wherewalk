export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4.5 animate-spin rounded-full border-3 border-primary-foreground/25 border-t-primary-foreground motion-reduce:animate-none"
    />
  );
}
