# Solitaire — React PWA + Express

Offline-capable Klondike Solitaire. A React front end (built with Vite) served
by a small Express server, deployable to Railway. Install it to your iPhone home
screen and it runs with no internet.

The **game logic is intentionally left for you to write** — the rules, the deal,
and the reducer moves are stubbed with guidance. The plumbing (build, PWA,
server, security) is done so nothing blocks you from the interesting part.

---

## Quick start

```bash
npm install
npm run dev        # Vite dev server — open the printed http://localhost:5173
```

Edit files under `src/` and the page hot-reloads. You do **not** run the Express
server during development — that's only for production/Railway.

To test the real production build locally:

```bash
npm run build      # outputs to dist/
npm start          # Express serves dist/ on http://localhost:8080
```

---

## What to build, in order

Each step leaves you with something runnable. Files to edit are noted.

1. **See the empty board.** Already done — `npm run dev` shows 7 columns, stock,
   waste, and 4 foundations. (`src/components/*`)
2. **Deal a real game.** Implement the triangle deal. → `src/game/initialState.js`
3. **Stock → waste.** Implement `DRAW_STOCK`. → `src/game/reducer.js`
4. **The rules.** Implement the three pure functions. → `src/game/rules.js`
5. **Moving cards.** Implement `SELECT` + `MOVE_CARD` using your rules, with
   tap-to-select / tap-to-place. → `src/game/reducer.js`
6. **Win + auto-move.** Detect a win; double-tap sends a card to its foundation.
7. **Install to your phone.** Deploy (below), then Add to Home Screen.

> Interaction tip: this scaffold uses **tap-to-move**, not drag-and-drop. HTML5
> drag is genuinely bad on touch screens — tapping a card then tapping a
> destination is less code and feels better on a phone.

---

## Project layout

```
src/
  game/                 ← pure logic, no React. Test-friendly.
    constants.js        ✅ suits, ranks, helpers
    deck.js             ✅ createDeck + Fisher-Yates shuffle
    initialState.js     ⛏️ deal a new game (your TODO)
    rules.js            ⛏️ pure move-legality functions (your TODO)
    reducer.js          ⛏️ (state, action) => newState (your TODOs)
  components/           ← React. Renders whatever is in state.
    Board.jsx, Card.jsx
  main.jsx, App.jsx, index.css
server/
  index.js              ✅ Express: serves dist/, security headers, /healthz
public/                 ✅ PWA icons (replace with your own art anytime)
```

`✅ = done`  `⛏️ = your turn`

---

## Git workflow (main + a branch per feature)

`main` stays deployable at all times. Every feature happens on its own branch and
merges back via a pull request. This mirrors how real teams work.

**One-time setup:**

```bash
git init
git add .
git commit -m "chore: scaffold solitaire PWA"
git branch -M main
git remote add origin git@github.com:YOUR_USER/solitaire.git
git push -u origin main
```

**For each feature** (map these to the build-order steps above):

```bash
git checkout main
git pull                              # start from latest main
git checkout -b feat/deal-new-game    # branch named for the feature

# ...write code, commit as you go...
git add .
git commit -m "feat: deal a Klondike triangle"

git push -u origin feat/deal-new-game
# open a Pull Request on GitHub, review your own diff, then Merge.

git checkout main && git pull         # bring the merge back down locally
```

Suggested branch names: `feat/deal-new-game`, `feat/draw-stock`,
`feat/move-rules`, `feat/tap-to-move`, `feat/win-detection`, `feat/pwa-install`.

Commit message convention (optional but tidy): `feat:` new feature,
`fix:` bug fix, `chore:` tooling/config, `docs:` documentation, `style:` CSS.

---

## Deploying to Railway

Railway builds and runs the Express server; it gives you an HTTPS URL (which is
what iOS requires for the offline install to work).

1. Push your repo to GitHub (above).
2. In Railway: **New Project → Deploy from GitHub repo** → pick this repo.
3. Railway auto-detects Node. Confirm these settings:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
4. Add an environment variable: `NODE_ENV = production`.
   (Do **not** set `PORT` — Railway provides it; the server reads it.)
5. Deploy. Open the generated `https://…up.railway.app` URL.
6. On your iPhone, open that URL in **Safari** → Share → **Add to Home Screen**.
   Launch it once online so the service worker caches everything, then turn off
   WiFi to confirm it still runs.

Optional: point Railway's health check at `/healthz`.

---

## Security practices in this project

A solitaire game has almost no attack surface — no accounts, no database, no user
input sent anywhere. So this isn't about defending secrets; it's about building
habits that matter the moment a project *does* handle real data. What's set up:

- **`helmet`** sets HTTP security headers: a Content-Security-Policy (restricts
  where scripts/styles/images may load from — tuned so the PWA still works),
  `X-Frame-Options` / `frame-ancestors: none` (blocks clickjacking via iframes),
  `X-Content-Type-Options: nosniff`, and HSTS. See `server/index.js`.
- **`express-rate-limit`** caps requests per IP — cheap insurance against abuse.
- **`.gitignore` + `.env.example`** — secrets live in `.env` (gitignored) and are
  never committed. `.env.example` documents which vars exist, with no real
  values. Get in the habit now; it's the #1 way credentials leak on GitHub.
- **`trust proxy` set to 1** — Railway runs behind a proxy; this reads the real
  client IP for rate limiting without trusting spoofable headers.
- **Cache headers** — hashed assets cache hard; `index.html` is `no-cache` so
  users never get stuck on a stale version.
- **`compression`** — not security, but smaller payloads load faster on phones.

Run `npm audit` occasionally to catch known-vulnerable dependencies. When you
later add real features (scores server-side, accounts, etc.), the things to reach
for are input validation, auth, and never trusting client data — but you don't
need any of that for offline solitaire.
