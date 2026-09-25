import { Progress } from "@/ui/progress";

/** Walk Progress as a bar in the Selected Route's color. */
export function ProgressBar({
  color,
  fraction,
}: {
  color: string;
  fraction: number;
}) {
  return (
    <Progress aria-label="Walk progress" color={color} value={fraction * 100} />
  );
}
