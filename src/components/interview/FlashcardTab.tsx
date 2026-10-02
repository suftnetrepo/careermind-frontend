'use client'
import { useState } from 'react'
import type { Flashcard } from '@/types'

interface Props {
  cards: Flashcard[]
}

export default function FlashcardTab({ cards }: Props) {
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [studied, setStudied] = useState<Set<number>>(new Set())

  if (cards.length === 0) {
    return <p className="text-center text-gray-400 py-16">No flashcards available.</p>
  }

  const card = cards[index]
  const progress = Math.round(studied.size / cards.length * 100)

  const markStudied = (i: number) =>
    setStudied(prev => new Set(prev).add(i))

  function handleFlip() {
    // Seeing the answer counts as studying the card — the last card has no
    // "Next", so this is what lets the deck reach 100%
    if (!flipped) markStudied(index)
    setFlipped(f => !f)
  }

  function handleNext() {
    markStudied(index)
    if (index < cards.length - 1) {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  function handlePrev() {
    if (index > 0) {
      setIndex(i => i - 1)
      setFlipped(false)
    }
  }

  function handleRestart() {
    setIndex(0)
    setFlipped(false)
    setStudied(new Set())
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
        <span>Card {index + 1} of {cards.length}</span>
        <span>{studied.size} studied</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-6">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Topic */}
      <p className="text-xs text-indigo-500 uppercase tracking-wide mb-3 text-center">
        {card.topic}
      </p>

      {/* Card */}
      <div onClick={handleFlip} className="cursor-pointer select-none">
        <div className={`min-h-64 rounded-2xl border-2 p-8 transition-all
                         flex flex-col justify-between
          ${flipped
            ? 'border-indigo-200 bg-indigo-50'
            : 'border-gray-200 bg-white hover:border-gray-300'}`}>

          <div className="text-xs text-center text-gray-400 mb-4">
            {flipped ? 'ANSWER' : 'QUESTION'}
          </div>

          <p className={`text-center leading-relaxed
            ${flipped
              ? 'text-gray-800 text-sm'
              : 'text-gray-900 font-medium text-base'}`}>
            {flipped ? card.back : card.front}
          </p>

          {flipped && card.tip && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3
                            text-xs text-amber-700">
              <span className="font-medium">Tip:{' '}</span>
              {card.tip}
            </div>
          )}

          <p className="text-xs text-center text-gray-300 mt-4">
            {flipped ? 'Click to see question' : 'Click to reveal answer'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="btn-secondary flex-1 py-2.5 text-sm
                     disabled:opacity-30 disabled:cursor-not-allowed">
          ← Previous
        </button>

        {index < cards.length - 1 ? (
          <button onClick={handleNext} className="btn-primary flex-1 py-2.5 text-sm justify-center">
            Next →
          </button>
        ) : (
          <button onClick={handleRestart} className="btn-primary flex-1 py-2.5 text-sm justify-center">
            Start over
          </button>
        )}
      </div>

      {/* All cards studied */}
      {studied.size === cards.length && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4
                        text-center text-sm text-green-700">
          You've studied all {cards.length} cards. Ready to take the quiz?
        </div>
      )}
    </div>
  )
}
