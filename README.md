# Lissie's Solitaire

An offline-capable Klondike Solitaire game, built as an installable Progressive
Web App. Add it to your phone's home screen and play with no internet
connection — no accounts, no ads, no tracking.

## Features

- Classic Klondike solitaire — 7-column triangle deal, 4 foundations
- **Draw 1 / Draw 3** difficulty toggle, with a fanned-card waste pile in
  Draw 3 mode
- Tap-to-select, tap-to-place moves, including multi-card run moves
- **Double-click auto-move** — sends a card, or a whole valid run, straight
  to a foundation or a legal tableau spot
- **Hints** — up to 5 per game; each use highlights every currently legal
  move, one at a time
- **Auto-complete** — once every card is face up, the app offers to finish
  the game for you, animating each move
- Fully playable offline once installed — the service worker precaches the
  entire app

## Tech stack

- **Frontend:** React 18 + Vite, `vite-plugin-pwa` for offline support and
  the install manifest
- **Server:** Express, serving the production build with `helmet` (security
  headers / CSP), `compression`, and `express-rate-limit`
- **Deployment:** Railway

## Local development

```bash
npm install
npm run dev
```

Opens the Vite dev server (default `http://localhost:5173`) with hot reload.
The Express server isn't used in development — only for production.

To exercise the actual production build locally:

```bash
npm run build   # outputs to dist/
npm start       # Express serves dist/ on http://localhost:8080
```

## Scripts

| Command           | What it does                                  |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Vite dev server with hot reload                |
| `npm run build`    | Production build to `dist/`                    |
| `npm run preview`  | Preview the production build via Vite          |
| `npm start`        | Run the Express server against `dist/`         |

## Deploying to Railway

1. Push to GitHub.
2. Railway → **New Project → Deploy from GitHub repo**.
3. Confirm build command `npm run build` and start command `npm start`.
4. Set the `NODE_ENV=production` environment variable. Don't set `PORT` —
   Railway provides it.
5. Optional: point Railway's health check at `/healthz`.

## Installing on your phone

Open the deployed HTTPS URL in Safari (iOS) or Chrome (Android), then
**Share → Add to Home Screen**. Launch it once while online so the service
worker finishes caching, then it works fully offline from then on.

## Project layout

```
src/
  game/          Pure game logic — no React, easy to reason about and test
    constants.js   Suits, ranks, labels
    deck.js        Deck creation + shuffle
    initialState.js Deal a new game
    rules.js        Move-legality checks (stacking, foundations, runs)
    hints.js        Legal-move search, used by the Hint button
    reducer.js      (state, action) => newState — the only place state changes
  components/     React — renders whatever is in state
    Board.jsx, Card.jsx
  main.jsx, App.jsx, index.css
server/
  index.js        Express: serves dist/, security headers, /healthz
public/           PWA icons and favicon
```

## Security

This is a client-side card game with no accounts, no database, and no user
data sent anywhere — the attack surface is small. What's in place anyway:

- **`helmet`** sets a Content-Security-Policy, `frame-ancestors: none`
  (clickjacking protection), `X-Content-Type-Options: nosniff`, and HSTS.
- **`express-rate-limit`** caps requests per IP.
- Secrets, if any get added later, belong in a gitignored `.env`;
  `.env.example` documents the variables with no real values.
- `trust proxy` is set to `1` (not `true`) so rate limiting reads the real
  client IP behind Railway's proxy without trusting spoofable headers.
- Hashed build assets cache hard; `index.html` stays `no-cache` so a new
  deploy doesn't leave anyone stuck on a stale version.

Run `npm audit` periodically to catch newly-disclosed dependency
vulnerabilities.

## License

MIT — see [LICENSE](./LICENSE).
