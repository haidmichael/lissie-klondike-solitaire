import { useReducer, useEffect } from 'react'
import { gameReducer, newGame } from './game/reducer.js'
import { emptyState } from './game/initialState.js'
import Board from './components/Board.jsx'

export default function App() {
  // useReducer(reducerFn, initialState). `dispatch(action)` runs the reducer.
  const [state, dispatch] = useReducer(gameReducer, undefined, emptyState)

  // Deal a game on first mount.
  useEffect(() => {
    dispatch(newGame())
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="title">Rhino Solitaire</h1>
        <button className="btn" onClick={() => dispatch(newGame())}>
          New game
        </button>
      </header>

      {state.won && <div className="banner">You won. Nicely done.</div>}

      <Board state={state} dispatch={dispatch} />
    </div>
  )
}
