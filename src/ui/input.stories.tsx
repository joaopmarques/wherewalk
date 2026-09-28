import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  args: { "aria-label": "Pace", defaultValue: "5", variant: "field" },
  component: Input,
  parameters: { backdrop: "sign" },
  title: "UI/Input",
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Field: Story = {};

export const Placeholder: Story = {
  args: {
    defaultValue: undefined,
    placeholder: "Optional. The built-in key is in use.",
  },
};

export const Display: Story = {
  args: {
    "aria-label": "Target",
    defaultValue: "30",
    type: "number",
    variant: "display",
  },
};
