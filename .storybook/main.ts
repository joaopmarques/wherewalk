import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: "@storybook/react-vite",
  // Story-only assets, such as the basemap backdrop.
  staticDirs: ["./public"],
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  // The app's PWA plugin has no place in Storybook.
  viteFinal: (vite) => ({
    ...vite,
    plugins: vite.plugins?.flat().filter((p) => {
      const name = p && typeof p === "object" && "name" in p ? p.name : "";
      return !String(name).startsWith("vite-plugin-pwa");
    }),
  }),
};
export default config;
