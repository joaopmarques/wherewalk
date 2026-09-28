import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

/**
 * A group of radios with arrow-key focus and one tab stop.
 * It has no look of its own. The sign parts that use it style it.
 */
function RadioGroup<Value>(props: RadioGroupPrimitive.Props<Value>) {
  return <RadioGroupPrimitive data-slot="radio-group" {...props} />;
}

/** One radio, drawn as a native button. Its children are its label. */
function RadioGroupItem<Value>(props: RadioPrimitive.Root.Props<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      nativeButton
      render={<button type="button" />}
      {...props}
    />
  );
}

export { RadioGroup, RadioGroupItem };
