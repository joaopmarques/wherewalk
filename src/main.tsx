import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App";
import { loadActiveWalk } from "./storage";
import "./styles.css";

// A new version takes over as soon as it installs. Reload to show it, except during a Walk:
// then the new version shows the next time the app opens, so a reload never interrupts the Walk.
registerSW({
  immediate: true,
  onNeedReload: () => {
    if (!loadActiveWalk()) window.location.reload();
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
