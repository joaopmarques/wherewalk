import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { MapView, type MapRoute } from './components/MapView'
import { FinishedPanel, ResultsPanel, ResumePanel, SetupPanel, WalkPanel, type OriginStatus } from './components/panels'
import { SettingsPanel } from './components/SettingsPanel'
import { planRoutes, type PlanResult } from './domain/planner'
import { isFinished, matchProgress, measureRoute, sliceRoute } from './domain/progress'
import { targetToMeters } from './domain/target'
import type { LngLat, Route, Target, TargetKind, WalkerSettings } from './domain/types'
import { useGeolocation } from './hooks/useGeolocation'
import { useWakeLock } from './hooks/useWakeLock'
import { BUILT_IN_ORS_KEY, createOrsRouter, RouterError } from './routing/ors'
import { loadActiveWalk, loadSettings, saveActiveWalk, saveSettings, type ActiveWalk } from './storage'
import { metersPerUnit, resolveUnits } from './units'

/** One color per Candidate. The Selected Route and its button share the color. */
const CANDIDATE_COLORS = ['#2563eb', '#e11d48', '#d97706', '#7c3aed', '#0d9488']

/** ORS does not plan round trips longer than 100 km. */
const MAX_TARGET_M = 100_000
const MIN_TARGET_M = 200

type Phase =
  | { name: 'setup'; planning: boolean }
  | { name: 'results'; target: Target; targetM: number; result: PlanResult; selected: number; showAll: boolean }
  | { name: 'walking'; walk: ActiveWalk }
  | { name: 'finished'; walk: ActiveWalk; endedAt: number }
  | { name: 'resume'; walk: ActiveWalk }

const resultRoutes = (result: PlanResult): Route[] =>
  result.kind === 'candidates' ? result.candidates : [result.route]

const newSeed = () => Math.floor(Math.random() * 1000)

export function App() {
  const geo = useGeolocation()
  const [settings, setSettings] = useState<WalkerSettings>(loadSettings)
  const units = resolveUnits(settings.units)
  const [phase, setPhase] = useState<Phase>(() => {
    const walk = loadActiveWalk()
    return walk ? { name: 'resume', walk } : { name: 'setup', planning: false }
  })
  const [origin, setOrigin] = useState<LngLat | null>(() => loadActiveWalk()?.origin ?? null)
  const [originIsPin, setOriginIsPin] = useState(false)
  const [kind, setKind] = useState<TargetKind>('time')
  const [inputs, setInputs] = useState<Record<TargetKind, string>>(() => ({
    time: '30',
    distance: units === 'imperial' ? '2' : '3',
    steps: '5000',
  }))
  const [error, setError] = useState<string | null>(null)
  // A saved Walk from an earlier visit starts with the map fitted to its Route.
  const [fitKey, setFitKey] = useState(() => (loadActiveWalk() ? 1 : 0))
  const [showSettings, setShowSettings] = useState(false)

  const updateSettings = (next: WalkerSettings) => {
    setSettings(next)
    saveSettings(next)
  }

  // Until the Walker drags the pin, the Origin follows the GPS position during setup.
  useEffect(() => {
    if (phase.name === 'setup' && !originIsPin && geo.position) setOrigin(geo.position)
  }, [phase.name, originIsPin, geo.position])

  // ─── Target ──────────────────────────────────────────────────────────────
  const target: Target | null = useMemo(() => {
    const n = Number(inputs[kind])
    if (!(n > 0)) return null
    return { kind, value: kind === 'distance' ? n * metersPerUnit(units) : n }
  }, [inputs, kind, units])
  const targetM = target ? targetToMeters(target, settings) : null

  // ─── Planning ────────────────────────────────────────────────────────────
  const plan = async (planTarget: Target) => {
    if (!origin) return
    const planTargetM = targetToMeters(planTarget, settings)
    if (planTargetM > MAX_TARGET_M) return setError('Targets above 100 km are not supported.')
    if (planTargetM < MIN_TARGET_M) return setError('The Target is too small. Try at least 200 m.')
    setError(null)
    setPhase({ name: 'setup', planning: true })
    try {
      const router = createOrsRouter(settings.orsKey.trim() || BUILT_IN_ORS_KEY)
      const result = await planRoutes(origin, planTargetM, router, newSeed())
      setPhase({ name: 'results', target: planTarget, targetM: planTargetM, result, selected: 0, showAll: false })
      setFitKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof RouterError ? e.message : 'Something went wrong while planning. Try again.')
      setPhase({ name: 'setup', planning: false })
    }
  }

  const changeOrigin = (next: LngLat) => {
    setOrigin(next)
    setOriginIsPin(true)
    // A moved Origin makes the planned Candidates wrong.
    if (phase.name === 'results') setPhase({ name: 'setup', planning: false })
  }

  const useMyLocation = () => {
    setOriginIsPin(false)
    if (geo.position) setOrigin(geo.position)
  }

  // ─── Walk ────────────────────────────────────────────────────────────────
  const walk = phase.name === 'walking' || phase.name === 'finished' || phase.name === 'resume' ? phase.walk : null
  const measured = useMemo(() => (walk ? measureRoute(walk.route.coordinates) : null), [walk?.route])
  const walked = useMemo(
    () => (measured && walk && phase.name !== 'resume' ? sliceRoute(measured, walk.progressM) : []),
    [measured, walk?.progressM, phase.name],
  )

  const startWalk = (route: Route, color: string, walkTarget: Target) => {
    if (!origin) return
    const next: ActiveWalk = { route, color, origin, target: walkTarget, progressM: 0, startedAt: Date.now() }
    saveActiveWalk(next)
    setPhase({ name: 'walking', walk: next })
  }

  // Each new position moves Progress forward. After a screen lock, the first new position catches up.
  useEffect(() => {
    if (phase.name !== 'walking' || !measured || !geo.position) return
    const current = phase.walk
    const progressM = matchProgress(measured, geo.position, current.progressM)
    const next = progressM === current.progressM ? current : { ...current, progressM }
    if (isFinished(measured, geo.position, next.progressM, next.origin)) {
      saveActiveWalk(null)
      setPhase({ name: 'finished', walk: { ...next, progressM: measured.lengthM }, endedAt: Date.now() })
    } else if (next !== current) {
      saveActiveWalk(next)
      setPhase({ name: 'walking', walk: next })
    }
  }, [geo.position, measured, phase])

  useWakeLock(phase.name === 'walking')

  const endWalk = () => {
    if (!window.confirm('End this walk?')) return
    saveActiveWalk(null)
    backToSetup()
  }

  const backToSetup = () => {
    setOriginIsPin(false)
    setPhase({ name: 'setup', planning: false })
  }

  // ─── Map ─────────────────────────────────────────────────────────────────
  const planned = phase.name === 'results' ? phase.result : null
  const mapRoutes = useMemo<MapRoute[]>(() => {
    if (planned) {
      return resultRoutes(planned).map((r, i) => ({
        coordinates: r.coordinates,
        color: CANDIDATE_COLORS[i],
        arrows: r.shape === 'loop',
      }))
    }
    if (walk) return [{ coordinates: walk.route.coordinates, color: walk.color, arrows: walk.route.shape === 'loop' }]
    return []
    // Progress updates make a new walk object, but the Route and color stay the same.
  }, [planned, walk?.route, walk?.color])

  const originStatus: OriginStatus = originIsPin
    ? geo.position
      ? 'pin'
      : 'pin-no-location'
    : origin
      ? 'gps'
      : geo.error
        ? 'no-location'
        : 'locating'

  const setupActive = phase.name === 'setup' || phase.name === 'results'

  // ─── Control box ─────────────────────────────────────────────────────────
  let panel: ReactNode
  if (showSettings) {
    panel = (
      <SettingsPanel
        key={units}
        settings={settings}
        units={units}
        hasBuiltInKey={BUILT_IN_ORS_KEY !== ''}
        onChange={updateSettings}
        onClose={() => setShowSettings(false)}
      />
    )
  } else if (phase.name === 'setup') {
    panel = (
      <SetupPanel
        kind={kind}
        value={inputs[kind]}
        units={units}
        targetM={targetM}
        originStatus={originStatus}
        planning={phase.planning}
        error={error}
        onKind={setKind}
        onValue={(value) => setInputs((prev) => ({ ...prev, [kind]: value }))}
        onUseMyLocation={useMyLocation}
        onPlan={() => target && plan(target)}
        onSettings={() => setShowSettings(true)}
      />
    )
  } else if (phase.name === 'results') {
    const routes = resultRoutes(phase.result)
    panel = (
      <ResultsPanel
        result={phase.result}
        routes={routes}
        colors={CANDIDATE_COLORS}
        selected={phase.selected}
        showAll={phase.showAll}
        targetM={phase.targetM}
        units={units}
        settings={settings}
        onSelect={(selected) => setPhase({ ...phase, selected })}
        onShowAll={(showAll) => setPhase({ ...phase, showAll })}
        onStart={() => startWalk(routes[phase.selected], CANDIDATE_COLORS[phase.selected], phase.target)}
        onReplan={() => plan(phase.target)}
        onBack={() => setPhase({ name: 'setup', planning: false })}
        onSettings={() => setShowSettings(true)}
      />
    )
  } else if (phase.name === 'walking') {
    panel = (
      <WalkPanel walk={phase.walk} units={units} settings={settings} hasPosition={geo.position !== null} onEnd={endWalk} />
    )
  } else if (phase.name === 'finished') {
    panel = <FinishedPanel walk={phase.walk} endedAt={phase.endedAt} units={units} onDone={backToSetup} />
  } else {
    panel = (
      <ResumePanel
        walk={phase.walk}
        units={units}
        onResume={() => setPhase({ name: 'walking', walk: phase.walk })}
        onDiscard={() => {
          saveActiveWalk(null)
          backToSetup()
        }}
      />
    )
  }

  return (
    <div className="app">
      <MapView
        origin={origin}
        originDraggable={setupActive}
        onOriginChange={changeOrigin}
        onMapClick={phase.name === 'setup' && (geo.error || !origin) ? changeOrigin : undefined}
        routes={mapRoutes}
        selectedIndex={phase.name === 'results' ? phase.selected : 0}
        showAll={phase.name === 'results' && phase.showAll}
        walked={walked}
        position={geo.position}
        heading={geo.heading}
        follow={phase.name === 'walking'}
        fitKey={fitKey}
      />
      <section className="control-box" aria-label="Controls">
        {/* A new key per screen replays the entrance animation when the sign changes. */}
        <div key={showSettings ? 'settings' : phase.name} className="sign-content">
          {panel}
        </div>
      </section>
    </div>
  )
}
