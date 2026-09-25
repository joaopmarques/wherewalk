import { Check, Flag } from "lucide-react";
import { BigValue } from "@/components/sign/big-value";
import { IconHeader } from "@/components/sign/icon-header";
import { SignButton } from "@/components/sign/sign-button";
import { Caption } from "@/components/sign/text";
import type { Units } from "@/domain/types";
import type { ActiveWalk } from "@/storage";
import { distanceUnit, formatDistanceNumber, formatMinutes } from "@/units";

export interface FinishedPanelProps {
  endedAt: number;
  onDone: () => void;
  units: Units;
  walk: ActiveWalk;
}

export function FinishedPanel({
  endedAt,
  onDone,
  units,
  walk,
}: FinishedPanelProps) {
  return (
    <div>
      <IconHeader icon={Flag}>
        <Caption>Walk finished</Caption>
        <BigValue
          unit={distanceUnit(units)}
          value={formatDistanceNumber(walk.route.lengthM, units)}
        />
        <Caption>
          In {formatMinutes((endedAt - walk.startedAt) / 60_000)}
        </Caption>
      </IconHeader>
      <SignButton onClick={onDone} variant="exit">
        <Check aria-hidden="true" size={20} strokeWidth={3} /> Done
      </SignButton>
    </div>
  );
}
