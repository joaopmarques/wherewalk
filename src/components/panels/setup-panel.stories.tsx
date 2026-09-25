import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SetupPanel } from "./setup-panel";

const meta = {
  args: {
    error: null,
    kind: "time",
    onKind: fn(),
    onPlan: fn(),
    onSettings: fn(),
    onUseMyLocation: fn(),
    onValue: fn(),
    originStatus: "gps",
    planning: false,
    targetM: 2500,
    units: "metric",
    value: "30",
  },
  component: SetupPanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Setup",
} satisfies Meta<typeof SetupPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const FromMyLocation: Story = {};

export const Locating: Story = {
  args: { originStatus: "locating" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Plan route" })
    ).toBeDisabled();
  },
};

export const FromThePin: Story = {
  args: { originStatus: "pin" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Use my location" })
    );
    await expect(args.onUseMyLocation).toHaveBeenCalled();
  },
};

export const PinWithoutLocation: Story = {
  args: { originStatus: "pin-no-location" },
};

export const LocationOff: Story = {
  args: { originStatus: "no-location" },
};

export const Distance: Story = {
  args: { kind: "distance", value: "3" },
};

export const Steps: Story = {
  args: { kind: "steps", targetM: 3750, value: "5000" },
};

export const Imperial: Story = {
  args: { kind: "distance", units: "imperial", value: "2" },
};

export const NoTarget: Story = {
  args: { targetM: null, value: "" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Plan route" })
    ).toBeDisabled();
  },
};

export const Planning: Story = {
  args: { planning: true },
};

export const PlanningError: Story = {
  args: {
    error:
      "The daily routing quota is used up. Try again tomorrow, or add your own ORS key in settings.",
  },
};

export const PickTargetKind: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Steps" }));
    await expect(args.onKind).toHaveBeenCalledWith("steps");
  },
};

export const Plan: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Plan route" }));
    await expect(args.onPlan).toHaveBeenCalled();
  },
};
