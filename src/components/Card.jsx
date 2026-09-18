import { SUIT_SYMBOLS, rankLabel, isRed } from '../game/constants.js'

// A single card. `onClick` and `selected` are wired up by the pile that owns it.
// `stackOffset` lets tableau columns fan cards downward.
export default function Card({
  card,
  onClick,
  onDoubleClick,
  selected,
  hinted,
  hintDestination,
  stackOffset = 0,
  sideOffset = 0,
}) {
  if (!card.faceUp) {
    return (
      <div
        className={`card card--back ${hintDestination ? 'is-hint-destination' : ''}`}
        style={{ top: `${stackOffset}px`, left: `${sideOffset}px` }}
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
      } ${hinted ? 'is-hinted' : ''} ${hintDestination ? 'is-hint-destination' : ''}`}
      style={{ top: `${stackOffset}px`, left: `${sideOffset}px` }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
    >
      <span className="card__corner card__corner--tl">
        <span className='card__corner-rank'>{rankLabel(card.rank)}</span>
        <span className='card__corner-suit'>{SUIT_SYMBOLS[card.suit]}</span>
      </span>
      <span className="card__pip">{SUIT_SYMBOLS[card.suit]}</span>
      <span className="card__corner card__corner--br">
        <span className='card__corner-rank'>{rankLabel(card.rank)}</span>
        <span className='card__corner-suit'>{SUIT_SYMBOLS[card.suit]}</span>
      </span>
    </div>
  )
}
