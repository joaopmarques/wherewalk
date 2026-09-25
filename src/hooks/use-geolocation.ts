import { useEffect, useRef, useState } from "react";
import { bearingDeg, distanceM } from "../domain/geo";
import type { LngLat } from "../domain/types";

export interface GeoState {
  accuracyM: number | null;
  error: "denied" | "unavailable" | null;
  /** Direction of travel in degrees from north, or null before the Walker moves. */
  heading: number | null;
  position: LngLat | null;
}

/** Movement needed before Where2Walk computes a heading from two positions. */
const HEADING_MIN_MOVE_M = 8;

/**
 * Watches the device position. The watch restarts when the page becomes visible again,
 * because some browsers stop it while the screen is locked.
 */
export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    accuracyM: null,
    error: null,
    heading: null,
    position: null,
  });
  const anchor = useRef<LngLat | null>(null);
  const heading = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState((s) => ({ ...s, error: "unavailable" }));
      return;
    }
    let watchId: number | null = null;

    const onPosition = ({ coords }: GeolocationPosition) => {
      const position: LngLat = [coords.longitude, coords.latitude];
      if (
        coords.heading !== null &&
        Number.isFinite(coords.heading) &&
        (coords.speed ?? 0) > 0.5
      ) {
        heading.current = coords.heading;
        anchor.current = position;
      } else if (!anchor.current) {
        anchor.current = position;
      } else if (distanceM(anchor.current, position) >= HEADING_MIN_MOVE_M) {
        heading.current = bearingDeg(anchor.current, position);
        anchor.current = position;
      }
      setState({
        accuracyM: coords.accuracy,
        error: null,
        heading: heading.current,
        position,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState((s) => ({
        ...s,
        error:
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
      }));
    };

    const start = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20_000,
      });
    };

    const onVisibility = () =>
      document.visibilityState === "visible" && start();

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return state;
}
