// Static facts about a deck of cards. No logic here — just the vocabulary
// the rest of the game speaks in.

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']

// Rank 1 = Ace, 11 = Jack, 12 = Queen, 13 = King.
// Using numbers (not 'A','J','Q','K') makes rule checks like "is this one higher?"
// simple arithmetic. We convert to a label only when displaying.
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

export const RED_SUITS = ['hearts', 'diamonds']

export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export const RANK_LABELS = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
}

// Klondike has 7 tableau columns and 4 foundations (one per suit).
export const TABLEAU_COLUMNS = 7
export const FOUNDATION_COUNT = 4

// Hints per game.
export const MAX_HINTS = 5

export function isRed(suit) {
  return RED_SUITS.includes(suit)
}

export function rankLabel(rank) {
  return RANK_LABELS[rank] ?? String(rank)
}
