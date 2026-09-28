import { useEffect } from "react";

/**
 * Keeps the screen on while active. The browser releases the lock when the page is hidden,
 * so the hook asks for it again when the page becomes visible.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!(active && "wakeLock" in navigator)) {
      return;
    }
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release();
        } else {
          sentinel = lock;
        }
      } catch {
        // The browser can refuse, for example in low-power mode. The Walk still works.
      }
    };
    const onVisibility = () =>
      document.visibilityState === "visible" && acquire();

    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release();
    };
  }, [active]);
}
