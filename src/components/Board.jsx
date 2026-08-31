import Card from './Card.jsx'
import { drawStock, select } from '../game/reducer.js'
import { SUIT_SYMBOLS } from '../game/constants.js'

// Board reads everything from `state` and renders it. As you implement the
// reducer, cards start appearing in these piles automatically.
//
// The tap-to-move interaction (recommended over drag on mobile) works like:
//   1. tap a card  -> dispatch(select(...))
//   2. tap a pile  -> dispatch(moveCard({ destination }))
// The wiring below dispatches SELECT; you'll add the destination taps as you
// build MOVE_CARD.

export default function Board({ state, dispatch }) {
  const { tableau, foundations, stock, waste, selection } = state

  const wasteTop = waste[waste.length - 1] ?? null

  return (
    <main className="board">
      {/* Top row: stock + waste on the left, foundations on the right */}
      <section className="board__top">
        <div className="board__left">
          {/* Stock: tap to draw. Shown as a face-down card, or an empty slot. */}
          <div className="pile pile--single" onClick={() => dispatch(drawStock())}>
            {stock.length > 0 ? (
              <div className="card card--back" />
            ) : (
              <div className="slot" aria-label="empty stock (tap waste to recycle)">
                ↻
              </div>
            )}
          </div>

          {/* Waste: only the top card is playable. */}
          <div className="pile pile--single">
            {wasteTop ? (
              <Card
                card={wasteTop}
                selected={selection?.source === 'waste'}
                onClick={() => dispatch(select({ source: 'waste' }))}
              />
            ) : (
              <div className="slot" aria-label="empty waste" />
            )}
          </div>
        </div>

        <div className="board__right">
          {foundations.map((pile, i) => {
            const top = pile[pile.length - 1] ?? null
            return (
              <div
                key={i}
                className="pile pile--single"
                onClick={() =>
                  dispatch(select({ source: 'foundation', pile: i, asDestination: true }))
                }
              >
                {top ? (
                  <Card card={top} />
                ) : (
                  <div className="slot slot--foundation">
                    {SUIT_SYMBOLS[['hearts', 'diamonds', 'clubs', 'spades'][i]]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Tableau: 7 columns, cards fanned downward. */}
      <section className="board__tableau">
        {tableau.map((column, colIndex) => (
          <div key={colIndex} className="column">
            {column.length === 0 && <div className="slot" />}
            {column.map((card, cardIndex) => (
              <Card
                key={card.id}
                card={card}
                stackOffset={cardIndex * 26}
                selected={
                  selection?.source === 'tableau' &&
                  selection?.column === colIndex &&
                  selection?.index === cardIndex
                }
                onClick={() =>
                  dispatch(
                    select({ source: 'tableau', column: colIndex, index: cardIndex })
                  )
                }
              />
            ))}
          </div>
        ))}
      </section>
    </main>
  )
}
