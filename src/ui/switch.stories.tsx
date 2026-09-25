import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Switch } from "./switch";

const meta = {
  args: { "aria-label": "Show all routes" },
  component: Switch,
  parameters: { backdrop: "sign" },
  title: "UI/Switch",
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Focused: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("switch")).toHaveFocus();
  },
};
