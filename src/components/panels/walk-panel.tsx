import { Footprints, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { BigValue } from "@/components/sign/big-value";
import { IconHeader } from "@/components/sign/icon-header";
import { ProgressBar } from "@/components/sign/progress-bar";
import { SignButton } from "@/components/sign/sign-button";
import { Caption, Hint } from "@/components/sign/text";
import { metersToTargetUnit } from "@/domain/target";
import type { Units, WalkerSettings } from "@/domain/types";
import type { ActiveWalk } from "@/storage";
import {
  distanceUnit,
  formatDistance,
  formatDistanceNumber,
  formatMinutes,
  formatSteps,
} from "@/units";
import { clockTime, routeMinutes } from "./format";

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

function doneText(walk: ActiveWalk, units: Units, settings: WalkerSettings) {
  if (walk.target.kind === "steps") {
    const steps = (m: number) =>
      formatSteps(metersToTargetUnit(m, "steps", settings));
    return `${steps(walk.progressM)} of ${steps(walk.route.lengthM)} steps`;
  }
  return `${formatDistanceNumber(walk.progressM, units)} of ${formatDistance(walk.route.lengthM, units)}`;
}

export interface WalkPanelProps {
  hasPosition: boolean;
  onEnd: () => void;
  settings: WalkerSettings;
  units: Units;
  walk: ActiveWalk;
}

export function WalkPanel({
  hasPosition,
  onEnd,
  settings,
  units,
  walk,
}: WalkPanelProps) {
  const now = useNow();
  const fraction = Math.min(1, walk.progressM / walk.route.lengthM);
  const { value, unit } = leftInTargetUnit(walk, units, settings);
  const leftMinutes = routeMinutes(
    Math.max(0, walk.route.lengthM - walk.progressM),
    settings
  );

  return (
    <div>
      <IconHeader icon={Footprints} live>
        <BigValue unit={unit} value={value} />
        <Caption>
          Back around {clockTime(new Date(now + leftMinutes * 60_000))}
        </Caption>
      </IconHeader>
      <ProgressBar color={walk.color} fraction={fraction} />
      <Hint>
        {doneText(walk, units, settings)} ·{" "}
        {formatMinutes((now - walk.startedAt) / 60_000)} walked
      </Hint>
      {!hasPosition && <Hint>Waiting for your location…</Hint>}
      <SignButton onClick={onEnd} variant="outline">
        <Square
          aria-hidden="true"
          fill="currentColor"
          size={14}
          strokeWidth={3}
        />{" "}
        End walk
      </SignButton>
    </div>
  );
}
