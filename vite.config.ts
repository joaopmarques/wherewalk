import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Relative base so the static build works on any host path, such as GitHub Pages.
  base: "./",
  // MapLibre is most of the bundle, and it does not split well.
  build: { chunkSizeWarningLimit: 1500 },
  plugins: [
    react(),
    VitePWA({
      includeAssets: ["icon.svg"],
      manifest: {
        background_color: "#ffffff",
        description: "Plan a walk that starts and ends where you are.",
        display: "standalone",
        icons: [
          {
            purpose: "any maskable",
            sizes: "any",
            src: "icon.svg",
            type: "image/svg+xml",
          },
        ],
        name: "Where2Walk",
        orientation: "portrait",
        short_name: "Where2Walk",
        theme_color: "#17773f",
      },
      // A new version takes over as soon as it installs. main.tsx decides when the page reloads.
      registerType: "autoUpdate",
      workbox: {
        // Cache only the app shell. Map tiles and routes always come from the network.
        globPatterns: ["**/*.{js,css,html,svg}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  worker: { format: "es" },
});
