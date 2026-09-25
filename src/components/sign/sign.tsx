import type { ReactNode } from "react";
import { useAnimatedHeight } from "@/hooks/use-animated-height";

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
    <section aria-label="Controls" className="control-box" ref={boxRef}>
      <div ref={contentRef}>
        <div className="sign-content" key={contentKey}>
          {children}
        </div>
      </div>
    </section>
  );
}
