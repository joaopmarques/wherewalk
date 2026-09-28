import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, SelectField } from "./field";
import { SignRow } from "./row";

function Demo() {
  return (
    <>
      <SelectField
        label="Units"
        onChange={() => undefined}
        options={[
          { label: "Automatic", value: "auto" },
          { label: "Miles", value: "imperial" },
        ]}
        value="auto"
      />
      <SignRow>
        <Field defaultValue="5" label="Pace (km/h)" type="number" />
        <Field defaultValue="75" label="Stride (cm)" type="number" />
      </SignRow>
      <Field
        label="Your OpenRouteService key"
        placeholder="Optional. The built-in key is in use."
        type="password"
      />
    </>
  );
}

const meta = {
  component: Demo,
  parameters: { backdrop: "sign" },
  title: "Sign/Field",
} satisfies Meta<typeof Demo>;
export default meta;

export const Fields: StoryObj<typeof meta> = {};
