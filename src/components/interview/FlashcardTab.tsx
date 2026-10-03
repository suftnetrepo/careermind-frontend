'use client'
import { useState } from 'react'
import type { Flashcard } from '@/types'
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react'

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
    <div className="mx-auto max-w-3xl py-3 sm:py-6">
      {/* Progress */}
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>Card {index + 1} of {cards.length}</span>
        <span>{studied.size} studied</span>
      </div>
      <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Topic */}
      <p className="mb-4 text-center text-xs font-extrabold uppercase tracking-[.16em] text-indigo-500">
        {card.topic}
      </p>

      {/* Card */}
      <div onClick={handleFlip} className="cursor-pointer select-none">
        <div className={`min-h-80 rounded-[30px] border-2 p-8 shadow-[0_20px_55px_rgba(30,41,59,.07)] transition-all sm:p-12
                         flex flex-col justify-between
          ${flipped
            ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50'
            : 'border-slate-200 bg-white hover:border-indigo-200'}`}>

          <div className="mb-4 text-center text-xs font-extrabold tracking-[.15em] text-slate-400">
            {flipped ? 'ANSWER' : 'QUESTION'}
          </div>

          <p className={`text-center leading-relaxed
            ${flipped
              ? 'text-slate-700 text-base'
              : 'text-slate-950 font-extrabold text-xl sm:text-2xl'}`}>
            {flipped ? card.back : card.front}
          </p>

          {flipped && card.tip && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              <span className="font-extrabold"><Lightbulb className="mr-1 inline h-4 w-4" />Tip:{' '}</span>
              {card.tip}
            </div>
          )}

          <p className="text-xs text-center text-gray-300 mt-4">
            {flipped ? 'Click to see question' : 'Click to reveal answer'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-600 disabled:cursor-not-allowed disabled:opacity-30">
          <ArrowLeft className="h-4 w-4" />Previous
        </button>

        {index < cards.length - 1 ? (
          <button onClick={handleNext} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-200">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleRestart} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-200">
            <RotateCcw className="h-4 w-4" />Start over
          </button>
        )}
      </div>

      {/* All cards studied */}
      {studied.size === cards.length && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-sm font-bold text-green-700">
          <CheckCircle2 className="h-5 w-5" />You&apos;ve studied all {cards.length} cards. Ready to take the quiz?
        </div>
      )}
    </div>
  )
}
