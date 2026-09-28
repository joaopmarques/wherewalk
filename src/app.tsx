import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type MapRoute, MapView } from "@/components/map/map-view";
import { FinishedPanel } from "@/components/panels/finished-panel";
import { ResultsPanel } from "@/components/panels/results-panel";
import { ResumePanel } from "@/components/panels/resume-panel";
import { SettingsPanel } from "@/components/panels/settings-panel";
import { type OriginStatus, SetupPanel } from "@/components/panels/setup-panel";
import { WalkPanel } from "@/components/panels/walk-panel";
import { Sign } from "@/components/sign/sign";
import { type PlanResult, planRoutes } from "@/domain/planner";
import {
  isFinished,
  matchProgress,
  measureRoute,
  sliceRoute,
} from "@/domain/progress";
import { targetToMeters } from "@/domain/target";
import type {
  LngLat,
  Route,
  Target,
  TargetKind,
  WalkerSettings,
} from "@/domain/types";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { BUILT_IN_ORS_KEY, createOrsRouter, RouterError } from "@/routing/ors";
import {
  type ActiveWalk,
  loadActiveWalk,
  loadSettings,
  saveActiveWalk,
  saveSettings,
} from "@/storage";
import { routeColors } from "@/ui/read-token";
import { metersPerUnit, resolveUnits } from "@/units";

/** ORS does not plan round trips longer than 100 km. */
const MAX_TARGET_M = 100_000;
const MIN_TARGET_M = 200;

type Phase =
  | { name: "setup"; planning: boolean }
  | {
      name: "results";
      target: Target;
      targetM: number;
      result: PlanResult;
      selected: number;
      showAll: boolean;
    }
  | { name: "walking"; walk: ActiveWalk }
  | { name: "finished"; walk: ActiveWalk; endedAt: number }
  | { name: "resume"; walk: ActiveWalk };

const resultRoutes = (result: PlanResult): Route[] =>
  result.kind === "candidates" ? result.candidates : [result.route];

const newSeed = () => Math.floor(Math.random() * 1000);

function originStatusOf(
  isPin: boolean,
  hasOrigin: boolean,
  hasPosition: boolean,
  hasError: boolean
): OriginStatus {
  if (isPin) {
    return hasPosition ? "pin" : "pin-no-location";
  }
  if (hasOrigin) {
    return "gps";
  }
  return hasError ? "no-location" : "locating";
}

export function App() {
  const geo = useGeolocation();
  // One color per Candidate. The Selected Route and its button share the color.
  const [candidateColors] = useState(routeColors);
  const [settings, setSettings] = useState<WalkerSettings>(loadSettings);
  const units = resolveUnits(settings.units);
  const [phase, setPhase] = useState<Phase>(() => {
    const walk = loadActiveWalk();
    return walk ? { name: "resume", walk } : { name: "setup", planning: false };
  });
  const [origin, setOrigin] = useState<LngLat | null>(
    () => loadActiveWalk()?.origin ?? null
  );
  const [originIsPin, setOriginIsPin] = useState(false);
  const [kind, setKind] = useState<TargetKind>("time");
  const [inputs, setInputs] = useState<Record<TargetKind, string>>(() => ({
    distance: units === "imperial" ? "2" : "3",
    steps: "5000",
    time: "30",
  }));
  const [error, setError] = useState<string | null>(null);
  // A saved Walk from an earlier visit starts with the map fitted to its Route.
  const [fitKey, setFitKey] = useState(() => (loadActiveWalk() ? 1 : 0));
  const [showSettings, setShowSettings] = useState(false);

  const updateSettings = (next: WalkerSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  // Until the Walker drags the pin, the Origin follows the GPS position during setup.
  useEffect(() => {
    if (phase.name === "setup" && !originIsPin && geo.position) {
      setOrigin(geo.position);
    }
  }, [phase.name, originIsPin, geo.position]);

  // ─── Target ──────────────────────────────────────────────────────────────
  const target: Target | null = useMemo(() => {
    const n = Number(inputs[kind]);
    if (!(n > 0)) {
      return null;
    }
    return { kind, value: kind === "distance" ? n * metersPerUnit(units) : n };
  }, [inputs, kind, units]);
  const targetM = target ? targetToMeters(target, settings) : null;

  // ─── Planning ────────────────────────────────────────────────────────────
  const plan = async (planTarget: Target) => {
    if (!origin) {
      return;
    }
    const planTargetM = targetToMeters(planTarget, settings);
    if (planTargetM > MAX_TARGET_M) {
      return setError("Targets above 100 km are not supported.");
    }
    if (planTargetM < MIN_TARGET_M) {
      return setError("The Target is too small. Try at least 200 m.");
    }
    setError(null);
    setPhase({ name: "setup", planning: true });
    try {
      const router = createOrsRouter(
        settings.orsKey.trim() || BUILT_IN_ORS_KEY
      );
      const result = await planRoutes(origin, planTargetM, router, newSeed());
      setPhase({
        name: "results",
        result,
        selected: 0,
        showAll: false,
        target: planTarget,
        targetM: planTargetM,
      });
      setFitKey((k) => k + 1);
    } catch (e) {
      setError(
        e instanceof RouterError
          ? e.message
          : "Something went wrong while planning. Try again."
      );
      setPhase({ name: "setup", planning: false });
    }
  };

  const changeOrigin = (next: LngLat) => {
    setOrigin(next);
    setOriginIsPin(true);
    // A moved Origin makes the planned Candidates wrong.
    if (phase.name === "results") {
      setPhase({ name: "setup", planning: false });
    }
  };

  const useMyLocation = () => {
    setOriginIsPin(false);
    if (geo.position) {
      setOrigin(geo.position);
    }
  };

  // ─── Walk ────────────────────────────────────────────────────────────────
  const walk =
    phase.name === "walking" ||
    phase.name === "finished" ||
    phase.name === "resume"
      ? phase.walk
      : null;
  // Progress updates make a new walk object, but the Route and color stay the same.
  const walkRoute = walk?.route ?? null;
  const walkColor = walk?.color ?? null;
  const walkProgressM = walk?.progressM ?? 0;
  const measured = useMemo(
    () => (walkRoute ? measureRoute(walkRoute.coordinates) : null),
    [walkRoute]
  );
  const walked = useMemo(
    () =>
      measured && phase.name !== "resume"
        ? sliceRoute(measured, walkProgressM)
        : [],
    [measured, walkProgressM, phase.name]
  );

  const startWalk = (route: Route, color: string, walkTarget: Target) => {
    if (!origin) {
      return;
    }
    const next: ActiveWalk = {
      color,
      origin,
      progressM: 0,
      route,
      startedAt: Date.now(),
      target: walkTarget,
    };
    saveActiveWalk(next);
    setPhase({ name: "walking", walk: next });
  };

  // Each new position moves Progress forward. After a screen lock, the first new position catches up.
  useEffect(() => {
    if (phase.name !== "walking" || !measured || !geo.position) {
      return;
    }
    const current = phase.walk;
    const progressM = matchProgress(measured, geo.position, current.progressM);
    const next =
      progressM === current.progressM ? current : { ...current, progressM };
    if (isFinished(measured, geo.position, next.progressM, next.origin)) {
      saveActiveWalk(null);
      setPhase({
        endedAt: Date.now(),
        name: "finished",
        walk: { ...next, progressM: measured.lengthM },
      });
    } else if (next !== current) {
      saveActiveWalk(next);
      setPhase({ name: "walking", walk: next });
    }
  }, [geo.position, measured, phase]);

  useWakeLock(phase.name === "walking");

  const endWalk = () => {
    // biome-ignore lint/suspicious/noAlert: a native confirm is the simplest safe stop for a Walk.
    if (!window.confirm("End this walk?")) {
      return;
    }
    saveActiveWalk(null);
    backToSetup();
  };

  const backToSetup = () => {
    setOriginIsPin(false);
    setPhase({ name: "setup", planning: false });
  };

  // ─── Map ─────────────────────────────────────────────────────────────────
  const planned = phase.name === "results" ? phase.result : null;
  const mapRoutes = useMemo<MapRoute[]>(() => {
    if (planned) {
      return resultRoutes(planned).map((r, i) => ({
        arrows: r.shape === "loop",
        color: candidateColors[i],
        coordinates: r.coordinates,
      }));
    }
    if (walkRoute && walkColor) {
      return [
        {
          arrows: walkRoute.shape === "loop",
          color: walkColor,
          coordinates: walkRoute.coordinates,
        },
      ];
    }
    return [];
  }, [planned, walkRoute, walkColor, candidateColors]);

  const originStatus = originStatusOf(
    originIsPin,
    origin !== null,
    geo.position !== null,
    geo.error !== null
  );

  const setupActive = phase.name === "setup" || phase.name === "results";

  // ─── Control box ─────────────────────────────────────────────────────────
  let panel: ReactNode;
  if (showSettings) {
    panel = (
      <SettingsPanel
        hasBuiltInKey={BUILT_IN_ORS_KEY !== ""}
        key={units}
        onChange={updateSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        units={units}
      />
    );
  } else if (phase.name === "setup") {
    panel = (
      <SetupPanel
        error={error}
        kind={kind}
        onKind={setKind}
        onPlan={() => target && plan(target)}
        onSettings={() => setShowSettings(true)}
        onUseMyLocation={useMyLocation}
        onValue={(value) => setInputs((prev) => ({ ...prev, [kind]: value }))}
        originStatus={originStatus}
        planning={phase.planning}
        targetM={targetM}
        units={units}
        value={inputs[kind]}
      />
    );
  } else if (phase.name === "results") {
    const routes = resultRoutes(phase.result);
    panel = (
      <ResultsPanel
        colors={candidateColors}
        onBack={() => setPhase({ name: "setup", planning: false })}
        onReplan={() => plan(phase.target)}
        onSelect={(selected) => setPhase({ ...phase, selected })}
        onSettings={() => setShowSettings(true)}
        onShowAll={(showAll) => setPhase({ ...phase, showAll })}
        onStart={() =>
          startWalk(
            routes[phase.selected],
            candidateColors[phase.selected],
            phase.target
          )
        }
        result={phase.result}
        routes={routes}
        selected={phase.selected}
        settings={settings}
        showAll={phase.showAll}
        targetM={phase.targetM}
        units={units}
      />
    );
  } else if (phase.name === "walking") {
    panel = (
      <WalkPanel
        hasPosition={geo.position !== null}
        onEnd={endWalk}
        settings={settings}
        units={units}
        walk={phase.walk}
      />
    );
  } else if (phase.name === "finished") {
    panel = (
      <FinishedPanel
        endedAt={phase.endedAt}
        onDone={backToSetup}
        units={units}
        walk={phase.walk}
      />
    );
  } else {
    panel = (
      <ResumePanel
        onDiscard={() => {
          saveActiveWalk(null);
          backToSetup();
        }}
        onResume={() => setPhase({ name: "walking", walk: phase.walk })}
        units={units}
        walk={phase.walk}
      />
    );
  }

  return (
    <div className="fixed inset-0">
      <MapView
        fitKey={fitKey}
        follow={phase.name === "walking"}
        heading={geo.heading}
        onMapClick={
          phase.name === "setup" && (geo.error || !origin)
            ? changeOrigin
            : undefined
        }
        onOriginChange={changeOrigin}
        origin={origin}
        originDraggable={setupActive}
        position={geo.position}
        routes={mapRoutes}
        selectedIndex={phase.name === "results" ? phase.selected : 0}
        showAll={phase.name === "results" && phase.showAll}
        walked={walked}
      />
      {/* A new key per screen replays the entrance animation when the sign changes. */}
      <Sign contentKey={showSettings ? "settings" : phase.name}>{panel}</Sign>
    </div>
  );
}
