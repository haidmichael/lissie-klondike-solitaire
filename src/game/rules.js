// -----------------------------------------------------------------------------
// RULES — pure functions. This is the heart of the game and the best thing to
// implement yourself.
//
// "Pure" means: given the same inputs, always the same output, and no side
// effects (no mutating arguments, no reading anything outside the arguments).
// Pure functions are trivial to test — you'll appreciate this pattern a lot in
// backend/API work, where the same discipline keeps request handlers sane.
//
// Each function below throws until you implement it, so you can't accidentally
// ship a stub. Delete the throw and return the real boolean.
// -----------------------------------------------------------------------------

import { isRed } from './constants.js'

/**
 * Can `card` be placed on top of a TABLEAU column?
 *
 * Rules:
 *  - If the column is empty, only a King (rank 13) may be placed.
 *  - Otherwise the card must be ONE lower than the target's top card AND the
 *    OPPOSITE color (red on black / black on red).
 *
 * @param {Object} card        the card you're trying to move
 * @param {Object|null} target the current top card of the column (null if empty)
 * @returns {boolean}
 */
export function canStackOnTableau(card, target) {
    if (!target) return card.rank === 13
    return card.rank === target.rank - 1 && isRed(card.suit) !== isRed(target.suit)
}

/**
 * Can `card` be moved onto a FOUNDATION pile?
 *
 * Rules:
 *  - If the foundation is empty, only an Ace (rank 1) may start it.
 *  - Otherwise the card must be the SAME suit and exactly ONE higher than the
 *    foundation's current top card.
 *
 * @param {Object} card             the card you're trying to move
 * @param {Object|null} foundationTop the top card of that foundation (null if empty)
 * @returns {boolean}
 */
export function canMoveToFoundation(card, foundationTop) {
    if (!foundationTop) return card.rank === 1
    return card.suit === foundationTop.suit && card.rank === foundationTop.rank + 1
}

/**
 * When moving a run of cards between tableau columns, the run must already be a
 * valid descending, alternating-color sequence. Given an ordered array of cards
 * (top of the visible stack downward), is it a legal movable run?
 *
 * @param {Object[]} run
 * @returns {boolean}
 */
export function isValidRun(run) {
  if (run.length <= 1) return true

  for (let i = 0; i < run.length - 1; i++) {  
    const card = run[i]
    const target = run[i + 1]
    if (!canStackOnTableau(card, target)) {
      return false
    }
  }

  return true
}
