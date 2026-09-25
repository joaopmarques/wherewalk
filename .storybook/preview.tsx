import type { Decorator, Preview } from "@storybook/react-vite";
import { FIXED_NOW } from "../src/components/panels/fixtures";
import { Sign } from "../src/components/sign/sign";
import "../src/ui/styles.css";

/**
 * `backdrop: "sign"` puts the story inside the Sign, on a phone screen with a still map behind it.
 * Other stories get a plain padded frame.
 */
const withBackdrop: Decorator = (Story, { id, parameters }) =>
  parameters.backdrop === "sign" ? (
    <div
      style={{
        background: "var(--background) url(basemap.jpg) center / cover",
        height: 844,
        position: "relative",
        width: 390,
      }}
    >
      <Sign contentKey={id}>
        <Story />
      </Sign>
    </div>
  ) : (
    <div style={{ padding: 16 }}>
      <Story />
    </div>
  );

const preview: Preview = {
  // In the `visual` Vitest project, screenshot each story while it is still on screen.
  afterEach: async ({ canvasElement }) => {
    await globalThis.__visualSnapshot?.(canvasElement);
  },
  // Stories render at one fixed moment, so clock times in the Walk Panel never change.
  beforeEach: () => {
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args: unknown[]) {
        super(...((args.length ? args : [FIXED_NOW]) as []));
      }
      static now() {
        return FIXED_NOW;
      }
    }
    globalThis.Date = FixedDate as DateConstructor;
    return () => {
      globalThis.Date = RealDate;
    };
  },
  decorators: [withBackdrop],
  initialGlobals: { viewport: { isRotated: false, value: "phone" } },
  parameters: {
    a11y: { test: "error" },
    layout: "fullscreen",
    // addon-vitest falls back to 1200x900 for an unknown viewport name, with no warning.
    viewport: {
      options: {
        phone: {
          name: "Phone",
          styles: { height: "844px", width: "390px" },
          type: "mobile",
        },
      },
    },
  },
};

export default preview;
