import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock, Footprints, Ruler } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";
import { Segmented, type SegmentedOption } from "./segmented";
import { Caption } from "./text";

const OPTIONS: SegmentedOption<string>[] = [
  { icon: Clock, label: "Time", value: "time" },
  { icon: Ruler, label: "Distance", value: "distance" },
  { icon: Footprints, label: "Steps", value: "steps" },
];

function Demo({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <Caption id="label">How much do you want to walk?</Caption>
      <Segmented
        labelledBy="label"
        onChange={setValue}
        options={OPTIONS}
        value={value}
      />
    </>
  );
}

const meta = {
  args: { initial: "time" },
  component: Demo,
  parameters: { backdrop: "sign" },
  title: "Sign/Segmented",
} satisfies Meta<typeof Demo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const First: Story = {};

export const Last: Story = { args: { initial: "steps" } };

export const Select: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Distance" }));
    await expect(canvas.getByRole("radio", { name: "Distance" })).toBeChecked();
  },
};
