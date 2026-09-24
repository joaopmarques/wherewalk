import { Check, RotateCcw, Settings } from 'lucide-react'
import { useState } from 'react'
import type { UnitPreference, Units, WalkerSettings } from '../domain/types'
import { DEFAULT_SETTINGS } from '../storage'
import { CM_PER_IN, M_PER_MI } from '../units'

interface Props {
  settings: WalkerSettings
  units: Units
  hasBuiltInKey: boolean
  onChange: (settings: WalkerSettings) => void
  onClose: () => void
}

const round1 = (n: number) => Math.round(n * 10) / 10

export function SettingsPanel({ settings, units, hasBuiltInKey, onChange, onClose }: Props) {
  const imperial = units === 'imperial'
  const toPace = (kmh: number) => round1(imperial ? (kmh * 1000) / M_PER_MI : kmh)
  const toStride = (m: number) => round1(imperial ? (m * 100) / CM_PER_IN : m * 100)
  // Keep the typed text, so a half-typed number such as "4." is not reformatted.
  const [pace, setPace] = useState(String(toPace(settings.paceKmh)))
  const [stride, setStride] = useState(String(toStride(settings.strideM)))

  const updatePace = (text: string) => {
    setPace(text)
    const n = Number(text)
    if (n > 0) onChange({ ...settings, paceKmh: imperial ? (n * M_PER_MI) / 1000 : n })
  }
  const updateStride = (text: string) => {
    setStride(text)
    const n = Number(text)
    if (n > 0) onChange({ ...settings, strideM: imperial ? (n * CM_PER_IN) / 100 : n / 100 })
  }
  const reset = () => {
    onChange({ ...settings, paceKmh: DEFAULT_SETTINGS.paceKmh, strideM: DEFAULT_SETTINGS.strideM })
    setPace(String(toPace(DEFAULT_SETTINGS.paceKmh)))
    setStride(String(toStride(DEFAULT_SETTINGS.strideM)))
  }

  return (
    <div>
      <div className="sign-header">
        <Settings className="header-icon" size={28} strokeWidth={2.25} aria-hidden="true" />
        <h1 className="title">Settings</h1>
      </div>
      <label className="field">
        <span>Units</span>
        <select
          value={settings.units}
          onChange={(e) => onChange({ ...settings, units: e.target.value as UnitPreference })}
        >
          <option value="auto">Automatic</option>
          <option value="metric">Kilometers</option>
          <option value="imperial">Miles</option>
        </select>
      </label>
      <div className="row">
        <label className="field">
          <span>Pace ({imperial ? 'mph' : 'km/h'})</span>
          <input type="number" inputMode="decimal" min="0" step="any" value={pace} onChange={(e) => updatePace(e.target.value)} />
        </label>
        <label className="field">
          <span>Stride ({imperial ? 'in' : 'cm'})</span>
          <input type="number" inputMode="decimal" min="0" step="any" value={stride} onChange={(e) => updateStride(e.target.value)} />
        </label>
      </div>
      <button type="button" className="link" onClick={reset}>
        <RotateCcw size={14} strokeWidth={2.5} aria-hidden="true" />
        Reset pace and stride
      </button>
      <label className="field">
        <span>Your OpenRouteService key</span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder={hasBuiltInKey ? 'Optional. The built-in key is in use.' : 'Required'}
          value={settings.orsKey}
          onChange={(e) => onChange({ ...settings, orsKey: e.target.value })}
        />
      </label>
      <p className="hint">
        Your own key gives you your own daily quota. Get a free key at{' '}
        <a href="https://openrouteservice.org/dev/#/signup" target="_blank" rel="noreferrer">
          openrouteservice.org
        </a>
        . The key stays on this device.
      </p>
      <button type="button" className="btn-exit" onClick={onClose}>
        <Check size={20} strokeWidth={3} aria-hidden="true" /> Done
      </button>
    </div>
  )
}
