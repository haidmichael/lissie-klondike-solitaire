import { useState, useRef, useEffect, useCallback } from 'react'

// Pointer-based drag for cards. Works with both mouse and touch (Pointer Events),
// so it runs on desktop AND iPhone — unlike native HTML5 drag, which iOS ignores.
//
// How it coexists with tap-to-move: a press only becomes a *drag* once the pointer
// moves past DRAG_THRESHOLD pixels. Below that it's a *tap*, and your existing
// onClick handlers run as before. After a real drag, `consumedDrag()` lets the
// board swallow the click that the browser fires next, so a drag never also
// triggers a tap-move.
//
// `onDrop(source, destination)` is called when a drag ends over a valid pile.
//   source      — same shape your reducer expects: { source:'tableau', column, index } | { source:'waste' }
//   destination — { type:'tableau', column } | { type:'foundation', pile }

const DRAG_THRESHOLD = 6

export function useDrag({ onDrop }) {
  // null when idle; otherwise the floating ghost's data + position.
  const [drag, setDrag] = useState(null)
  // Info captured on press, before we know if it's a tap or a drag.
  const pending = useRef(null)
  // True once the current interaction has crossed the drag threshold.
  const didDrag = useRef(false)

  const startPress = useCallback((e, source, run) => {
    // Ignore right/middle mouse buttons; allow touch (button is 0 or undefined).
    if (e.button != null && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    pending.current = {
      source,
      run, // the cards to show in the ghost (visual only; the reducer recomputes the real run)
      startX: e.clientX,
      startY: e.clientY,
      grabX: e.clientX - rect.left, // where on the card you grabbed, so it doesn't jump
      grabY: e.clientY - rect.top,
    }
    didDrag.current = false
  }, [])

  useEffect(() => {
    function onMove(e) {
      const p = pending.current
      if (!p) return
      if (!didDrag.current) {
        const moved = Math.hypot(e.clientX - p.startX, e.clientY - p.startY)
        if (moved < DRAG_THRESHOLD) return // still might be a tap
        didDrag.current = true
      }
      e.preventDefault() // stop the page scrolling while dragging on touch
      setDrag({
        source: p.source,
        run: p.run,
        x: e.clientX - p.grabX,
        y: e.clientY - p.grabY,
      })
    }

    function onUp(e) {
      const p = pending.current
      pending.current = null
      if (!p || !didDrag.current) {
        setDrag(null) // it was a tap — let the click handlers do their thing
        return
      }
      // Which pile is under the drop point? Walk up from the topmost element to
      // the nearest element carrying a data-drop marker. (The ghost has
      // pointer-events:none, so it's invisible to this hit-test.)
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const dropEl = el && el.closest('[data-drop]')
      let destination = null
      if (dropEl) {
        const type = dropEl.getAttribute('data-drop')
        if (type === 'tableau') {
          destination = { type: 'tableau', column: Number(dropEl.getAttribute('data-column')) }
        } else if (type === 'foundation') {
          destination = { type: 'foundation', pile: Number(dropEl.getAttribute('data-pile')) }
        }
      }
      setDrag(null)
      if (destination) onDrop(p.source, destination)
      // didDrag stays true so the click that follows gets consumed (see consumedDrag).
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onDrop])

  // Call at the top of an onClick: returns true (and clears the flag) if the
  // click is the tail end of a drag and should be ignored.
  const consumedDrag = useCallback(() => {
    if (didDrag.current) {
      didDrag.current = false
      return true
    }
    return false
  }, [])

  return { drag, startPress, consumedDrag }
}