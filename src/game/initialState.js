import { createDeck, shuffle } from './deck.js'
import { TABLEAU_COLUMNS, FOUNDATION_COUNT, MAX_HINTS } from './constants.js'

// The whole game is just a few piles of cards. Everything the UI shows is
// derived from this object.
//
// tableau:        array of 7 columns, each an array of cards (last = top, playable)
// foundations:    array of 4 piles, each an array of cards (last = top)
// stock:          face-down draw pile
// waste:          cards flipped up from stock (last = top, playable)
// selection:      which card/pile the player has currently tapped (for tap-to-move)
// hint:           the move currently suggested by the Hint button, if any
// hintsRemaining: how many hints are left this game

export function emptyState() {
  return {
    tableau: Array.from({ length: TABLEAU_COLUMNS }, () => []),
    foundations: Array.from({ length: FOUNDATION_COUNT }, () => []),
    stock: [],
    waste: [],
    selection: null, // e.g. { source: 'tableau', column: 2, index: 5 }
    hint: null, // e.g. { source: {...}, destination: {...} }
    hintsRemaining: MAX_HINTS,
    won: false,
  }
}

// Classic Klondike triangle deal: column i gets i+1 cards, only the last face up.
export function dealNewGame() {
  const deck = shuffle(createDeck())
  const state = emptyState()

  let cursor = 0
  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    const column = deck.slice(cursor, cursor + col + 1)
    cursor += col + 1
    column[column.length - 1] = { ...column[column.length - 1], faceUp: true }
    state.tableau[col] = column
  }

  state.stock = deck.slice(cursor)

  return state
}
