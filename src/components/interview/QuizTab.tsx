'use client'
import { useState } from 'react'
import type { QuizQuestion, QuizAttempt } from '@/types'

interface Props {
  questions: QuizQuestion[]
}

const DIFFICULTY_COLORS = {
  easy:   'bg-green-50 text-green-700',
  medium: 'bg-amber-50 text-amber-700',
  hard:   'bg-red-50 text-red-600',
}

export default function QuizTab({ questions }: Props) {
  const [current,  setCurrent]  = useState(0)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) {
    return <p className="text-center text-gray-400 py-16">No quiz questions available.</p>
  }

  const q = questions[current]
  const score = attempts.filter(a => a.correct).length

  function handleSelect(id: string) {
    if (revealed) return
    setSelected(id)
  }

  function handleReveal() {
    if (!selected) return
    const correct = selected === q.correct
    setAttempts(prev => [
      ...prev,
      { questionIndex: current, selected, correct },
    ])
    setRevealed(true)
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      setFinished(true)
    }
  }

  function handleRestart() {
    setCurrent(0)
    setAttempts([])
    setSelected(null)
    setRevealed(false)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round(score / questions.length * 100)
    const color = pct >= 80
      ? 'text-green-600'
      : pct >= 60
        ? 'text-amber-500'
        : 'text-red-500'

    return (
      <div className="py-8 text-center">
        <div className={`text-5xl font-medium mb-2 ${color}`}>
          {pct}%
        </div>
        <p className="text-gray-400 text-sm mb-2">
          {score} of {questions.length} correct
        </p>
        <p className="text-sm text-gray-600 mb-8">
          {pct >= 80
            ? 'Excellent — you know this material well.'
            : pct >= 60
              ? 'Good foundation — review the topics you missed.'
              : 'Keep studying — use the flashcards to reinforce the concepts.'}
        </p>

        <div className="space-y-3 text-left mb-8 max-w-lg mx-auto">
          {attempts.map((a, i) => (
            <div key={i}
                 className={`flex items-start gap-3 p-3 rounded-xl text-sm
                   ${a.correct ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className={a.correct ? 'text-green-500' : 'text-red-400'}>
                {a.correct ? '✓' : '✗'}
              </span>
              <span className="text-gray-700">
                {questions[a.questionIndex].question}
              </span>
            </div>
          ))}
        </div>

        <button onClick={handleRestart} className="btn-primary">
          Retake quiz
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2 text-sm text-gray-400">
        <span>Question {current + 1} of {questions.length}</span>
        <span>{score} correct so far</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-6">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty]}`}>
            {q.difficulty}
          </span>
          <span className="text-xs text-gray-400">{q.topic}</span>
        </div>
        <p className="text-gray-900 font-medium leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === q.correct
          const isWrong    = revealed && isSelected && !isCorrect

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-4 rounded-xl border-2 text-sm transition-all
                ${revealed && isCorrect
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                }`}>
              <span className="font-medium mr-2 uppercase">{opt.id}.</span>
              {opt.text}
              {revealed && isCorrect && (
                <span className="ml-2 text-green-600">✓</span>
              )}
              {isWrong && (
                <span className="ml-2 text-red-400">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4
                        text-sm text-blue-800 leading-relaxed">
          <p className="font-medium mb-1">Explanation</p>
          {q.explanation}
        </div>
      )}

      {/* Actions */}
      {!revealed ? (
        <button
          onClick={handleReveal}
          disabled={!selected}
          className="btn-primary w-full py-3 justify-center
                     disabled:opacity-40 disabled:cursor-not-allowed">
          Check answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-3 justify-center">
          {current < questions.length - 1 ? 'Next question →' : 'See results'}
        </button>
      )}
    </div>
  )
}
