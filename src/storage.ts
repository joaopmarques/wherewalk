import { DEFAULT_PACE_KMH, DEFAULT_STRIDE_M } from './domain/target'
import type { LngLat, Route, Target, WalkerSettings } from './domain/types'

const SETTINGS_KEY = 'wherewalk.settings'
const WALK_KEY = 'wherewalk.walk'

export const DEFAULT_SETTINGS: WalkerSettings = {
  paceKmh: DEFAULT_PACE_KMH,
  strideM: DEFAULT_STRIDE_M,
  units: 'auto',
  orsKey: '',
}

/** The Walk the Walker is following. It survives a screen lock and a tab reload. */
export interface ActiveWalk {
  route: Route
  color: string
  origin: LngLat
  target: Target
  progressM: number
  startedAt: number
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked, for example in a private window. The app still works without it.
  }
}

export const loadSettings = (): WalkerSettings => ({ ...DEFAULT_SETTINGS, ...read<Partial<WalkerSettings>>(SETTINGS_KEY) })
export const saveSettings = (settings: WalkerSettings) => write(SETTINGS_KEY, settings)

export const loadActiveWalk = (): ActiveWalk | null => read<ActiveWalk>(WALK_KEY)
export const saveActiveWalk = (walk: ActiveWalk | null) => write(WALK_KEY, walk)
