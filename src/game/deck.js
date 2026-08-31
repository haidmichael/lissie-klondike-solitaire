import { SUITS, RANKS } from './constants.js'

// A card is a plain object. `id` is a stable unique key React uses for lists.
// `faceUp` tracks whether the player can see it.
//   { id: 'hearts-13', suit: 'hearts', rank: 13, faceUp: false }

export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      })
    }
  }
  return deck // 52 cards, ordered
}

// Fisher-Yates shuffle. Returns a NEW array — never mutates the input, which
// keeps things predictable when you later feed this into a reducer.
export function shuffle(cards) {
  const out = [...cards]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
