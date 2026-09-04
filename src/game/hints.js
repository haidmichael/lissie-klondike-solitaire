import { canStackOnTableau, canMoveToFoundation, isValidRun } from './rules.js'

// Find one legal move, in priority order: foundation moves first (usually
// the best move), then waste-to-tableau, then tableau-to-tableau runs.
// Returns null if no legal move exists.
export function findHint(state) {
  const { tableau, foundations, waste } = state
  const wasteTop = waste[waste.length - 1] ?? null

  if (wasteTop) {
    const i = foundations.findIndex((pile) => canMoveToFoundation(wasteTop, pile[pile.length - 1] ?? null))
    if (i !== -1) {
      return { source: { source: 'waste' }, destination: { type: 'foundation', pile: i } }
    }
  }

  for (let col = 0; col < tableau.length; col++) {
    const top = tableau[col][tableau[col].length - 1] ?? null
    if (!top) continue
    const i = foundations.findIndex((pile) => canMoveToFoundation(top, pile[pile.length - 1] ?? null))
    if (i !== -1) {
      return {
        source: { source: 'tableau', column: col, index: tableau[col].length - 1 },
        destination: { type: 'foundation', pile: i },
      }
    }
  }

  if (wasteTop) {
    for (let col = 0; col < tableau.length; col++) {
      const top = tableau[col][tableau[col].length - 1] ?? null
      if (canStackOnTableau(wasteTop, top)) {
        return { source: { source: 'waste' }, destination: { type: 'tableau', column: col } }
      }
    }
  }

  for (let col = 0; col < tableau.length; col++) {
    const column = tableau[col]
    const firstFaceUp = column.findIndex((card) => card.faceUp)
    if (firstFaceUp === -1) continue

    for (let index = firstFaceUp; index < column.length; index++) {
      // isValidRun expects the playable/top card first (same convention as MOVE_CARD).
      if (!isValidRun([...column.slice(index)].reverse())) continue

      for (let destCol = 0; destCol < tableau.length; destCol++) {
        if (destCol === col) continue
        const top = tableau[destCol][tableau[destCol].length - 1] ?? null
        if (canStackOnTableau(column[index], top)) {
          return {
            source: { source: 'tableau', column: col, index },
            destination: { type: 'tableau', column: destCol },
          }
        }
      }
    }
  }

  return null
}

// Like findHint, but collects every legal move instead of stopping at the
// first one — used to cycle through all current options on a single hint use.
export function findAllHints(state) {
  const { tableau, foundations, waste } = state
  const moves = []
  const wasteTop = waste[waste.length - 1] ?? null

  // A card can only meaningfully go to one foundation at a time — canMoveToFoundation
  // doesn't require a suit match on an empty pile, so take the first match only
  // (otherwise an ace with 3 empty foundations open would show as 3 "different" moves).
  if (wasteTop) {
    const i = foundations.findIndex((pile) => canMoveToFoundation(wasteTop, pile[pile.length - 1] ?? null))
    if (i !== -1) {
      moves.push({ source: { source: 'waste' }, destination: { type: 'foundation', pile: i } })
    }
  }

  for (let col = 0; col < tableau.length; col++) {
    const top = tableau[col][tableau[col].length - 1] ?? null
    if (!top) continue
    const i = foundations.findIndex((pile) => canMoveToFoundation(top, pile[pile.length - 1] ?? null))
    if (i !== -1) {
      moves.push({
        source: { source: 'tableau', column: col, index: tableau[col].length - 1 },
        destination: { type: 'foundation', pile: i },
      })
    }
  }

  if (wasteTop) {
    for (let col = 0; col < tableau.length; col++) {
      const top = tableau[col][tableau[col].length - 1] ?? null
      if (canStackOnTableau(wasteTop, top)) {
        moves.push({ source: { source: 'waste' }, destination: { type: 'tableau', column: col } })
      }
    }
  }

  for (let col = 0; col < tableau.length; col++) {
    const column = tableau[col]
    const firstFaceUp = column.findIndex((card) => card.faceUp)
    if (firstFaceUp === -1) continue

    for (let index = firstFaceUp; index < column.length; index++) {
      if (!isValidRun([...column.slice(index)].reverse())) continue

      for (let destCol = 0; destCol < tableau.length; destCol++) {
        if (destCol === col) continue
        const top = tableau[destCol][tableau[destCol].length - 1] ?? null
        if (canStackOnTableau(column[index], top)) {
          moves.push({
            source: { source: 'tableau', column: col, index },
            destination: { type: 'tableau', column: destCol },
          })
        }
      }
    }
  }

  return moves
}
