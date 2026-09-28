import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Route, Settings } from "lucide-react";
import { expect, fn } from "storybook/test";
import { SignButton } from "./sign-button";
import { Spinner } from "./spinner";

const meta = {
  args: { onClick: fn(), variant: "exit" },
  component: SignButton,
  parameters: { backdrop: "sign" },
  title: "Sign/Sign Button",
} satisfies Meta<typeof SignButton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Exit: Story = {
  args: {
    children: (
      <>
        <Route aria-hidden="true" size={20} strokeWidth={2.5} /> Plan route
      </>
    ),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const ExitDisabled: Story = {
  args: { children: "Plan route", disabled: true },
};

export const ExitBusy: Story = {
  args: {
    children: (
      <>
        <Spinner /> Finding routes…
      </>
    ),
    disabled: true,
  },
};

export const Outline: Story = {
  args: {
    children: (
      <>
        <Check aria-hidden="true" size={16} strokeWidth={2.5} /> New routes
      </>
    ),
    variant: "outline",
  },
};

export const Link: Story = {
  args: { children: "Reset pace and stride", variant: "link" },
};

export const Icon: Story = {
  args: {
    "aria-label": "Settings",
    children: <Settings aria-hidden="true" size={20} strokeWidth={2.25} />,
    variant: "icon",
  },
};
