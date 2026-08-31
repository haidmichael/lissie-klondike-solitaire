import { useReducer, useEffect, useState } from 'react'
import { gameReducer, newGame, showHint, autoCompleteStep, isAutoCompletable } from './game/reducer.js'
import { emptyState } from './game/initialState.js'
import { MAX_HINTS } from './game/constants.js'
import Board from './components/Board.jsx'

export default function App() {
  // useReducer(reducerFn, initialState). `dispatch(action)` runs the reducer.
  const [state, dispatch] = useReducer(gameReducer, undefined, emptyState)

  // Draw-1 (easy) vs draw-3 (hard). Lives outside game state since it's a
  // setting, not part of a deal — switching it starts a fresh game.
  const [drawCount, setDrawCount] = useState(1)

  // Auto-complete prompt/animation state — UI-only, reset whenever a new game starts.
  const [autoCompleting, setAutoCompleting] = useState(false)
  const [autoCompleteDismissed, setAutoCompleteDismissed] = useState(false)

  function startNewGame() {
    dispatch(newGame())
    setAutoCompleting(false)
    setAutoCompleteDismissed(false)
  }

  // Deal a game on first mount.
  useEffect(() => {
    startNewGame()
  }, [])

  // Drive the auto-complete animation: one move per tick until won, or until
  // no move is available (the safety valve — shouldn't happen once triggered).
  useEffect(() => {
    if (!autoCompleting || state.won) return
    if (!isAutoCompletable(state)) {
      setAutoCompleting(false)
      return
    }
    const timer = setTimeout(() => dispatch(autoCompleteStep()), 200)
    return () => clearTimeout(timer)
  }, [autoCompleting, state])

  function changeDrawCount(count) {
    setDrawCount(count)
    startNewGame()
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="title">Rhino Solitaire</h1>
        <div className="topbar__controls">
          <div className="difficulty-toggle" role="group" aria-label="Draw difficulty">
            <button
              className={`btn btn--toggle ${drawCount === 1 ? 'is-active' : ''}`}
              onClick={() => changeDrawCount(1)}
            >
              Draw 1
            </button>
            <button
              className={`btn btn--toggle ${drawCount === 3 ? 'is-active' : ''}`}
              onClick={() => changeDrawCount(3)}
            >
              Draw 3
            </button>
          </div>
          <button className="btn" onClick={startNewGame}>
            New game
          </button>
        </div>
      </header>

      {state.won && <div className="banner">You won. Nicely done.</div>}

      {!state.won && !autoCompleting && !autoCompleteDismissed && isAutoCompletable(state) && (
        <div className="banner banner--prompt">
          All cards are playable — auto-complete the game?
          <div className="banner__actions">
            <button className="btn" onClick={() => setAutoCompleting(true)}>
              Yes
            </button>
            <button className="btn btn--ghost" onClick={() => setAutoCompleteDismissed(true)}>
              No
            </button>
          </div>
        </div>
      )}

      <Board state={state} dispatch={dispatch} drawCount={drawCount} />

      <footer className="hint-bar">
        <button
          className="btn"
          onClick={() => dispatch(showHint())}
          disabled={state.hintsRemaining <= 0}
        >
          Hint
        </button>
        <span className="hint-bar__count">
          {MAX_HINTS - state.hintsRemaining} of {MAX_HINTS} hints used
        </span>
      </footer>
    </div>
  )
}
