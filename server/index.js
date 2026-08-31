// -----------------------------------------------------------------------------
// Express server — serves the built React PWA (the `dist/` folder).
//
// In development you DON'T run this: you run `npm run dev` (Vite's dev server).
// This server is for production / Railway, where it serves the static build
// and adds the security headers a public-facing app should have.
//
// Flow on Railway:
//   1. Railway runs `npm run build`  -> produces dist/
//   2. Railway runs `npm start`      -> runs THIS file
//   3. Railway sets process.env.PORT -> we must listen on it (don't hardcode)
// -----------------------------------------------------------------------------

import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, '..', 'dist')

const app = express()
const isProd = process.env.NODE_ENV === 'production'

// Railway sits behind a proxy. This makes req.ip / rate limiting see the real
// client IP instead of the proxy's. Keep it at 1 (trust the first hop) rather
// than `true`, which trusts any spoofed X-Forwarded-For header.
app.set('trust proxy', 1)

// --- Security headers (helmet) ----------------------------------------------
// helmet sets a bundle of sensible HTTP security headers. The one bit that
// needs care for a PWA is the Content-Security-Policy: the service worker and
// inlined styles Vite produces need to be allowed, or the app breaks.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Vite injects a couple of small inline scripts/styles in the built HTML.
        // 'unsafe-inline' for style is the pragmatic choice for a static app;
        // tightening this with hashes is a good later exercise.
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"], // don't allow this app to be iframed (clickjacking)
      },
    },
    // Let the browser fetch the manifest/icons cross-origin-safely.
    crossOriginEmbedderPolicy: false,
  })
)

// --- Compression -------------------------------------------------------------
// gzip responses. Smaller payloads = faster first load on a phone.
app.use(compression())

// --- Rate limiting -----------------------------------------------------------
// A static game barely needs this, but it's a good habit and cheap insurance
// against someone hammering the server. Tune numbers to taste.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
  })
)

// --- Health check ------------------------------------------------------------
// A tiny JSON endpoint. Railway can ping it to confirm the app is alive, and
// it's a gentle first taste of building an API route in Express.
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// --- Static files ------------------------------------------------------------
// Serve everything in dist/. Hashed asset filenames can be cached hard;
// index.html must NOT be cached long or users get stuck on old versions.
app.use(
  express.static(DIST_DIR, {
    maxAge: isProd ? '1y' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    },
  })
)

// --- SPA fallback ------------------------------------------------------------
// Any route that isn't a real file returns index.html so the React app can
// handle it. (Solitaire has no routing yet, but this is the correct default.)
app.get('*', (_req, res) => {
  res.sendFile(join(DIST_DIR, 'index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Solitaire server listening down here on port ${PORT} (prod=${isProd})`)
})
