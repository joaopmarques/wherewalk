import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plaque } from "./plaque";

const meta = {
  args: {
    children:
      "No loop found here. This route goes out and comes back on the same streets.",
    variant: "warning",
  },
  component: Plaque,
  parameters: { backdrop: "sign" },
  title: "Sign/Plaque",
} satisfies Meta<typeof Plaque>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Warning: Story = {};

export const ErrorPlaque: Story = {
  args: {
    children: "Cannot reach the routing service. Wait a minute and try again.",
    variant: "error",
  },
  name: "Error",
};
