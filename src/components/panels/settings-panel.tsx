import { Check, RotateCcw, Settings } from "lucide-react";
import { useState } from "react";
import { Credit } from "@/components/sign/credit";
import { Field, SelectField } from "@/components/sign/field";
import { SignButton } from "@/components/sign/sign-button";
import { SignHeader, SignTitle } from "@/components/sign/sign-header";
import { Hint } from "@/components/sign/text";
import type { UnitPreference, Units, WalkerSettings } from "@/domain/types";
import { DEFAULT_SETTINGS } from "@/storage";
import { CM_PER_IN, M_PER_MI } from "@/units";

const UNIT_OPTIONS: { label: string; value: UnitPreference }[] = [
  { label: "Automatic", value: "auto" },
  { label: "Kilometers", value: "metric" },
  { label: "Miles", value: "imperial" },
];

export interface SettingsPanelProps {
  hasBuiltInKey: boolean;
  onChange: (settings: WalkerSettings) => void;
  onClose: () => void;
  settings: WalkerSettings;
  units: Units;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function SettingsPanel({
  hasBuiltInKey,
  onChange,
  onClose,
  settings,
  units,
}: SettingsPanelProps) {
  const imperial = units === "imperial";
  const toPace = (kmh: number) =>
    round1(imperial ? (kmh * 1000) / M_PER_MI : kmh);
  const toStride = (m: number) =>
    round1(imperial ? (m * 100) / CM_PER_IN : m * 100);
  // Keep the typed text, so a half-typed number such as "4." is not reformatted.
  const [pace, setPace] = useState(String(toPace(settings.paceKmh)));
  const [stride, setStride] = useState(String(toStride(settings.strideM)));

  const updatePace = (text: string) => {
    setPace(text);
    const n = Number(text);
    if (n > 0) {
      onChange({ ...settings, paceKmh: imperial ? (n * M_PER_MI) / 1000 : n });
    }
  };
  const updateStride = (text: string) => {
    setStride(text);
    const n = Number(text);
    if (n > 0) {
      onChange({
        ...settings,
        strideM: imperial ? (n * CM_PER_IN) / 100 : n / 100,
      });
    }
  };
  const reset = () => {
    onChange({
      ...settings,
      paceKmh: DEFAULT_SETTINGS.paceKmh,
      strideM: DEFAULT_SETTINGS.strideM,
    });
    setPace(String(toPace(DEFAULT_SETTINGS.paceKmh)));
    setStride(String(toStride(DEFAULT_SETTINGS.strideM)));
  };

  return (
    <div>
      <SignHeader>
        <Settings
          aria-hidden="true"
          className="header-icon"
          size={28}
          strokeWidth={2.25}
        />
        <SignTitle>Settings</SignTitle>
      </SignHeader>
      <SelectField
        label="Units"
        onChange={(value) => onChange({ ...settings, units: value })}
        options={UNIT_OPTIONS}
        value={settings.units}
      />
      <div className="row">
        <Field
          inputMode="decimal"
          label={`Pace (${imperial ? "mph" : "km/h"})`}
          min="0"
          onChange={(e) => updatePace(e.target.value)}
          step="any"
          type="number"
          value={pace}
        />
        <Field
          inputMode="decimal"
          label={`Stride (${imperial ? "in" : "cm"})`}
          min="0"
          onChange={(e) => updateStride(e.target.value)}
          step="any"
          type="number"
          value={stride}
        />
      </div>
      <SignButton onClick={reset} variant="link">
        <RotateCcw aria-hidden="true" size={14} strokeWidth={2.5} />
        Reset pace and stride
      </SignButton>
      <Field
        autoComplete="off"
        label="Your OpenRouteService key"
        onChange={(e) => onChange({ ...settings, orsKey: e.target.value })}
        placeholder={
          hasBuiltInKey ? "Optional. The built-in key is in use." : "Required"
        }
        spellCheck={false}
        type="password"
        value={settings.orsKey}
      />
      <Hint>
        Your own key gives you your own daily quota. Get a free key at{" "}
        <a
          href="https://openrouteservice.org/dev/#/signup"
          rel="noreferrer"
          target="_blank"
        >
          openrouteservice.org
        </a>
        . The key stays on this device.
      </Hint>
      <SignButton onClick={onClose} variant="exit">
        <Check aria-hidden="true" size={20} strokeWidth={3} /> Done
      </SignButton>
      <Credit />
    </div>
  );
}
