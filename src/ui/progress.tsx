import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { CSSProperties } from "react";
import { cn } from "./cn";

/**
 * A bar from 0 to 100. `color` fills it, for example "var(--route-1)".
 * The fill scales instead of changing width, so it animates on the compositor.
 * Screen readers get the value rounded to a whole percent. The fill uses the exact value.
 */
function Progress({
  className,
  color,
  value,
  ...props
}: ProgressPrimitive.Root.Props & { color: string; value: number }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "h-3.5 overflow-hidden rounded-full bg-shade/28 shadow-progress",
        className
      )}
      data-slot="progress"
      value={Math.round(value)}
      {...props}
    >
      <ProgressPrimitive.Track className="block h-full">
        <div
          className={cn(
            "bg-(image:--gradient-sheen) h-full origin-left bg-(--fill)",
            "transition-transform duration-300 ease-out-quart motion-reduce:transition-none"
          )}
          style={
            {
              "--fill": color,
              transform: `scaleX(${value / 100})`,
            } as CSSProperties
          }
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
