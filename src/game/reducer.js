// -----------------------------------------------------------------------------
// REDUCER — the single place game state changes.
//
// A reducer is just: (currentState, action) => newState. React's useReducer
// hook calls this for you when you `dispatch(action)`. This is the same shape
// as a lot of backend request handling: an incoming message describes an intent,
// and you return the new state of the world. Learn it well here.
//
// Golden rule: NEVER mutate `state`. Always return a new object (spread the bits
// you change). Mutating React state causes bugs that are miserable to track down.
// -----------------------------------------------------------------------------

import { dealNewGame } from './initialState.js'
import { canStackOnTableau, canMoveToFoundation, isValidRun } from './rules.js'
import { findAllHints } from './hints.js'

function checkWin(state) {
  return state.foundations.every((pile) => pile.length === 13)
}

// True once every card is visible (no face-down tableau cards, stock/waste
// empty) — past this point the game can always be finished by simply feeding
// cards to the foundations.
export function isAutoCompletable(state) {
  if (state.stock.length > 0 || state.waste.length > 0) return false
  return state.tableau.every((column) => column.every((card) => card.faceUp))
}

// Pop the card off its source pile, flipping a newly-exposed tableau card faceUp.
// Shared by MOVE_CARD and AUTO_MOVE so the two stay in sync.
function removeFromSource(state, source) {
  const newTableau = state.tableau.map((col) => [...col])
  let newWaste = state.waste

  if (source.source === 'tableau') {
    newTableau[source.column] = newTableau[source.column].slice(0, source.index)
    const remaining = newTableau[source.column]
    if (remaining.length > 0) {
      remaining[remaining.length - 1] = { ...remaining[remaining.length - 1], faceUp: true }
    }
  } else {
    newWaste = state.waste.slice(0, -1)
  }

  return { tableau: newTableau, waste: newWaste }
}

export function gameReducer(state, action) {
  // A hint is only relevant until the player's next move.
  if (action.type !== 'SHOW_HINT' && action.type !== 'CYCLE_HINT' && action.type !== 'NEW_GAME' && state.hint) {
    state = { ...state, hint: null, hintMoves: [], hintCycleIndex: 0 }
  }

  switch (action.type) {
    case 'NEW_GAME': {
      return dealNewGame()
    }

    case 'DRAW_STOCK': {
      const { stock, waste } = state
      const count = action.payload?.count ?? 1
      if (stock.length > 0) {
        const drawn = stock.slice(-count).map((card) => ({ ...card, faceUp: true }))
        return {
          ...state,
          stock: stock.slice(0, -count),
          waste: [...waste, ...drawn],
        }
      } else {
        const recycled = waste.map((card) => ({ ...card, faceUp: false })).reverse()
        return {
          ...state,
          stock: recycled,
          waste: [],
        }
      }
    }

    case 'SELECT': {
      const payload = action.payload

      if (payload.source === 'tableau') {
        const card = state.tableau[payload.column][payload.index]
        if (!card || !card.faceUp) return state
      } else if (payload.source === 'waste') {
        if (state.waste.length === 0) return state
      } else {
        return state
      }

      const isSame =
        state.selection?.source === payload.source &&
        state.selection?.column === payload.column &&
        state.selection?.index === payload.index

      return { ...state, selection: isSame ? null : payload }
    }

    case 'MOVE_CARD': {
      const { selection } = state
      if (!selection) return state

      const { destination } = action.payload

      const run =
        selection.source === 'tableau'
          ? state.tableau[selection.column].slice(selection.index)
          : state.waste.slice(-1)

      const movingCard = run[0]

      let legal = false
      if (destination.type === 'foundation') {
        const pile = state.foundations[destination.pile]
        const top = pile[pile.length - 1] ?? null
        legal = run.length === 1 && canMoveToFoundation(movingCard, top)
      } else if (destination.type === 'tableau') {
        const column = state.tableau[destination.column]
        const top = column[column.length - 1] ?? null
        // isValidRun expects the playable/top card first; `run` here is in
        // tableau-array order (base card first), so reverse for the check.
        legal = isValidRun([...run].reverse()) && canStackOnTableau(movingCard, top)
      }

      if (!legal) {
        return { ...state, selection: null }
      }

      const { tableau: newTableau, waste: newWaste } = removeFromSource(state, selection)
      const newFoundations = state.foundations.map((pile) => [...pile])

      if (destination.type === 'tableau') {
        newTableau[destination.column] = [...newTableau[destination.column], ...run]
      } else {
        newFoundations[destination.pile] = [...newFoundations[destination.pile], ...run]
      }

      const newState = {
        ...state,
        tableau: newTableau,
        waste: newWaste,
        foundations: newFoundations,
        selection: null,
      }
      newState.won = checkWin(newState)
      return newState
    }

    case 'AUTO_MOVE': {
      const source = action.payload
      let card

      if (source.source === 'tableau') {
        const column = state.tableau[source.column]
        if (source.index !== column.length - 1) return state
        card = column[column.length - 1]
      } else if (source.source === 'waste') {
        if (state.waste.length === 0) return state
        card = state.waste[state.waste.length - 1]
      } else {
        return state
      }

      const foundationIndex = state.foundations.findIndex((pile) => {
        const top = pile[pile.length - 1] ?? null
        return canMoveToFoundation(card, top)
      })
      if (foundationIndex === -1) return state

      const { tableau: newTableau, waste: newWaste } = removeFromSource(state, source)
      const newFoundations = state.foundations.map((pile) => [...pile])
      newFoundations[foundationIndex] = [...newFoundations[foundationIndex], card]

      const newState = {
        ...state,
        tableau: newTableau,
        waste: newWaste,
        foundations: newFoundations,
        selection: null,
      }
      newState.won = checkWin(newState)
      return newState
    }

    case 'AUTO_COMPLETE_STEP': {
      for (let col = 0; col < state.tableau.length; col++) {
        const column = state.tableau[col]
        const top = column[column.length - 1] ?? null
        if (!top) continue
        const foundationIndex = state.foundations.findIndex((pile) =>
          canMoveToFoundation(top, pile[pile.length - 1] ?? null)
        )
        if (foundationIndex === -1) continue

        const { tableau: newTableau, waste: newWaste } = removeFromSource(state, {
          source: 'tableau',
          column: col,
          index: column.length - 1,
        })
        const newFoundations = state.foundations.map((pile) => [...pile])
        newFoundations[foundationIndex] = [...newFoundations[foundationIndex], top]

        const newState = {
          ...state,
          tableau: newTableau,
          waste: newWaste,
          foundations: newFoundations,
          selection: null,
        }
        newState.won = checkWin(newState)
        return newState
      }
      return state // no move found — the caller treats an unchanged state as "stop"
    }

    case 'SHOW_HINT': {
      if (state.hintsRemaining <= 0) return state
      const moves = findAllHints(state)
      if (moves.length === 0) return state
      return {
        ...state,
        hint: moves[0],
        hintMoves: moves,
        hintCycleIndex: 0,
        hintsRemaining: state.hintsRemaining - 1,
      }
    }

    case 'CYCLE_HINT': {
      if (state.hintMoves.length === 0) return state
      const nextIndex = state.hintCycleIndex + 1
      if (nextIndex >= state.hintMoves.length) {
        return { ...state, hint: null, hintMoves: [], hintCycleIndex: 0 }
      }
      return { ...state, hint: state.hintMoves[nextIndex], hintCycleIndex: nextIndex }
    }

    default:
      return state
  }
}

// Action creators — small helpers so components dispatch readable intents.
export const newGame = () => ({ type: 'NEW_GAME' })
export const drawStock = (count = 1) => ({ type: 'DRAW_STOCK', payload: { count } })
export const select = (payload) => ({ type: 'SELECT', payload })
export const moveCard = (payload) => ({ type: 'MOVE_CARD', payload })
export const autoMove = (payload) => ({ type: 'AUTO_MOVE', payload })
export const showHint = () => ({ type: 'SHOW_HINT' })
export const cycleHint = () => ({ type: 'CYCLE_HINT' })
export const autoCompleteStep = () => ({ type: 'AUTO_COMPLETE_STEP' })
