import { useEffect } from 'react'

// A simple modal: no router in this app, so "Settings" is just another
// conditionally-rendered piece of App's JSX, same pattern as the
// auto-complete prompt banner.
export default function Settings({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="settings-close" onClick={onClose} aria-label="Close settings">
          ×
        </button>

        <h2 className="settings-heading">Features</h2>
        <ul className="settings-list">
          <li>
            <strong>Draw 1 / Draw 3</strong> — pick your difficulty from the
            top bar. Draw 3 fans the last few waste cards out; only the top
            one is playable.
          </li>
          <li>
            <strong>Tap to play</strong> — tap a card to select it (and
            everything stacked on it), then tap a foundation or tableau
            column to move it there.
          </li>
          <li>
            <strong>Double-click auto-move</strong> — sends a card, or a
            whole valid run, straight to a foundation or a legal tableau
            spot.
          </li>
          <li>
            <strong>Hints</strong> — up to 5 per game. Each use highlights
            every currently legal move, one at a time.
          </li>
          <li>
            <strong>Auto-complete</strong> — once every card is face up, the
            app offers to finish the game for you.
          </li>
          <li>
            <strong>Works offline</strong> — once installed, no internet
            connection needed to play.
          </li>
        </ul>

        <h2 className="settings-heading">Add to your Home Screen</h2>
        <p className="settings-subheading">iOS (Safari)</p>
        <ol className="settings-list settings-list--ordered">
          <li>Open this page in Safari.</li>
          <li>Tap the Share button.</li>
          <li>Tap "Add to Home Screen".</li>
        </ol>
        <p className="settings-subheading">Android (Chrome)</p>
        <ol className="settings-list settings-list--ordered">
          <li>Open this page in Chrome.</li>
          <li>Tap the ⋮ menu.</li>
          <li>Tap "Add to Home Screen" (or "Install app").</li>
        </ol>
        <p className="settings-note">
          Launch it once while online so it finishes caching, then it works
          fully offline from then on.
        </p>
      </div>
    </div>
  )
}
