import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FinishedPanel } from "./finished-panel";
import { FIXED_NOW, walk } from "./fixtures";

const meta = {
  args: {
    endedAt: FIXED_NOW + 17 * 60_000,
    onDone: fn(),
    units: "metric",
    walk: walk({ progressM: 2500 }),
  },
  component: FinishedPanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Finished",
} satisfies Meta<typeof FinishedPanel>;
export default meta;

export const Finished: StoryObj<typeof meta> = {};
