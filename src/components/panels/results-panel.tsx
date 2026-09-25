import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import { BigValue } from "@/components/sign/big-value";
import {
  CandidatePicker,
  RouteSwatch,
} from "@/components/sign/candidate-picker";
import { Plaque } from "@/components/sign/plaque";
import { SignButton } from "@/components/sign/sign-button";
import { SignHeader } from "@/components/sign/sign-header";
import { Caption } from "@/components/sign/text";
import { Toggle } from "@/components/sign/toggle";
import type { PlanResult } from "@/domain/planner";
import type { Route, Units, WalkerSettings } from "@/domain/types";
import {
  distanceUnit,
  formatDistance,
  formatDistanceNumber,
  formatMinutes,
} from "@/units";
import { routeMinutes } from "./format";
import { SettingsButton } from "./settings-button";

export interface ResultsPanelProps {
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

function warning(p: ResultsPanelProps, route: Route) {
  if (p.result.kind === "closest") {
    return `No route within 10% of your Target (${formatDistance(p.targetM, p.units)}). This is the closest one found.`;
  }
  if (route.shape === "out-and-back") {
    return "No loop found here. This route goes out and comes back on the same streets.";
  }
  return null;
}

export function ResultsPanel(p: ResultsPanelProps) {
  const route = p.routes[p.selected];
  const shape = route.shape === "loop" ? "Loop" : "Out and back";
  const message = warning(p, route);
  return (
    <div>
      <SignHeader>
        <RouteSwatch color={p.colors[p.selected]} />
        <BigValue
          unit={distanceUnit(p.units)}
          value={formatDistanceNumber(route.lengthM, p.units)}
        />
        <SettingsButton onClick={p.onSettings} />
      </SignHeader>
      <Caption>
        About {formatMinutes(routeMinutes(route.lengthM, p.settings))} · {shape}
      </Caption>

      {message && <Plaque variant="warning">{message}</Plaque>}

      {p.routes.length > 1 && (
        <>
          <CandidatePicker
            onSelect={p.onSelect}
            options={p.routes.map((r, i) => ({
              color: p.colors[i],
              label: formatDistance(r.lengthM, p.units),
            }))}
            selected={p.selected}
          />
          <Toggle checked={p.showAll} onChange={p.onShowAll}>
            Show all routes
          </Toggle>
        </>
      )}

      <SignButton onClick={p.onStart} variant="exit">
        <Play
          aria-hidden="true"
          fill="currentColor"
          size={18}
          strokeWidth={2.75}
        />{" "}
        Start walk
      </SignButton>
      <div className="row">
        <SignButton onClick={p.onReplan} variant="outline">
          <RefreshCw aria-hidden="true" size={16} strokeWidth={2.5} /> New
          routes
        </SignButton>
        <SignButton onClick={p.onBack} variant="outline">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.5} /> Change
          target
        </SignButton>
      </div>
    </div>
  );
}
