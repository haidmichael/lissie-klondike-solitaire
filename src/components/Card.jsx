import { SUIT_SYMBOLS, rankLabel, isRed } from '../game/constants.js'

// A single card. `onClick` and `selected` are wired up by the pile that owns it.
// `stackOffset` lets tableau columns fan cards downward.
export default function Card({ card, onClick, selected, stackOffset = 0 }) {
  if (!card.faceUp) {
    return (
      <div
        className="card card--back"
        style={{ top: `${stackOffset}px` }}
        onClick={onClick}
        aria-label="face-down card"
      />
    )
  }

  const red = isRed(card.suit)
  return (
    <div
      className={`card card--face ${red ? 'is-red' : 'is-black'} ${
        selected ? 'is-selected' : ''
      }`}
      style={{ top: `${stackOffset}px` }}
      onClick={onClick}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
    >
      <span className="card__corner card__corner--tl">
        {rankLabel(card.rank)}
        {SUIT_SYMBOLS[card.suit]}
      </span>
      <span className="card__pip">{SUIT_SYMBOLS[card.suit]}</span>
      <span className="card__corner card__corner--br">
        {rankLabel(card.rank)}
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  )
}
