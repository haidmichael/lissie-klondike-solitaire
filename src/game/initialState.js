import { createDeck, shuffle } from './deck.js'
import { TABLEAU_COLUMNS, FOUNDATION_COUNT } from './constants.js'

// The whole game is just a few piles of cards. Everything the UI shows is
// derived from this object.
//
// tableau:     array of 7 columns, each an array of cards (last = top, playable)
// foundations: array of 4 piles, each an array of cards (last = top)
// stock:       face-down draw pile
// waste:       cards flipped up from stock (last = top, playable)
// selection:   which card/pile the player has currently tapped (for tap-to-move)

export function emptyState() {
  return {
    tableau: Array.from({ length: TABLEAU_COLUMNS }, () => []),
    foundations: Array.from({ length: FOUNDATION_COUNT }, () => []),
    stock: [],
    waste: [],
    selection: null, // e.g. { source: 'tableau', column: 2, index: 5 }
    won: false,
  }
}

/**
 * Deal a fresh Klondike game.
 *
 * TODO (yours to implement): the classic deal is a triangle.
 *   - Column 0 gets 1 card, column 1 gets 2, ... column 6 gets 7. (28 cards total)
 *   - In each column, only the LAST card is face up; the rest stay face down.
 *   - The remaining 24 cards become the face-down `stock`.
 *
 * Steps:
 *   1. const deck = shuffle(createDeck())
 *   2. Build the empty state with emptyState()
 *   3. Deal the triangle into state.tableau, flipping each column's top card
 *      faceUp = true.
 *   4. Put the rest of the deck into state.stock.
 *   5. return state
 */
export function dealNewGame() {
  const deck = shuffle(createDeck())
  const state = emptyState()

  // --- your deal logic goes here ---
  // Temporary placeholder so the app renders piles before you implement this.
  // Delete this line once you write the real deal:
  state.stock = deck

  return state
}
