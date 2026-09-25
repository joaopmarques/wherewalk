import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { COLORS, SETTINGS, walk } from "./fixtures";
import { WalkPanel } from "./walk-panel";

const meta = {
  args: {
    hasPosition: true,
    onEnd: fn(),
    settings: SETTINGS,
    units: "metric",
    walk: walk(),
  },
  component: WalkPanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Walk",
} satisfies Meta<typeof WalkPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const TimeTarget: Story = {};

export const StepsTarget: Story = {
  args: { walk: walk({ target: { kind: "steps", value: 3300 } }) },
};

export const DistanceTarget: Story = {
  args: {
    walk: walk({ color: COLORS[3], target: { kind: "distance", value: 2500 } }),
  },
};

export const Imperial: Story = {
  args: {
    units: "imperial",
    walk: walk({ target: { kind: "distance", value: 2500 } }),
  },
};

export const WaitingForLocation: Story = {
  args: { hasPosition: false },
};

export const AlmostBack: Story = {
  args: { walk: walk({ progressM: 2440 }) },
};

export const EndWalk: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "End walk" }));
    await expect(args.onEnd).toHaveBeenCalled();
  },
};
