import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import {
  CANDIDATES,
  CLOSEST,
  COLORS,
  ONE_CANDIDATE,
  OUT_AND_BACK,
  routesOf,
  SETTINGS,
} from "./fixtures";
import { ResultsPanel } from "./results-panel";

const meta = {
  args: {
    colors: COLORS,
    onBack: fn(),
    onReplan: fn(),
    onSelect: fn(),
    onSettings: fn(),
    onShowAll: fn(),
    onStart: fn(),
    result: CANDIDATES,
    routes: routesOf(CANDIDATES),
    selected: 0,
    settings: SETTINGS,
    showAll: false,
    targetM: 2500,
    units: "metric",
  },
  component: ResultsPanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Results",
} satisfies Meta<typeof ResultsPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Candidates: Story = {};

export const SecondSelected: Story = {
  args: { selected: 1 },
};

export const ShowAllRoutes: Story = {
  args: { showAll: true },
};

export const OneCandidate: Story = {
  args: { result: ONE_CANDIDATE, routes: routesOf(ONE_CANDIDATE) },
};

export const OutAndBack: Story = {
  args: { result: OUT_AND_BACK, routes: routesOf(OUT_AND_BACK) },
};

export const ClosestRoute: Story = {
  args: { result: CLOSEST, routes: routesOf(CLOSEST) },
};

export const SelectCandidate: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "2.4 km" }));
    await expect(args.onSelect).toHaveBeenCalledWith(1);
  },
};

export const StartWalk: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start walk" }));
    await expect(args.onStart).toHaveBeenCalled();
  },
};
