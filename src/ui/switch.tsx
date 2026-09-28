import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "./cn";

/** An on and off switch. Put it in a <label> with its text. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-6 w-10 flex-none rounded-full bg-shade/30 shadow-track",
        "transition-colors duration-160 ease-in-out data-checked:bg-primary",
        "focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-3",
        "motion-reduce:transition-none",
        className
      )}
      data-slot="switch"
      nativeButton
      render={<button type="button" />}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "absolute top-0.75 left-0.75 size-4.5 rounded-full bg-card-foreground shadow-thumb",
          "transition-transform duration-160 ease-move data-checked:translate-x-4",
          "motion-reduce:transition-none"
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
