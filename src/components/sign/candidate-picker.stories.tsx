import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { CandidatePicker } from "./candidate-picker";

const OPTIONS = [
  { color: "#2563eb", label: "2.5 km" },
  { color: "#e11d48", label: "2.4 km" },
  { color: "#d97706", label: "2.6 km" },
  { color: "#7c3aed", label: "2.3 km" },
  { color: "#0d9488", label: "2.7 km" },
];

function Demo({ count }: { count: number }) {
  const [selected, setSelected] = useState(0);
  return (
    <CandidatePicker
      onSelect={setSelected}
      options={OPTIONS.slice(0, count)}
      selected={selected}
    />
  );
}

const meta = {
  args: { count: 3 },
  component: Demo,
  parameters: { backdrop: "sign" },
  title: "Sign/Candidate Picker",
} satisfies Meta<typeof Demo>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Three: Story = {};

export const Five: Story = { args: { count: 5 } };

export const Select: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "2.6 km" }));
    await expect(canvas.getByRole("radio", { name: "2.6 km" })).toBeChecked();
  },
};
