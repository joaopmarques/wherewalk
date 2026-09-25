import {
  ArrowLeft,
  Check,
  Clock,
  Flag,
  Footprints,
  LocateFixed,
  type LucideIcon,
  OctagonAlert,
  Play,
  RefreshCw,
  Route as RouteIcon,
  Ruler,
  Settings,
  Square,
  TriangleAlert,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
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
  { icon: Clock, kind: "time", label: "Time" },
  { icon: Ruler, kind: "distance", label: "Distance" },
  { icon: Footprints, kind: "steps", label: "Steps" },
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
      aria-label="Settings"
      className="icon-button"
      onClick={onClick}
      type="button"
    >
      <Settings aria-hidden="true" size={20} strokeWidth={2.25} />
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
      <TriangleAlert aria-hidden="true" size={18} strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}

function ErrorPlaque({ children }: { children: ReactNode }) {
  return (
    <p className="plaque plaque-error" role="alert">
      <OctagonAlert aria-hidden="true" size={18} strokeWidth={2.5} />
      <span>{children}</span>
    </p>
  );
}

// ─── Setup ───────────────────────────────────────────────────────────────────

interface SetupProps {
  error: string | null;
  kind: TargetKind;
  onKind: (kind: TargetKind) => void;
  onPlan: () => void;
  onSettings: () => void;
  onUseMyLocation: () => void;
  onValue: (value: string) => void;
  originStatus: OriginStatus;
  planning: boolean;
  targetM: number | null;
  units: Units;
  value: string;
}

export function SetupPanel(p: SetupProps) {
  const unitLabel = {
    distance: distanceUnit(p.units),
    steps: "steps",
    time: "min",
  }[p.kind];
  const originText = {
    gps: "Starting from your location. Drag the pin to change it.",
    locating: "Finding your location…",
    "no-location": "Location is off. Tap the map to set a start point.",
    pin: "Starting from the pin.",
    "pin-no-location":
      "Starting from the pin. Drag it or tap the map to move it.",
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
        aria-labelledby="target-label"
        className="segmented"
        role="radiogroup"
      >
        <span
          aria-hidden="true"
          className="segmented-pill"
          style={
            {
              "--index": KINDS.findIndex((k) => k.kind === p.kind),
            } as CSSProperties
          }
        />
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <button
            aria-checked={p.kind === kind}
            className={p.kind === kind ? "is-active" : ""}
            key={kind}
            onClick={() => p.onKind(kind)}
            role="radio"
            type="button"
          >
            <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
            <span className="segmented-label">{label}</span>
          </button>
        ))}
      </div>

      <label className="target-input">
        <input
          aria-label={`Target in ${unitLabel}`}
          inputMode="decimal"
          min="0"
          onChange={(e) => p.onValue(e.target.value)}
          step="any"
          type="number"
          value={p.value}
        />
        <span>{unitLabel}</span>
      </label>
      {p.kind !== "distance" && p.targetM !== null && (
        <p className="hint">About {formatDistance(p.targetM, p.units)}</p>
      )}

      <p className="hint origin-hint">
        {originText}
        {p.originStatus === "pin" && (
          <button className="link" onClick={p.onUseMyLocation} type="button">
            <LocateFixed aria-hidden="true" size={14} strokeWidth={2.5} />
            Use my location
          </button>
        )}
      </p>

      {p.error && <ErrorPlaque>{p.error}</ErrorPlaque>}

      <button
        className="btn-exit"
        disabled={
          p.planning ||
          p.targetM === null ||
          p.originStatus === "locating" ||
          p.originStatus === "no-location"
        }
        type="submit"
      >
        {p.planning ? (
          <>
            <span aria-hidden="true" className="spinner" /> Finding routes…
          </>
        ) : (
          <>
            <RouteIcon aria-hidden="true" size={20} strokeWidth={2.5} /> Plan
            route
          </>
        )}
      </button>
    </form>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  colors: string[];
  onBack: () => void;
  onReplan: () => void;
  onSelect: (index: number) => void;
  onSettings: () => void;
  onShowAll: (showAll: boolean) => void;
  onStart: () => void;
  result: PlanResult;
  routes: Route[];
  selected: number;
  settings: WalkerSettings;
  showAll: boolean;
  targetM: number;
  units: Units;
}

export function ResultsPanel(p: ResultsProps) {
  const route = p.routes[p.selected];
  const shape = route.shape === "loop" ? "Loop" : "Out and back";
  return (
    <div>
      <div className="sign-header">
        <span
          aria-hidden="true"
          className="route-swatch"
          style={{ "--candidate": p.colors[p.selected] } as CSSProperties}
        />
        <BigValue
          unit={distanceUnit(p.units)}
          value={formatDistanceNumber(route.lengthM, p.units)}
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
          <div aria-label="Routes" className="candidates" role="radiogroup">
            {p.routes.map((r, i) => (
              <button
                aria-checked={i === p.selected}
                className={`candidate ${i === p.selected ? "is-active" : ""}`}
                key={i}
                onClick={() => p.onSelect(i)}
                role="radio"
                style={{ "--candidate": p.colors[i] } as CSSProperties}
                type="button"
              >
                <span aria-hidden="true" className="dot" />
                {formatDistance(r.lengthM, p.units)}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input
              checked={p.showAll}
              onChange={(e) => p.onShowAll(e.target.checked)}
              type="checkbox"
            />
            <span aria-hidden="true" className="toggle-track" />
            Show all routes
          </label>
        </>
      )}

      <button className="btn-exit" onClick={p.onStart} type="button">
        <Play
          aria-hidden="true"
          fill="currentColor"
          size={18}
          strokeWidth={2.75}
        />{" "}
        Start walk
      </button>
      <div className="row">
        <button className="btn-outline" onClick={p.onReplan} type="button">
          <RefreshCw aria-hidden="true" size={16} strokeWidth={2.5} /> New
          routes
        </button>
        <button className="btn-outline" onClick={p.onBack} type="button">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} /> Change
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
        unit: "steps left",
        value: formatSteps(metersToTargetUnit(leftM, "steps", settings)),
      };
    case "time":
      return {
        unit: "min left",
        value: String(Math.max(0, Math.round(routeMinutes(leftM, settings)))),
      };
    case "distance":
      return {
        unit: `${distanceUnit(units)} left`,
        value: formatDistanceNumber(leftM, units),
      };
  }
}

interface WalkProps {
  hasPosition: boolean;
  onEnd: () => void;
  settings: WalkerSettings;
  units: Units;
  walk: ActiveWalk;
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
          aria-hidden="true"
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
        />
        <div aria-live="polite">
          <BigValue unit={unit} value={value} />
          <p className="caption">
            Back around {clockTime(new Date(now + leftMinutes * 60_000))}
          </p>
        </div>
      </div>
      <div
        aria-label="Walk progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(fraction * 100)}
        className="progress-bar"
        role="progressbar"
        style={{ "--candidate": walk.color } as CSSProperties}
      >
        <div style={{ transform: `scaleX(${fraction})` }} />
      </div>
      <p className="hint">
        {done} · {formatMinutes((now - walk.startedAt) / 60_000)} walked
      </p>
      {!hasPosition && <p className="hint">Waiting for your location…</p>}
      <button className="btn-outline" onClick={onEnd} type="button">
        <Square
          aria-hidden="true"
          fill="currentColor"
          size={14}
          strokeWidth={3}
        />{" "}
        End walk
      </button>
    </div>
  );
}

// ─── Finished and resume ─────────────────────────────────────────────────────

interface FinishedProps {
  endedAt: number;
  onDone: () => void;
  units: Units;
  walk: ActiveWalk;
}

export function FinishedPanel({ walk, endedAt, units, onDone }: FinishedProps) {
  return (
    <div>
      <div className="walk-sign">
        <Flag
          aria-hidden="true"
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
        />
        <div>
          <p className="caption">Walk finished</p>
          <BigValue
            unit={distanceUnit(units)}
            value={formatDistanceNumber(walk.route.lengthM, units)}
          />
          <p className="caption">
            In {formatMinutes((endedAt - walk.startedAt) / 60_000)}
          </p>
        </div>
      </div>
      <button className="btn-exit" onClick={onDone} type="button">
        <Check aria-hidden="true" size={20} strokeWidth={3} /> Done
      </button>
    </div>
  );
}

interface ResumeProps {
  onDiscard: () => void;
  onResume: () => void;
  units: Units;
  walk: ActiveWalk;
}

export function ResumePanel({ walk, units, onResume, onDiscard }: ResumeProps) {
  return (
    <div>
      <div className="walk-sign">
        <Footprints
          aria-hidden="true"
          className="walk-icon"
          size={44}
          strokeWidth={2.25}
        />
        <div>
          <h1 className="title">Resume your walk?</h1>
          <p className="caption">
            {formatDistanceNumber(walk.progressM, units)} of{" "}
            {formatDistance(walk.route.lengthM, units)} done
          </p>
        </div>
      </div>
      <button className="btn-exit" onClick={onResume} type="button">
        <Play
          aria-hidden="true"
          fill="currentColor"
          size={18}
          strokeWidth={2.75}
        />{" "}
        Resume walk
      </button>
      <button className="btn-outline" onClick={onDiscard} type="button">
        Discard
      </button>
    </div>
  );
}
