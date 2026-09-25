import { Clock, Footprints, LocateFixed, Route, Ruler } from "lucide-react";
import { Plaque } from "@/components/sign/plaque";
import { Segmented, type SegmentedOption } from "@/components/sign/segmented";
import { Shield } from "@/components/sign/shield";
import { SignButton } from "@/components/sign/sign-button";
import { SignHeader, SignTitle } from "@/components/sign/sign-header";
import { Spinner } from "@/components/sign/spinner";
import { TargetInput } from "@/components/sign/target-input";
import { Caption, Hint } from "@/components/sign/text";
import type { TargetKind, Units } from "@/domain/types";
import { distanceUnit, formatDistance } from "@/units";
import { SettingsButton } from "./settings-button";

const KINDS: SegmentedOption<TargetKind>[] = [
  { icon: Clock, label: "Time", value: "time" },
  { icon: Ruler, label: "Distance", value: "distance" },
  { icon: Footprints, label: "Steps", value: "steps" },
];

export type OriginStatus =
  | "locating"
  | "gps"
  | "pin"
  | "pin-no-location"
  | "no-location";

const ORIGIN_TEXT: Record<OriginStatus, string> = {
  gps: "Starting from your location. Drag the pin to change it.",
  locating: "Finding your location…",
  "no-location": "Location is off. Tap the map to set a start point.",
  pin: "Starting from the pin.",
  "pin-no-location":
    "Starting from the pin. Drag it or tap the map to move it.",
};

export interface SetupPanelProps {
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

export function SetupPanel(p: SetupPanelProps) {
  const unitLabel = {
    distance: distanceUnit(p.units),
    steps: "steps",
    time: "min",
  }[p.kind];
  const canPlan =
    !p.planning &&
    p.targetM !== null &&
    p.originStatus !== "locating" &&
    p.originStatus !== "no-location";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        p.onPlan();
      }}
    >
      <SignHeader>
        <Shield />
        <SignTitle size="brand">Where2Walk</SignTitle>
        <SettingsButton onClick={p.onSettings} />
      </SignHeader>

      <Caption id="target-label">How much do you want to walk?</Caption>
      <Segmented
        labelledBy="target-label"
        onChange={p.onKind}
        options={KINDS}
        value={p.kind}
      />

      <TargetInput
        label={`Target in ${unitLabel}`}
        onChange={p.onValue}
        unit={unitLabel}
        value={p.value}
      />
      {p.kind !== "distance" && p.targetM !== null && (
        <Hint>About {formatDistance(p.targetM, p.units)}</Hint>
      )}

      <Hint
        action={
          p.originStatus === "pin" && (
            <SignButton onClick={p.onUseMyLocation} variant="link">
              <LocateFixed aria-hidden="true" size={14} strokeWidth={2.5} />
              Use my location
            </SignButton>
          )
        }
      >
        {ORIGIN_TEXT[p.originStatus]}
      </Hint>

      {p.error && <Plaque variant="error">{p.error}</Plaque>}

      <SignButton disabled={!canPlan} type="submit" variant="exit">
        {p.planning ? (
          <>
            <Spinner /> Finding routes…
          </>
        ) : (
          <>
            <Route aria-hidden="true" size={20} strokeWidth={2.5} /> Plan route
          </>
        )}
      </SignButton>
    </form>
  );
}
