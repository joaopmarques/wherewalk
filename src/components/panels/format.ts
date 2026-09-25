import { metersToTargetUnit } from "@/domain/target";
import type { WalkerSettings } from "@/domain/types";

export const routeMinutes = (lengthM: number, settings: WalkerSettings) =>
  metersToTargetUnit(lengthM, "time", settings);

export const clockTime = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
