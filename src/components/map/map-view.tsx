import { LocateFixed } from "lucide-react";
import {
  AttributionControl,
  type GeoJSONSource,
  LngLatBounds,
  MapLibreMap,
  type MapMouseEvent,
  Marker,
  type PaddingOptions,
  setWorkerUrl,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";
import type { LngLat } from "@/domain/types";
import { cn } from "@/ui/cn";
import { readToken } from "@/ui/read-token";

// MapLibre finds its worker next to its own file, but the bundler moves that file.
// Vite bundles the worker separately and gives its URL here.
setWorkerUrl(workerUrl);

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export interface MapRoute {
  /** Direction arrows help on a Loop. On an Out-and-back they overlap, so they stay off. */
  arrows: boolean;
  color: string;
  coordinates: LngLat[];
}

interface Props {
  /** Changes to this value fit the map to the routes. */
  fitKey: number;
  /** Keep the map centered on the Walker's position. */
  follow: boolean;
  heading: number | null;
  onMapClick?: (point: LngLat) => void;
  onOriginChange: (origin: LngLat) => void;
  origin: LngLat | null;
  originDraggable: boolean;
  position: LngLat | null;
  routes: MapRoute[];
  selectedIndex: number;
  showAll: boolean;
  /** The part of the Selected Route the Walker has already covered. */
  walked: LngLat[];
}

/** Space the floating control box covers, so the map keeps routes out from under it. */
function controlPadding(): PaddingOptions {
  return window.innerWidth < 720
    ? {
        bottom: Math.min(360, window.innerHeight * 0.45),
        left: 32,
        right: 32,
        top: 48,
      }
    : { bottom: 64, left: 420, right: 64, top: 64 };
}

const lineFeature = (
  coordinates: LngLat[],
  properties: Record<string, unknown> = {}
) => ({
  geometry: { coordinates, type: "LineString" as const },
  properties,
  type: "Feature" as const,
});

/** A small chevron that points along the line, to show which way to walk. */
function arrowImage() {
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // A dark outline keeps the white chevron visible on both the white casing and the route color.
  for (const [color, width] of [
    [readToken("route-shadow"), 12],
    [readToken("route-casing"), 6],
  ] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(18, 13);
    ctx.lineTo(29, 24);
    ctx.lineTo(18, 35);
    ctx.stroke();
  }
  const { data } = ctx.getImageData(0, 0, size, size);
  return { data: new Uint8Array(data.buffer), height: size, width: size };
}

export function MapView(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const originMarker = useRef<Marker | null>(null);
  const positionMarker = useRef<Marker | null>(null);
  const positionArrow = useRef<HTMLDivElement | null>(null);
  const centeredOnOrigin = useRef(false);
  const callbacks = useRef(props);
  callbacks.current = props;
  const [loaded, setLoaded] = useState(false);
  const [userMoved, setUserMoved] = useState(false);

  // Create the map once.
  useEffect(() => {
    const m = new MapLibreMap({
      attributionControl: false,
      center: [0, 20],
      container: container.current!,
      style: STYLE_URL,
      zoom: 1.5,
    });
    // The control box covers the bottom of the screen on phones, so the map credits go top-right.
    m.addControl(new AttributionControl({ compact: true }), "top-right");
    map.current = m;

    m.on("load", () => {
      m.addImage("route-arrow", arrowImage(), { pixelRatio: 2 });
      m.addSource("routes", {
        data: { features: [], type: "FeatureCollection" },
        type: "geojson",
      });
      m.addSource("walked", {
        data: { features: [], type: "FeatureCollection" },
        type: "geojson",
      });
      const lineLayout = { "line-cap": "round", "line-join": "round" } as const;
      m.addLayer({
        filter: ["==", ["get", "selected"], false],
        id: "routes-others",
        layout: { ...lineLayout, visibility: "none" },
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": 0.6,
          "line-width": 4,
        },
        source: "routes",
        type: "line",
      });
      m.addLayer({
        filter: ["==", ["get", "selected"], true],
        id: "route-casing",
        layout: lineLayout,
        paint: { "line-color": readToken("route-casing"), "line-width": 10 },
        source: "routes",
        type: "line",
      });
      m.addLayer({
        filter: ["==", ["get", "selected"], true],
        id: "route-selected",
        layout: lineLayout,
        paint: { "line-color": ["get", "color"], "line-width": 6 },
        source: "routes",
        type: "line",
      });
      m.addLayer({
        id: "route-walked",
        layout: lineLayout,
        paint: { "line-color": readToken("route-walked"), "line-width": 6 },
        source: "walked",
        type: "line",
      });
      m.addLayer({
        filter: [
          "all",
          ["==", ["get", "selected"], true],
          ["==", ["get", "arrows"], true],
        ],
        id: "route-arrows",
        layout: {
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-image": "route-arrow",
          "icon-rotation-alignment": "map",
          "symbol-placement": "line",
          "symbol-spacing": 110,
        },
        source: "routes",
        type: "symbol",
      });
      setLoaded(true);
    });

    m.on("click", (e: MapMouseEvent) =>
      callbacks.current.onMapClick?.([e.lngLat.lng, e.lngLat.lat])
    );
    // Only a drag by the Walker has an original input event. Camera animations do not.
    m.on("dragstart", (e: { originalEvent?: Event }) => {
      if (e.originalEvent) {
        setUserMoved(true);
      }
    });

    return () => {
      m.remove();
      // Markers belong to the removed map. A new map must create its own.
      map.current = null;
      originMarker.current = null;
      positionMarker.current = null;
      centeredOnOrigin.current = false;
      setLoaded(false);
    };
  }, []);

  // Origin marker.
  useEffect(() => {
    const m = map.current;
    if (!(m && props.origin)) {
      return;
    }
    if (!originMarker.current) {
      const el = document.createElement("div");
      el.className =
        "grid h-9 w-7 items-start justify-items-center [&.is-draggable]:cursor-grab";
      el.setAttribute("aria-label", "Origin");
      // MapLibre positions the marker with a transform, so the pin shape goes on an inner element.
      el.appendChild(document.createElement("div")).className = cn(
        "size-7 -rotate-45 rounded-[50%_50%_50%_0] border-3 border-card-foreground",
        "bg-(image:--gradient-card-diagonal) shadow-marker"
      );
      originMarker.current = new Marker({ anchor: "bottom", element: el })
        .setLngLat(props.origin)
        .addTo(m);
      originMarker.current.on("dragend", () => {
        const { lng, lat } = originMarker.current!.getLngLat();
        callbacks.current.onOriginChange([lng, lat]);
      });
    }
    originMarker.current.setLngLat(props.origin);
    originMarker.current.setDraggable(props.originDraggable);
    originMarker.current
      .getElement()
      .classList.toggle("is-draggable", props.originDraggable);
    if (!centeredOnOrigin.current) {
      centeredOnOrigin.current = true;
      m.jumpTo({ center: props.origin, zoom: 15 });
    }
  }, [props.origin, props.originDraggable]);

  // Routes.
  useEffect(() => {
    const m = map.current;
    if (!(m && loaded)) {
      return;
    }
    const features = props.routes.map((r, i) =>
      lineFeature(r.coordinates, {
        arrows: r.arrows,
        color: r.color,
        selected: i === props.selectedIndex,
      })
    );
    // Draw the Selected Route last, so it sits on top of the others.
    features.sort(
      (a, b) => Number(a.properties.selected) - Number(b.properties.selected)
    );
    (m.getSource("routes") as GeoJSONSource).setData({
      features,
      type: "FeatureCollection",
    });
    m.setLayoutProperty(
      "routes-others",
      "visibility",
      props.showAll ? "visible" : "none"
    );
  }, [loaded, props.routes, props.selectedIndex, props.showAll]);

  // Walked part of the Selected Route.
  useEffect(() => {
    const m = map.current;
    if (!(m && loaded)) {
      return;
    }
    const features =
      props.walked.length >= 2 ? [lineFeature(props.walked)] : [];
    (m.getSource("walked") as GeoJSONSource).setData({
      features,
      type: "FeatureCollection",
    });
  }, [loaded, props.walked]);

  // Fit the map to the routes when a new plan arrives.
  useEffect(() => {
    const m = map.current;
    if (!m || props.fitKey === 0 || props.routes.length === 0) {
      return;
    }
    const bounds = new LngLatBounds();
    for (const r of props.routes) {
      for (const c of r.coordinates) {
        bounds.extend(c);
      }
    }
    m.fitBounds(bounds, {
      duration: 600,
      maxZoom: 17,
      padding: controlPadding(),
    });
    // Only a new plan refits, not a change of the Selected Route.
  }, [props.fitKey]);

  // Walker position marker with a heading arrow.
  useEffect(() => {
    const m = map.current;
    if (!(m && props.position)) {
      return;
    }
    if (!positionMarker.current) {
      const el = document.createElement("div");
      el.className =
        "relative size-5 rounded-full border-3 border-card-foreground bg-position shadow-position";
      const arrow = document.createElement("div");
      arrow.className = cn(
        "absolute top-1/2 left-1/2 -mt-6.5 -ml-1.75 size-0 origin-[7px_26px]",
        "border-x-7 border-x-transparent border-b-12 border-b-position"
      );
      el.appendChild(arrow);
      positionArrow.current = arrow;
      positionMarker.current = new Marker({ element: el })
        .setLngLat(props.position)
        .addTo(m);
    }
    positionMarker.current.setLngLat(props.position);
    const arrow = positionArrow.current!;
    arrow.style.display = props.heading === null ? "none" : "block";
    if (props.heading !== null) {
      arrow.style.transform = `rotate(${props.heading}deg)`;
    }
  }, [props.position, props.heading]);

  // Follow the Walker during a Walk, until they move the map by hand.
  useEffect(() => {
    if (!props.follow) {
      setUserMoved(false);
    }
  }, [props.follow]);

  useEffect(() => {
    const m = map.current;
    if (!(m && props.follow) || userMoved || !props.position) {
      return;
    }
    m.easeTo({
      center: props.position,
      duration: 500,
      padding: controlPadding(),
    });
  }, [props.follow, userMoved, props.position]);

  return (
    <>
      <div className="absolute inset-0" ref={container} />
      {props.follow && userMoved && (
        <button
          // A small guide sign.
          className={cn(
            "absolute top-[calc(56px+env(safe-area-inset-top))] right-3 inline-flex min-h-11 items-center gap-1.75 rounded-full border-0 px-4.5",
            "bg-(image:--gradient-card) font-extrabold text-card-foreground text-shadow-recenter shadow-recenter",
            "outline-2 outline-card-foreground -outline-offset-5"
          )}
          onClick={() => setUserMoved(false)}
          type="button"
        >
          <LocateFixed aria-hidden="true" size={18} strokeWidth={2.5} />
          Recenter
        </button>
      )}
    </>
  );
}
