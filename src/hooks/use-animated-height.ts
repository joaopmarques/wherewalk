import { useLayoutEffect, useRef } from "react";

/**
 * Animates a box's height to fit its content. CSS cannot animate to `height: auto` in every
 * browser, so the hook measures the content and sets an explicit height. The CSS transition
 * on the box does the animation. The first height is set without animation.
 */
export function useAnimatedHeight<
  Box extends HTMLElement,
  Content extends HTMLElement,
>() {
  const boxRef = useRef<Box>(null);
  const contentRef = useRef<Content>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: refs are null until React attaches them.
    if (!(box && content)) {
      return;
    }
    let first = true;

    const fit = () => {
      const style = getComputedStyle(box);
      const height =
        content.offsetHeight +
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom);
      if (box.style.height === `${height}px`) {
        return;
      }
      if (first) {
        box.style.height = `${height}px`;
        // Enable the transition only after the first height is on screen.
        requestAnimationFrame(() => box.classList.add("is-sized"));
        first = false;
        return;
      }
      // Hide the scrollbar while the content is taller or shorter than the box.
      box.classList.add("is-resizing");
      box.style.height = `${height}px`;
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target === box && e.propertyName === "height") {
        box.classList.remove("is-resizing");
      }
    };

    const observer = new ResizeObserver(fit);
    observer.observe(content);
    window.addEventListener("resize", fit);
    box.addEventListener("transitionend", onTransitionEnd);
    box.addEventListener("transitioncancel", onTransitionEnd);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      box.removeEventListener("transitionend", onTransitionEnd);
      box.removeEventListener("transitioncancel", onTransitionEnd);
    };
  }, []);

  return { boxRef, contentRef };
}
