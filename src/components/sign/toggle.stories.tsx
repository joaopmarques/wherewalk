import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { Toggle } from "./toggle";

function Demo({ initial }: { initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  return (
    <Toggle checked={checked} onChange={setChecked}>
      Show all routes
    </Toggle>
  );
}

const meta = {
  args: { initial: false },
  component: Demo,
  parameters: { backdrop: "sign" },
  title: "Sign/Toggle",
} satisfies Meta<typeof Demo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { initial: true } };

export const Switch: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Show all routes"));
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  },
};
