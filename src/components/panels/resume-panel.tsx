import { Footprints, Play } from "lucide-react";
import { IconHeader } from "@/components/sign/icon-header";
import { SignButton } from "@/components/sign/sign-button";
import { SignTitle } from "@/components/sign/sign-header";
import { Caption } from "@/components/sign/text";
import type { Units } from "@/domain/types";
import type { ActiveWalk } from "@/storage";
import { formatDistance, formatDistanceNumber } from "@/units";

export interface ResumePanelProps {
  onDiscard: () => void;
  onResume: () => void;
  units: Units;
  walk: ActiveWalk;
}

export function ResumePanel({
  onDiscard,
  onResume,
  units,
  walk,
}: ResumePanelProps) {
  return (
    <div>
      <IconHeader icon={Footprints}>
        <SignTitle>Resume your walk?</SignTitle>
        <Caption>
          {formatDistanceNumber(walk.progressM, units)} of{" "}
          {formatDistance(walk.route.lengthM, units)} done
        </Caption>
      </IconHeader>
      <SignButton onClick={onResume} variant="exit">
        <Play
          aria-hidden="true"
          fill="currentColor"
          size={18}
          strokeWidth={2.75}
        />{" "}
        Resume walk
      </SignButton>
      <SignButton onClick={onDiscard} variant="outline">
        Discard
      </SignButton>
    </div>
  );
}
