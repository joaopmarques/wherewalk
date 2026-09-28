import type { ReactNode } from "react";
import { useAnimatedHeight } from "@/hooks/use-animated-height";
import { cn } from "@/ui/cn";

/**
 * The green guide sign over the map. It holds one Panel at a time.
 * A new `contentKey` replays the entrance animation.
 */
export function Sign({
  children,
  contentKey,
}: {
  children: ReactNode;
  contentKey: string;
}) {
  const { boxRef, contentRef } = useAnimatedHeight<
    HTMLElement,
    HTMLDivElement
  >();
  return (
    <section
      aria-label="Controls"
      className={cn(
        "absolute inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))]",
        // Leave room for the map credits at the top. Content scrolls only on very short screens.
        "max-h-[calc(100dvh-72px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]",
        "overflow-y-auto overscroll-contain [scrollbar-color:var(--scrollbar)_transparent] [scrollbar-width:thin]",
        // The bottom padding keeps the last line clear of the white inner border.
        "rounded-2xl px-5.5 pt-5.5 short:pt-4.5 pb-6.5 short:pb-5.5",
        "bg-(image:--gradient-sign) text-card-foreground text-shadow-sign shadow-sign",
        // The white inner border. A negative offset draws it inside, and it follows the radius.
        "outline-[2.5px] outline-card-foreground/96 -outline-offset-8",
        // useAnimatedHeight sets the height and adds these classes. The sign and its content move as one.
        "[&.is-resizing]:overflow-y-hidden [&.is-sized]:transition-[height] [&.is-sized]:duration-220 [&.is-sized]:ease-move",
        "motion-reduce:[&.is-sized]:transition-none",
        "md:inset-auto md:top-5 md:left-5 md:max-h-[calc(100vh-40px)] md:w-93"
      )}
      ref={boxRef}
    >
      <div ref={contentRef}>
        <div
          className={cn(
            "flex animate-sign-in flex-col gap-3.5 motion-reduce:animate-none",
            // Zero specificity, so a part's own display, such as grid, still wins.
            "[:where(&>*)]:flex [:where(&>*)]:flex-col [:where(&>*)]:gap-3.5",
            "short:gap-2.75 short:[:where(&>*)]:gap-2.75"
          )}
          key={contentKey}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
