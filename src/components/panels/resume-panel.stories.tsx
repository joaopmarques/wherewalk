import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { walk } from "./fixtures";
import { ResumePanel } from "./resume-panel";

const meta = {
  args: { onDiscard: fn(), onResume: fn(), units: "metric", walk: walk() },
  component: ResumePanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Resume",
} satisfies Meta<typeof ResumePanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Resume: Story = {};

export const ResumeWalk: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Resume walk" }));
    await expect(args.onResume).toHaveBeenCalled();
  },
};
