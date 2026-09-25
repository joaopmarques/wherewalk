import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const inputVariants = cva("min-w-0 border-0 font-[inherit]", {
  defaultVariants: { variant: "field" },
  variants: {
    variant: {
      /** A huge number on the Sign itself, such as the Target. */
      display: [
        "flex-1 bg-transparent p-0 text-card-foreground caret-primary outline-none",
        "font-extrabold short:text-4xl text-6xl text-shadow-target tabular-nums leading-[1.05] tracking-tighter",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
        "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
      ],
      /** A white input on the Sign. */
      field: [
        "bg-(image:--gradient-input) min-h-11.5 rounded-lg px-3 text-secondary-foreground shadow-field",
        "font-semibold text-base text-shadow-none placeholder:text-placeholder",
      ],
    },
  },
});

function Input({
  className,
  variant,
  ...props
}: ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      className={cn(inputVariants({ className, variant }))}
      data-slot="input"
      {...props}
    />
  );
}

export { Input, inputVariants };
