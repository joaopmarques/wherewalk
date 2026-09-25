import { registerSW } from "virtual:pwa-register";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadActiveWalk } from "./storage";
import "./ui/styles.css";

// A new version takes over as soon as it installs. Reload to show it, except during a Walk:
// then the new version shows the next time the app opens, so a reload never interrupts the Walk.
registerSW({
  immediate: true,
  onNeedReload: () => {
    if (!loadActiveWalk()) {
      window.location.reload();
    }
  },
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("index.html has no #root element.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
