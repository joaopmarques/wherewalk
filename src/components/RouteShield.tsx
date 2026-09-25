import { useId } from "react";

// The shield outline, and the same outline inset by about 2 units for the colored body.
const OUTER =
  "M3 5C9 2 15 2 20 5C25 2 31 2 37 5C39 14 39 22 35 30C31 37 26 40 20 43C14 40 9 37 5 30C1 22 1 14 3 5Z";
const INNER =
  "M5.2 6.8C10 4.6 15 4.6 20 7.3C25 4.6 30 4.6 34.8 6.8C36.5 14.5 36.4 21.5 33 28.8C29.5 35 25.2 37.8 20 40.6C14.8 37.8 10.5 35 7 28.8C3.6 21.5 3.5 14.5 5.2 6.8Z";

/** An Interstate-style route shield. It is the Where2Walk mark. */
export function RouteShield({
  label = "2",
  size = 36,
}: {
  label?: string;
  size?: number;
}) {
  const clipId = useId();
  return (
    <svg
      className="shield"
      viewBox="0 0 40 44"
      width={size}
      height={size * 1.1}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={INNER} />
        </clipPath>
      </defs>
      <path d={OUTER} fill="#fff" stroke="rgba(0,0,0,0.55)" strokeWidth="1" />
      <g clipPath={`url(#${clipId})`}>
        <rect width="40" height="44" fill="#1d4f9f" />
        <rect width="40" height="14" fill="#c62032" />
        <rect y="14" width="40" height="1.8" fill="#fff" />
      </g>
      <text
        x="20"
        y="35.5"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        fill="#fff"
        fontFamily="Overpass, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
