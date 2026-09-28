import type { ComponentProps } from "react";
import { cn } from "./cn";
import { inputVariants } from "./input";

/** A native select, so phones show their own picker. It looks like a field Input. */
function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(inputVariants({ variant: "field" }), className)}
      data-slot="native-select"
      {...props}
    />
  );
}

function NativeSelectOption(props: ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />;
}

export { NativeSelect, NativeSelectOption };
