import { Settings } from "lucide-react";
import { SignButton } from "@/components/sign/sign-button";

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <SignButton aria-label="Settings" onClick={onClick} variant="icon">
      <Settings aria-hidden="true" size={20} strokeWidth={2.25} />
    </SignButton>
  );
}
