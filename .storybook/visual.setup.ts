// Loaded only by the `visual` Vitest project. preview.tsx calls the function after each story renders.
import { expect } from "vitest";
import { page } from "vitest/browser";

const style = document.createElement("style");
style.textContent =
  "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }";
document.head.append(style);

globalThis.__visualSnapshot = async (element: HTMLElement) => {
  await document.fonts.ready;
  // biome-ignore lint/suspicious/noMisplacedAssertion: preview.tsx calls this inside each story test.
  await expect.element(page.elementLocator(element)).toMatchScreenshot();
};
