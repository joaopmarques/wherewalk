import type { CSSProperties } from "react";

/** Walk Progress as a bar in the Selected Route's color. */
export function ProgressBar({
  color,
  fraction,
}: {
  color: string;
  fraction: number;
}) {
  return (
    <div
      aria-label="Walk progress"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(fraction * 100)}
      className="progress-bar"
      role="progressbar"
      style={{ "--candidate": color } as CSSProperties}
    >
      <div style={{ transform: `scaleX(${fraction})` }} />
    </div>
  );
}
