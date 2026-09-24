import { useEffect, useState, type CSSProperties } from 'react'
import type { PlanResult } from '../domain/planner'
import { metersToTargetUnit } from '../domain/target'
import type { Route, TargetKind, Units, WalkerSettings } from '../domain/types'
import type { ActiveWalk } from '../storage'
import { distanceUnit, formatDistance, formatDistanceNumber, formatMinutes, formatSteps } from '../units'

const KIND_LABELS: Record<TargetKind, string> = { time: 'Time', distance: 'Distance', steps: 'Steps' }

export type OriginStatus = 'locating' | 'gps' | 'pin' | 'pin-no-location' | 'no-location'

function Header({ title, onSettings }: { title: string; onSettings?: () => void }) {
  return (
    <div className="panel-header">
      <h1>{title}</h1>
      {onSettings && (
        <button type="button" className="icon-button" onClick={onSettings} aria-label="Settings">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

const routeTime = (lengthM: number, settings: WalkerSettings) =>
  formatMinutes(metersToTargetUnit(lengthM, 'time', settings))

// ─── Setup ───────────────────────────────────────────────────────────────────

interface SetupProps {
  kind: TargetKind
  value: string
  units: Units
  targetM: number | null
  originStatus: OriginStatus
  planning: boolean
  error: string | null
  onKind: (kind: TargetKind) => void
  onValue: (value: string) => void
  onUseMyLocation: () => void
  onPlan: () => void
  onSettings: () => void
}

export function SetupPanel(p: SetupProps) {
  const unitLabel = { time: 'min', distance: distanceUnit(p.units), steps: 'steps' }[p.kind]
  const originText = {
    locating: 'Finding your location…',
    gps: 'Starting from your location. Drag the pin to change it.',
    pin: 'Starting from the pin.',
    'pin-no-location': 'Starting from the pin. Drag it or tap the map to move it.',
    'no-location': 'Location is off. Tap the map to set a start point.',
  }[p.originStatus]

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        p.onPlan()
      }}
    >
      <Header title="Where2Walk" onSettings={p.onSettings} />
      <p className="label" id="target-label">
        How much do you want to walk?
      </p>
      <div className="segmented" role="radiogroup" aria-labelledby="target-label">
        {(Object.keys(KIND_LABELS) as TargetKind[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={p.kind === k}
            className={p.kind === k ? 'is-active' : ''}
            onClick={() => p.onKind(k)}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>
      <label className="target-input">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={p.value}
          onChange={(e) => p.onValue(e.target.value)}
          aria-label={`Target in ${unitLabel}`}
        />
        <span>{unitLabel}</span>
      </label>
      {p.kind !== 'distance' && p.targetM !== null && (
        <p className="hint">About {formatDistance(p.targetM, p.units)}</p>
      )}
      <p className="hint origin-hint">
        {originText}
        {p.originStatus === 'pin' && (
          <>
            {' '}
            <button type="button" className="link" onClick={p.onUseMyLocation}>
              Use my location
            </button>
          </>
        )}
      </p>
      {p.error && (
        <p className="error" role="alert">
          {p.error}
        </p>
      )}
      <button
        type="submit"
        className="primary"
        disabled={p.planning || p.targetM === null || p.originStatus === 'locating' || p.originStatus === 'no-location'}
      >
        {p.planning ? 'Finding routes…' : 'Plan route'}
      </button>
    </form>
  )
}

// ─── Results ─────────────────────────────────────────────────────────────────

interface ResultsProps {
  result: PlanResult
  routes: Route[]
  colors: string[]
  selected: number
  showAll: boolean
  targetM: number
  units: Units
  settings: WalkerSettings
  onSelect: (index: number) => void
  onShowAll: (showAll: boolean) => void
  onStart: () => void
  onReplan: () => void
  onBack: () => void
  onSettings: () => void
}

export function ResultsPanel(p: ResultsProps) {
  const route = p.routes[p.selected]
  const color = p.colors[p.selected]
  return (
    <div>
      <Header title={`${formatDistance(route.lengthM, p.units)} · ${routeTime(route.lengthM, p.settings)}`} onSettings={p.onSettings} />
      {p.result.kind === 'closest' ? (
        <p className="notice">
          No route within 10% of your Target ({formatDistance(p.targetM, p.units)}). This is the closest one found.
        </p>
      ) : route.shape === 'out-and-back' ? (
        <p className="notice">No loop found here. This route goes out and comes back on the same streets.</p>
      ) : null}

      {p.routes.length > 1 && (
        <>
          <div className="candidates" role="radiogroup" aria-label="Routes">
            {p.routes.map((r, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i === p.selected}
                className={`candidate ${i === p.selected ? 'is-active' : ''}`}
                style={{ '--candidate': p.colors[i] } as CSSProperties}
                onClick={() => p.onSelect(i)}
              >
                <span className="dot" aria-hidden="true" />
                {formatDistance(r.lengthM, p.units)}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input type="checkbox" checked={p.showAll} onChange={(e) => p.onShowAll(e.target.checked)} />
            Show all routes
          </label>
        </>
      )}

      <button type="button" className="primary" style={{ background: color }} onClick={p.onStart}>
        Start walk
      </button>
      <div className="row">
        <button type="button" className="secondary" onClick={p.onReplan}>
          New routes
        </button>
        <button type="button" className="secondary" onClick={p.onBack}>
          Change target
        </button>
      </div>
    </div>
  )
}

// ─── Walk ────────────────────────────────────────────────────────────────────

/** Re-renders every 15 seconds, so elapsed time stays current. */
function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/** Progress in the unit of the Target: steps, minutes, or distance. */
function progressLines(walk: ActiveWalk, units: Units, settings: WalkerSettings) {
  const { progressM } = walk
  const lengthM = walk.route.lengthM
  const leftM = Math.max(0, lengthM - progressM)
  const distanceLine = `${formatDistanceNumber(progressM, units)} of ${formatDistance(lengthM, units)}`
  switch (walk.target.kind) {
    case 'steps':
      return {
        main: `${formatSteps(metersToTargetUnit(progressM, 'steps', settings))} of ${formatSteps(metersToTargetUnit(lengthM, 'steps', settings))} steps`,
        detail: distanceLine,
      }
    case 'time':
      return { main: `${routeTime(leftM, settings)} left`, detail: distanceLine }
    case 'distance':
      return { main: distanceLine, detail: `About ${routeTime(leftM, settings)} left` }
  }
}

interface WalkProps {
  walk: ActiveWalk
  units: Units
  settings: WalkerSettings
  hasPosition: boolean
  onEnd: () => void
}

export function WalkPanel({ walk, units, settings, hasPosition, onEnd }: WalkProps) {
  const now = useNow()
  const fraction = Math.min(1, walk.progressM / walk.route.lengthM)
  const { main, detail } = progressLines(walk, units, settings)
  return (
    <div>
      <p className="progress-main" aria-live="polite">
        {main}
      </p>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
      >
        <div style={{ width: `${fraction * 100}%`, background: walk.color }} />
      </div>
      <p className="hint">
        {detail} · {formatMinutes((now - walk.startedAt) / 60_000)} walked
      </p>
      {!hasPosition && <p className="hint">Waiting for your location…</p>}
      <button type="button" className="secondary" onClick={onEnd}>
        End walk
      </button>
    </div>
  )
}

// ─── Finished and resume ─────────────────────────────────────────────────────

interface FinishedProps {
  walk: ActiveWalk
  endedAt: number
  units: Units
  onDone: () => void
}

export function FinishedPanel({ walk, endedAt, units, onDone }: FinishedProps) {
  return (
    <div>
      <Header title="Walk finished" />
      <p className="progress-main">
        {formatDistance(walk.route.lengthM, units)} in {formatMinutes((endedAt - walk.startedAt) / 60_000)}
      </p>
      <button type="button" className="primary" onClick={onDone}>
        Done
      </button>
    </div>
  )
}

interface ResumeProps {
  walk: ActiveWalk
  units: Units
  onResume: () => void
  onDiscard: () => void
}

export function ResumePanel({ walk, units, onResume, onDiscard }: ResumeProps) {
  return (
    <div>
      <Header title="Resume your walk?" />
      <p className="hint">
        {formatDistanceNumber(walk.progressM, units)} of {formatDistance(walk.route.lengthM, units)} done.
      </p>
      <button type="button" className="primary" style={{ background: walk.color }} onClick={onResume}>
        Resume walk
      </button>
      <button type="button" className="secondary" onClick={onDiscard}>
        Discard
      </button>
    </div>
  )
}
