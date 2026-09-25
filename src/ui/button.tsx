import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const buttonVariants = cva("inline-flex items-center", {
  defaultVariants: { variant: "outline" },
  variants: {
    variant: {
      /** The yellow Exit Button, the main action. Disabled, it is an unlit panel. */
      exit: [
        "min-h-14 short:min-h-12.5 w-full justify-center gap-2.25 rounded-xl px-4.5",
        "bg-(image:--gradient-primary) text-primary-foreground text-shadow-exit",
        "font-extrabold text-lg uppercase tracking-wide",
        "shadow-exit outline-[2.5px] outline-primary-foreground outline-solid -outline-offset-6",
        "[transition:transform_100ms_var(--ease-out-quart),box-shadow_100ms_var(--ease-out-quart),filter_150ms_ease]",
        "hover:not-disabled:brightness-105 active:not-disabled:translate-y-0.5 active:not-disabled:shadow-exit-pressed",
        "focus-visible:shadow-exit-focus focus-visible:outline-[2.5px] focus-visible:outline-primary-foreground focus-visible:-outline-offset-6",
        "disabled:bg-card-foreground/10 disabled:bg-none disabled:text-card-foreground/70 disabled:text-shadow-none",
        "disabled:shadow-none disabled:outline-dashed disabled:outline-2 disabled:outline-card-foreground/55",
        "motion-reduce:transition-none",
      ],
      /** A round button for one icon. It needs an aria-label. */
      icon: [
        "size-10.5 flex-none justify-center rounded-full border-2 border-card-foreground/90 bg-shade/14",
        "[&_svg]:drop-shadow-icon",
        "[transition:background-color_150ms_ease,transform_100ms_var(--ease-out-quart)]",
        "hover:bg-card-foreground/14 active:scale-94 motion-reduce:transition-none",
      ],
      link: [
        "gap-1.25 self-start border-0 bg-transparent p-0",
        "font-bold text-sm underline underline-offset-3",
      ],
      outline: [
        "min-h-11.5 justify-center gap-2 rounded-xl border-2 border-card-foreground/90 bg-shade/14 px-3",
        "font-bold text-md",
        "[transition:background-color_150ms_ease,transform_100ms_var(--ease-out-quart)]",
        "hover:bg-card-foreground/14 active:scale-97 motion-reduce:transition-none",
      ],
    },
  },
});

function Button({
  className,
  variant,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ className, variant }))}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
}

export { Button, buttonVariants };
