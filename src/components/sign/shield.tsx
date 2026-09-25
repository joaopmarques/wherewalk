import { useId } from "react";

// The shield outline, and the same outline inset by about 2 units for the colored body.
const OUTER =
  "M3 5C9 2 15 2 20 5C25 2 31 2 37 5C39 14 39 22 35 30C31 37 26 40 20 43C14 40 9 37 5 30C1 22 1 14 3 5Z";
const INNER =
  "M5.2 6.8C10 4.6 15 4.6 20 7.3C25 4.6 30 4.6 34.8 6.8C36.5 14.5 36.4 21.5 33 28.8C29.5 35 25.2 37.8 20 40.6C14.8 37.8 10.5 35 7 28.8C3.6 21.5 3.5 14.5 5.2 6.8Z";

/** An Interstate-style route shield. It is the Where2Walk mark. */
export function Shield({
  label = "2",
  size = 36,
}: {
  label?: string;
  size?: number;
}) {
  const clipId = useId();
  return (
    <svg
      aria-hidden="true"
      className="flex-none drop-shadow-shield"
      height={size * 1.1}
      viewBox="0 0 40 44"
      width={size}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={INNER} />
        </clipPath>
      </defs>
      <path
        className="fill-card-foreground stroke-shade/55"
        d={OUTER}
        strokeWidth="1"
      />
      <g clipPath={`url(#${clipId})`}>
        <rect className="fill-shield-blue" height="44" width="40" />
        <rect className="fill-shield-red" height="14" width="40" />
        <rect className="fill-card-foreground" height="1.8" width="40" y="14" />
      </g>
      <text
        className="fill-card-foreground"
        fontFamily="Overpass, sans-serif"
        fontSize="19"
        fontWeight="800"
        textAnchor="middle"
        x="20"
        y="35.5"
      >
        {label}
      </text>
    </svg>
  );
}
