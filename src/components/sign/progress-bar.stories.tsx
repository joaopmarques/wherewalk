import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./progress-bar";

const meta = {
  args: { color: "var(--route-1)", fraction: 0.45 },
  component: ProgressBar,
  parameters: { backdrop: "sign" },
  title: "Sign/Progress Bar",
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Start: Story = { args: { fraction: 0 } };

export const Halfway: Story = {};

export const Done: Story = { args: { color: "var(--route-4)", fraction: 1 } };
