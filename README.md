# Where2Walk

Where2Walk plans a walk that starts and ends where you are. You give a Target as a time, a distance, or a step count. Where2Walk plans a Loop of that length, and you follow it on the map.

Live at <https://where2walk.jpmarqu.es>.

The domain words (Origin, Route, Loop, Target, Candidate, Progress) are defined in [CONTEXT.md](CONTEXT.md).
Working with an AI agent? Start at [AGENTS.md](AGENTS.md).

## How it works

- The app runs only in the browser. It has no server and no accounts.
- [OpenRouteService](https://openrouteservice.org) (ORS) plans the walking routes.
- [OpenFreeMap](https://openfreemap.org) supplies the map tiles, drawn with [MapLibre GL](https://maplibre.org).
- Settings and the active Walk stay in `localStorage` on the device.

## Set up

1. Get a free ORS key at <https://openrouteservice.org/dev/#/signup>.
2. Copy `.env.example` to `.env.local`.
3. Paste the key after `VITE_ORS_KEY=`.
4. Use Node 26 (`nvm use`) and run `pnpm install`.
5. Run `pnpm dev`, then open <http://localhost:5173>.

The key in `.env.local` becomes the built-in shared key. Each Walker can also paste their own key in the app settings. Their own key overrides the built-in key.

## Commands

| Command | Action |
|---|---|
| `pnpm dev` | Start the dev server. |
| `pnpm check` / `pnpm fix` | Lint and format with Ultracite (Biome). |
| `pnpm typecheck` | Type-check. |
| `pnpm test` | Run the unit tests, and every story as a browser test with axe. |
| `pnpm test:visual` | Compare every story with its screenshot, in Docker. |
| `pnpm storybook` | Open Storybook at <http://localhost:6006>. |
| `pnpm build` | Type-check and build the static site into `dist/`. |
| `pnpm preview` | Serve the built site. |

`pnpm test` needs Chromium once: `pnpm exec playwright install chromium`.
`pnpm test:visual` needs Docker. See [testing](.agents/docs/testing.md).

## Design system

Tailwind v4, with tokens in `src/ui/tokens.css`, and shadcn primitives on Base UI in `src/ui/`. See [design-system](.agents/docs/design-system.md), or the Foundations page in Storybook.

## Test on a phone

Browsers give GPS positions only on `https://` pages or on `localhost`. A phone on your local network cannot use `http://<your-ip>:5173`. To test on a phone, deploy the site, or use an HTTPS tunnel to the dev server.

## Deploy

The app runs on Vercel as the project `wherewalk`, in the personal `jpmarques` scope. The domain `where2walk.jpmarqu.es` has a CNAME record at GoDaddy that points to Vercel.

With the Vercel Git integration on, a merge to `main` deploys production. To deploy by hand, run `npx vercel deploy --prod --scope jpmarques`.

`VITE_ORS_KEY` is set in the Vercel project for Production and Preview. `npm run build` makes a plain static site in `dist/`, so any other static host also works.

## About the built-in key

The built-in key is visible to anyone who opens the page source. This is a deliberate trade-off for a client-only app with about 30 users. If someone misuses the key, make a new key in the ORS dashboard and redeploy.

## Limits

- The free ORS plan allows about 2,000 route requests per day and 40 per minute. Everyone who uses the built-in key shares both limits.
- One plan uses 5 requests in a dense street grid, and up to 30 in an area with few streets. There, ORS returns Loops much longer than asked, and the planner asks again with corrected lengths.
- A Walker who hits the limits often can paste their own free key in settings.
- ORS does not plan round trips longer than 100 km.
- A web page cannot track GPS while the screen is locked. The app keeps the screen on during a Walk. After a lock, Progress catches up on the next GPS position.
