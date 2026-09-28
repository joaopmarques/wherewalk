import type { Meta, StoryObj } from "@storybook/react-vite";
import { Settings } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "./button";

const meta = {
  args: { children: "Plan route", variant: "exit" },
  component: Button,
  parameters: { backdrop: "sign" },
  title: "UI/Button",
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Exit: Story = {};

export const ExitFocused: Story = {
  play: async ({ canvas }) => {
    canvas.getByRole("button").focus();
    await expect(canvas.getByRole("button")).toHaveFocus();
  },
};

export const ExitDisabled: Story = { args: { disabled: true } };

export const Outline: Story = {
  args: { children: "New routes", variant: "outline" },
};

export const OutlineFocused: Story = {
  args: { children: "New routes", variant: "outline" },
  play: async ({ canvas }) => {
    canvas.getByRole("button").focus();
    await expect(canvas.getByRole("button")).toHaveFocus();
  },
};

export const Icon: Story = {
  args: {
    "aria-label": "Settings",
    children: <Settings aria-hidden="true" size={20} strokeWidth={2.25} />,
    variant: "icon",
  },
};

export const Link: Story = {
  args: { children: "Use my location", variant: "link" },
};
