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
// You'll import your rule helpers here as you wire up moves:
// import { canStackOnTableau, canMoveToFoundation } from './rules.js'

export function gameReducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME': {
      return dealNewGame()
    }

    case 'DRAW_STOCK': {
      // TODO: move the top card of `stock` to `waste`, flipping it faceUp.
      // When stock is empty, a click should recycle waste back into stock
      // (face down again). Return a NEW state — don't mutate.
      return state
    }

    case 'SELECT': {
      // TODO: record what the player tapped in state.selection.
      // action carries something like { source, column, index }.
      // If the same card is tapped again, clear the selection instead.
      return { ...state, selection: action.payload }
    }

    case 'MOVE_CARD': {
      // TODO: the core move. Using state.selection (the source) and action's
      // destination, check the relevant rule (canStackOnTableau /
      // canMoveToFoundation). If legal, move the card(s), flip a newly-exposed
      // tableau card faceUp, clear selection, and check for a win. If illegal,
      // just clear the selection.
      return state
    }

    case 'AUTO_MOVE': {
      // TODO (nice-to-have): on double-tap, try to send a card straight to a
      // valid foundation. Great polish, easy once MOVE_CARD works.
      return state
    }

    default:
      return state
  }
}

// Action creators — small helpers so components dispatch readable intents.
export const newGame = () => ({ type: 'NEW_GAME' })
export const drawStock = () => ({ type: 'DRAW_STOCK' })
export const select = (payload) => ({ type: 'SELECT', payload })
export const moveCard = (payload) => ({ type: 'MOVE_CARD', payload })
