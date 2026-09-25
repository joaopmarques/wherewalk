import type { Meta, StoryObj } from "@storybook/react-vite";
import { Footprints } from "lucide-react";
import { BigValue } from "./big-value";
import { RouteSwatch } from "./candidate-picker";
import { IconHeader } from "./icon-header";
import { Shield } from "./shield";
import { SignHeader, SignTitle } from "./sign-header";
import { TargetInput } from "./target-input";
import { Caption, Hint } from "./text";

function Demo() {
  return (
    <>
      <SignHeader>
        <Shield />
        <SignTitle size="brand">Where2Walk</SignTitle>
      </SignHeader>
      <SignTitle>Resume your walk?</SignTitle>
      <SignHeader>
        <RouteSwatch color="#e11d48" />
        <BigValue unit="km" value="2.4" />
      </SignHeader>
      <Caption>About 29 min · Loop</Caption>
      <TargetInput
        label="Target in min"
        onChange={() => undefined}
        unit="min"
        value="30"
      />
      <Hint>About 2.5 km</Hint>
      <Hint action={<a href="#top">Use my location</a>}>
        Starting from the pin.
      </Hint>
      <IconHeader icon={Footprints}>
        <BigValue unit="min left" value="17" />
        <Caption>Back around 5:17 PM</Caption>
      </IconHeader>
    </>
  );
}

const meta = {
  component: Demo,
  parameters: { backdrop: "sign" },
  title: "Sign/Text",
} satisfies Meta<typeof Demo>;
export default meta;

export const Text: StoryObj<typeof meta> = {};
