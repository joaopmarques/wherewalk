import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const configDir = fileURLToPath(new URL("./.storybook", import.meta.url));

const browser = {
  enabled: true,
  headless: true,
  instances: [{ browser: "chromium" as const }],
  provider: playwright({
    contextOptions: { locale: "en-US", timezoneId: "UTC" },
  }),
  viewport: { height: 844, width: 390 },
};

export default defineConfig({
  resolve: { alias: { "@": src } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["src/**/*.test.ts"],
          name: "unit",
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir })],
        test: { browser, name: "storybook" },
      },
      {
        // Run it only in Docker: `pnpm test:visual`. Screenshots differ between operating systems.
        extends: true,
        plugins: [storybookTest({ configDir })],
        test: {
          browser: {
            ...browser,
            expect: {
              toMatchScreenshot: {
                comparatorName: "pixelmatch",
                comparatorOptions: { allowedMismatchedPixelRatio: 0 },
                // One folder for every baseline. Only Linux in Docker writes them.
                resolveScreenshotPath: ({ arg, ext, root, testFileName }) =>
                  `${root}/.storybook/__screenshots__/${testFileName}/${arg}${ext}`,
              },
            },
          },
          name: "visual",
          setupFiles: [".storybook/visual.setup.ts"],
        },
      },
    ],
  },
});
