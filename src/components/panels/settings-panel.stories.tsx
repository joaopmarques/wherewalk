import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { SETTINGS } from "./fixtures";
import { SettingsPanel } from "./settings-panel";

const meta = {
  args: {
    hasBuiltInKey: true,
    onChange: fn(),
    onClose: fn(),
    settings: SETTINGS,
    units: "metric",
  },
  component: SettingsPanel,
  parameters: { backdrop: "sign" },
  title: "Panels/Settings",
} satisfies Meta<typeof SettingsPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Metric: Story = {};

export const Imperial: Story = {
  args: { settings: { ...SETTINGS, units: "imperial" }, units: "imperial" },
};

export const NoBuiltInKey: Story = {
  args: { hasBuiltInKey: false },
};

export const ChangeUnits: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.selectOptions(canvas.getByLabelText("Units"), "Miles");
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ units: "imperial" })
    );
  },
};

export const ResetPaceAndStride: Story = {
  args: { settings: { ...SETTINGS, paceKmh: 6.2, strideM: 0.81 } },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Reset pace and stride" })
    );
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ paceKmh: 5, strideM: 0.75 })
    );
  },
};
