# Deploy

- Host: Vercel, project `wherewalk`, scope `jpmarques`.
- Domain: `where2walk.jpmarqu.es`. A CNAME at GoDaddy points to Vercel.
- `VITE_ORS_KEY` is set in Vercel for Production and Preview.
- `pnpm build` makes a plain static site in `dist/`. Any static host works.

## Flow

With the Vercel Git integration on, a PR gets a preview URL and a merge to `main` deploys production.
Preview URLs are HTTPS, so GPS works on a phone. `http://<your-ip>:5173` does not work, because browsers give GPS only on HTTPS or localhost.

Manual fallback: `npx vercel deploy --prod --scope jpmarques`.

## The PWA

A new version takes over when it installs. The page reloads, except during a Walk. `main.tsx` decides.
The service worker caches only the app shell. Tiles and routes always come from the network.
