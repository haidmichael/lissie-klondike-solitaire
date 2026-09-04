import Card from './Card.jsx'
import { drawStock, select, moveCard, autoMove } from '../game/reducer.js'
import { SUIT_SYMBOLS } from '../game/constants.js'

// Board reads everything from `state` and renders it: tap a card to select it
// (and everything below it, in the tableau), tap a pile to move the selection there.

export default function Board({ state, dispatch, drawCount }) {
  const { tableau, foundations, stock, waste, selection, hint } = state

  const wasteTop = waste[waste.length - 1] ?? null
  // Draw-3 mode peeks the last 3 drawn cards fanned out; only the top one is playable.
  const wasteFan = drawCount === 3 ? waste.slice(-3) : wasteTop ? [wasteTop] : []

  return (
    <main className="board">
      {/* Top row: stock + waste on the left, foundations on the right */}
      <section className="board__top">
        <div className="board__left">
          {/* Stock: tap to draw. Shown as a face-down card, or an empty slot. */}
          <div className="pile pile--single" onClick={() => dispatch(drawStock(drawCount))}>
            {stock.length > 0 ? (
              <div className="card card--back" />
            ) : (
              <div className="slot" aria-label="empty stock (tap waste to recycle)">
                ↻
              </div>
            )}
          </div>

          {/* Waste: only the top card is playable; draw-3 fans out the last 3. */}
          <div className={`pile pile--single ${drawCount === 3 ? 'pile--fan' : ''}`}>
            {wasteFan.length > 0 ? (
              wasteFan.map((card, i) => {
                const isTop = i === wasteFan.length - 1
                return (
                  <Card
                    key={card.id}
                    card={card}
                    sideOffset={i * 14}
                    selected={isTop && selection?.source === 'waste'}
                    hinted={isTop && hint?.source?.source === 'waste'}
                    onClick={isTop ? () => dispatch(select({ source: 'waste' })) : undefined}
                    onDoubleClick={isTop ? () => dispatch(autoMove({ source: 'waste' })) : undefined}
                  />
                )
              })
            ) : (
              <div className="slot" aria-label="empty waste" />
            )}
          </div>
        </div>

        <div className="board__right">
          {foundations.map((pile, i) => {
            const top = pile[pile.length - 1] ?? null
            const isHintDestination = hint?.destination?.type === 'foundation' && hint.destination.pile === i
            return (
              <div
                key={i}
                className={`pile pile--single ${isHintDestination ? 'is-hint-destination' : ''}`}
                onClick={() =>
                  selection && dispatch(moveCard({ destination: { type: 'foundation', pile: i } }))
                }
              >
                {top ? (
                  <Card card={top} />
                ) : (
                  <div className="slot slot--foundation">
                    {SUIT_SYMBOLS[['hearts', 'clubs', 'diamonds', 'spades'][i]]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Tableau: 7 columns, cards fanned downward. */}
      <section className="board__tableau">
        {tableau.map((column, colIndex) => {
          const isHintDestination = hint?.destination?.type === 'tableau' && hint.destination.column === colIndex

          return (
            <div
              key={colIndex}
              className="column"
              onClick={() =>
                selection && dispatch(moveCard({ destination: { type: 'tableau', column: colIndex } }))
              }
            >
              {column.length === 0 && (
                <div className={`slot ${isHintDestination ? 'is-hint-destination' : ''}`} />
              )}
              {column.map((card, cardIndex) => {
                const isThisSelected =
                  selection?.source === 'tableau' &&
                  selection?.column === colIndex &&
                  selection?.index === cardIndex
                const isPartOfSelectedRun =
                  selection?.source === 'tableau' &&
                  selection?.column === colIndex &&
                  cardIndex >= selection.index
                const isPartOfHintedRun =
                  hint?.source?.source === 'tableau' &&
                  hint.source.column === colIndex &&
                  cardIndex >= hint.source.index

                return (
                  <Card
                    key={card.id}
                    card={card}
                    stackOffset={cardIndex * 26}
                    selected={isPartOfSelectedRun}
                    hinted={isPartOfHintedRun}
                    hintDestination={isHintDestination && cardIndex === column.length - 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!card.faceUp) return
                      if (isThisSelected || !selection) {
                        dispatch(select({ source: 'tableau', column: colIndex, index: cardIndex }))
                      } else {
                        dispatch(moveCard({ destination: { type: 'tableau', column: colIndex } }))
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      if (!card.faceUp) return
                      dispatch(autoMove({ source: 'tableau', column: colIndex, index: cardIndex }))
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </section>
    </main>
  )
}
