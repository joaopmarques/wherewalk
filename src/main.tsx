import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import { loadActiveWalk } from './storage'
import './styles.css'

// Load a new version as soon as it is ready, except during a Walk. Then the new version
// waits, and it takes over the next time the app opens.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: () => {
    if (!loadActiveWalk()) updateSW(true)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
