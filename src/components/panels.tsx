import {
  ArrowLeft,
  Check,
  Clock,
  Flag,
  Footprints,
  LocateFixed,
  OctagonAlert,
  Play,
  RefreshCw,
  Route as RouteIcon,
  Ruler,
  Settings,
  Square,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { PlanResult } from "../domain/planner";
import { metersToTargetUnit } from "../domain/target";
import type { Route, TargetKind, Units, WalkerSettings } from "../domain/types";
import type { ActiveWalk } from "../storage";
import {
  distanceUnit,
  formatDistance,
  formatDistanceNumber,
  formatMinutes,
  formatSteps,
} from "../units";
import { RouteShield } from "./RouteShield";

const KINDS: { kind: TargetKind; label: string; icon: LucideIcon }[] = [
  { kind: "time", label: "Time", icon: Clock },
  { kind: "distance", label: "Distance", icon: Ruler },
  { kind: "steps", label: "Steps", icon: Footprints },
];

export type OriginStatus =
  | "locating"
  | "gps"
  | "pin"
  | "pin-no-location"
  | "no-location";

const routeMinutes = (lengthM: number, settings: WalkerSettings) =>
  metersToTargetUnit(lengthM, "time", settings);

const clockTime = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

// ─── Shared sign parts ───────────────────────────────────────────────────────

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-button"
      onClick={onClick}
      aria-label="Settings"
    >
      <Settings size={20} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}

/** A big value with a smaller unit, like "0.5 miles" on a guide sign. */
function BigValue({ value, unit }: { value: string; unit: string }) {
  return (
    <p className="big-value">
      <span className="big-number">{value}</span>{" "}
      <span className="big-unit">{unit}</span>
    </p>
  );
}

/** A yellow warning plaque, like the ones under a guide sign. */
function WarningPlaque({ children }: { children: ReactNode }) {
  return (
    <p className="plaque plaque-warning">
      <TriangleAlert size={18} strokeWidth={2.5} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function ErrorPlaque({ children }: { children: ReactNode }) {
  return (
    <p className="plaque plaque-error" role="alert">
      <OctagonAlert size={18} strokeWidth={2.5} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// ─── Setup ───────────────────────────────────────────────────────────────────

interface SetupProps {
  kind: TargetKind;
  value: string;
  units: Units;
  targetM: number | null;
  originStatus: OriginStatus;
  planning: boolean;
  error: string | null;
  onKind: (kind: TargetKind) => void;
  onValue: (value: string) => void;
  onUseMyLocation: () => void;
  onPlan: () => void;
  onSettings: () => void;
}

export function SetupPanel(p: SetupProps) {
  const unitLabel = {
    time: "min",
    distance: distanceUnit(p.units),
    steps: "steps",
  }[p.kind];
  const originText = {
    locating: "Finding your location…",
    gps: "Starting from your location. Drag the pin to change it.",
    pin: "Starting from the pin.",
    "pin-no-location":
      "Starting from the pin. Drag it or tap the map to move it.",
    "no-location": "Location is off. Tap the map to set a start point.",
  }[p.originStatus];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        p.onPlan();
      }}
    >
      <div className="sign-header">
        <RouteShield />
        <h1 className="brand">Where2Walk</h1>
        <SettingsButton onClick={p.onSettings} />
      </div>

      <p className="caption" id="target-label">
        How much do you want to walk?
      </p>
      <div
        className="segmented"
        role="radiogroup"
        aria-labelledby="target-label"
      >
        <span
          className="segmented-pill"
          style={
            {
              "--index": KINDS.findIndex((k) => k.kind === p.kind),
            } as CSSProperties
          }
          aria-hidden="true"
        />
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={p.kind === kind}
            className={p.kind === kind ? "is-active" : ""}
            onClick={() => p.onKind(kind)}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            <span className="segmented-label">{label}</span>
          </button>
        ))}
      </div>

      <label className="target-input">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={p.value}
          onChange={(e) => p.onValue(e.target.value)}
          aria-label={`Target in ${unitLabel}`}
        />
        <span>{unitLabel}</span>
      </label>
      {p.kind !== "distance" && p.targetM !== null && (
        <p className="hint">About {formatDistance(p.targetM, p.units)}</p>
      )}

      <p className="hint origin-hint">
        {originText}
        {p.originStatus === "pin" && (
          <button type="button" className="link" onClick={p.onUseMyLocation}>
            <LocateFixed size={14} strokeWidth={2.5} aria-hidden="true" />
            Use my location
          </button>
        )}
      </p>

      {p.error && <ErrorPlaque>{p.error}</ErrorPlaque>}

      <button
        type="submit"
        className="btn-exit"
        disabled={
          p.planning ||
          p.targetM === null ||
          p.originStatus === "locating" ||
          p.originStatus === "no-location"
        }
      >
        {p.planning ? (
          <>
            <span className="spinner" aria-hidden="true" /> Finding routes…
          </>
        ) : (
          <>
            <RouteIcon size={20} strokeWidth={2.5} aria-hidden="true" /> Plan
            route
          </>
        )}
      </button>
    </form>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  result: PlanResult;
  routes: Route[];
  colors: string[];
  selected: number;
  showAll: boolean;
  targetM: number;
  units: Units;
  settings: WalkerSettings;
  onSelect: (index: number) => void;
  onShowAll: (showAll: boolean) => void;
  onStart: () => void;
  onReplan: () => void;
  onBack: () => void;
  onSettings: () => void;
}

export function ResultsPanel(p: ResultsProps) {
  const route = p.routes[p.selected];
  const shape = route.shape === "loop" ? "Loop" : "Out and back";
  return (
    <div>
      <div className="sign-header">
        <span
          className="route-swatch"
          style={{ "--candidate": p.colors[p.selected] } as CSSProperties}
          aria-hidden="true"
        />
        <BigValue
          value={formatDistanceNumber(route.lengthM, p.units)}
          unit={distanceUnit(p.units)}
        />
        <SettingsButton onClick={p.onSettings} />
      </div>
      <p className="caption">
        About {formatMinutes(routeMinutes(route.lengthM, p.settings))} · {shape}
      </p>

      {p.result.kind === "closest" ? (
        <WarningPlaque>
          No route within 10% of your Target (
          {formatDistance(p.targetM, p.units)}). This is the closest one found.
        </WarningPlaque>
      ) : route.shape === "out-and-back" ? (
        <WarningPlaque>
          No loop found here. This route goes out and comes back on the same
          streets.
        </WarningPlaque>
      ) : null}

      {p.routes.length > 1 && (
        <>
          <div className="candidates" role="radiogroup" aria-label="Routes">
            {p.routes.map((r, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i === p.selected}
                className={`candidate ${i === p.selected ? "is-active" : ""}`}
                style={{ "--candidate": p.colors[i] } as CSSProperties}
                onClick={() => p.onSelect(i)}
              >
                <span className="dot" aria-hidden="true" />
                {formatDistance(r.lengthM, p.units)}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={p.showAll}
              onChange={(e) => p.onShowAll(e.target.checked)}
            />
            <span className="toggle-track" aria-hidden="true" />
            Show all routes
          </label>
        </>
      )}

      <button type="button" className="btn-exit" onClick={p.onStart}>
        <Play
          size={18}
          strokeWidth={2.75}
          fill="currentColor"
          aria-hidden="true"
        />{" "}
        Start walk
      </button>
      <div className="row">
        <button type="button" className="btn-outline" onClick={p.onReplan}>
          <RefreshCw size={16} strokeWidth={2.5} aria-hidden="true" /> New
          routes
        </button>
        <button type="button" className="btn-outline" onClick={p.onBack}>
          <ArrowLeft size={16} strokeWidth={2.5} aria-hidden="true" /> Change
          target
        </button>
      </div>
    </div>
  );
}

// ─── Walk ────────────────────────────────────────────────────────────────────

/** Re-renders every 15 seconds, so elapsed time and return time stay current. */
function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** What is left, in the unit of the Target: steps, minutes, or distance. */
function leftInTargetUnit(
  walk: ActiveWalk,
  units: Units,
  settings: WalkerSettings
) {
  const leftM = Math.max(0, walk.route.lengthM - walk.progressM);
  switch (walk.target.kind) {
    case "steps":
      return {
        value: formatSteps(metersToTargetUnit(leftM, "steps", settings)),
        unit: "steps left",
      };
    case "time":
      return {
        value: String(Math.max(0, Math.round(routeMinutes(leftM, settings)))),
        unit: "min left",
      };
    case "distance":
      return {
        value: formatDistanceNumber(leftM, units),
        unit: `${distanceUnit(units)} left`,
      };
  }
}

interface WalkProps {
  walk: ActiveWalk;
  units: Units;
  settings: WalkerSettings;
  hasPosition: boolean;
  onEnd: () => void;
}

export function WalkPanel({
  walk,
  units,
  settings,
  hasPosition,
  onEnd,
}: WalkProps) {
  const now = useNow();
  const fraction = Math.min(1, walk.progressM / walk.route.lengthM);
  const { value, unit } = leftInTargetUnit(walk, units, settings);
  const leftMinutes = routeMinutes(
    Math.max(0, walk.route.lengthM - walk.progressM),
    settings
  );
  const done =
    walk.target.kind === "steps"
      ? `${formatSteps(metersToTargetUnit(walk.progressM, "steps", settings))} of ${formatSteps(metersToTargetUnit(walk.route.lengthM, "steps", settings))} steps`
      : `${formatDistanceNumber(walk.progressM, units)} of ${formatDistance(walk.route.lengthM, units)}`;

  return (
    <div>
      <div className="walk-sign">
        <Footprints
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <div aria-live="polite">
          <BigValue value={value} unit={unit} />
          <p className="caption">
            Back around {clockTime(new Date(now + leftMinutes * 60_000))}
          </p>
        </div>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label="Walk progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
        style={{ "--candidate": walk.color } as CSSProperties}
      >
        <div style={{ transform: `scaleX(${fraction})` }} />
      </div>
      <p className="hint">
        {done} · {formatMinutes((now - walk.startedAt) / 60_000)} walked
      </p>
      {!hasPosition && <p className="hint">Waiting for your location…</p>}
      <button type="button" className="btn-outline" onClick={onEnd}>
        <Square
          size={14}
          strokeWidth={3}
          fill="currentColor"
          aria-hidden="true"
        />{" "}
        End walk
      </button>
    </div>
  );
}

// ─── Finished and resume ─────────────────────────────────────────────────────

interface FinishedProps {
  walk: ActiveWalk;
  endedAt: number;
  units: Units;
  onDone: () => void;
}

export function FinishedPanel({ walk, endedAt, units, onDone }: FinishedProps) {
  return (
    <div>
      <div className="walk-sign">
        <Flag
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <div>
          <p className="caption">Walk finished</p>
          <BigValue
            value={formatDistanceNumber(walk.route.lengthM, units)}
            unit={distanceUnit(units)}
          />
          <p className="caption">
            In {formatMinutes((endedAt - walk.startedAt) / 60_000)}
          </p>
        </div>
      </div>
      <button type="button" className="btn-exit" onClick={onDone}>
        <Check size={20} strokeWidth={3} aria-hidden="true" /> Done
      </button>
    </div>
  );
}

interface ResumeProps {
  walk: ActiveWalk;
  units: Units;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumePanel({ walk, units, onResume, onDiscard }: ResumeProps) {
  return (
    <div>
      <div className="walk-sign">
        <Footprints
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <div>
          <h1 className="title">Resume your walk?</h1>
          <p className="caption">
            {formatDistanceNumber(walk.progressM, units)} of{" "}
            {formatDistance(walk.route.lengthM, units)} done
          </p>
        </div>
      </div>
      <button type="button" className="btn-exit" onClick={onResume}>
        <Play
          size={18}
          strokeWidth={2.75}
          fill="currentColor"
          aria-hidden="true"
        />{" "}
        Resume walk
      </button>
      <button type="button" className="btn-outline" onClick={onDiscard}>
        Discard
      </button>
    </div>
  );
}
