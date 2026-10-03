'use client'
import { useState } from 'react'
import type { QuizQuestion, QuizAttempt } from '@/types'
import { ArrowRight, BarChart3, Check, CheckCircle2, ChevronDown, Code2, Flame, Lightbulb, RotateCcw, Trophy, Wrench, X, XCircle } from 'lucide-react'

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
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all')
  const [expandedReview, setExpandedReview] = useState<number | null>(null)

  if (questions.length === 0) {
    return <p className="text-center text-gray-400 py-16">No quiz questions available.</p>
  }

  const q = questions[current]
  const score = attempts.filter(a => a.correct).length
  let streak = 0
  for (let index = attempts.length - 1; index >= 0 && attempts[index].correct; index--) streak++

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
    const topicScores = questions.reduce<Record<string, { correct: number; total: number }>>(
      (acc, q, i) => {
        const attempt = attempts.find(a => a.questionIndex === i)
        acc[q.topic] ??= { correct: 0, total: 0 }
        acc[q.topic].total++
        if (attempt?.correct) acc[q.topic].correct++
        return acc
      }, {})
    const color = pct >= 80
      ? 'text-green-600'
      : pct >= 60
        ? 'text-amber-500'
        : 'text-red-500'
    const filteredAttempts = attempts.filter(attempt => reviewFilter === 'all' || (reviewFilter === 'correct' ? attempt.correct : !attempt.correct))

    return (
      <div className="space-y-6 py-3 sm:py-6">
        <section className="relative overflow-hidden rounded-[30px] border border-indigo-100 bg-[radial-gradient(circle_at_86%_20%,rgba(167,139,250,.28),transparent_30%),linear-gradient(135deg,#fff,#eef4ff)] p-7 shadow-[0_20px_55px_rgba(79,70,229,.08)] sm:p-9">
          <div className="relative flex flex-col items-center gap-7 text-center sm:flex-row sm:text-left"><span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-xl shadow-indigo-100"><Trophy className="h-9 w-9" /></span><div className="flex-1"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-indigo-600">Quiz complete</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.04em] text-slate-950">{pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'A strong foundation' : 'Keep building your knowledge'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{pct >= 80 ? 'You know this material well.' : pct >= 60 ? 'Review the topics you missed to strengthen your result.' : 'Use the flashcards to reinforce the concepts before trying again.'}</p></div><div className="rounded-2xl border border-white bg-white/75 px-7 py-5 text-center shadow-sm"><div className={`text-5xl font-black ${color}`}>{pct}%</div><p className="mt-1 text-xs font-bold text-slate-400">{score} of {questions.length} correct</p></div></div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><BarChart3 className="h-5 w-5" /></span><div><h3 className="text-lg font-extrabold text-slate-900">Performance by topic</h3><p className="mt-1 text-xs text-slate-500">See how you did in each area</p></div></div><div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Strong (≥ 70%)</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Needs practice</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-400" />Review</span></div></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">{Object.entries(topicScores).map(([topic, scores]) => { const topicPct = Math.round(scores.correct / scores.total * 100); const tone = topicPct >= 70 ? { bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-600' } : topicPct >= 40 ? { bar: 'bg-gradient-to-r from-amber-400 to-amber-300', text: 'text-amber-600', icon: 'bg-amber-100 text-amber-600' } : { bar: 'bg-gradient-to-r from-red-500 to-red-400', text: 'text-red-500', icon: 'bg-red-100 text-red-500' }; return <div key={topic} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}><BarChart3 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="mb-2 flex justify-between gap-3"><span className="truncate text-sm font-bold text-slate-700">{topic}</span><span className={`text-sm font-extrabold ${tone.text}`}>{scores.correct}/{scores.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${topicPct}%` }} /></div></div></div></div> })}</div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><CheckCircle2 className="h-5 w-5" /></span><div><h3 className="text-lg font-extrabold text-slate-900">Question review</h3><p className="mt-1 text-xs text-slate-500">See what you got right and what to focus on</p></div></div><div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">{(['all', 'correct', 'incorrect'] as const).map(filter => { const count = filter === 'all' ? attempts.length : attempts.filter(item => filter === 'correct' ? item.correct : !item.correct).length; return <button key={filter} onClick={() => setReviewFilter(filter)} className={`rounded-full px-4 py-2 text-xs font-extrabold capitalize transition ${reviewFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{filter} ({count})</button> })}</div></div>
          <div className="mt-6 space-y-3">{filteredAttempts.map(attempt => { const question = questions[attempt.questionIndex]; const isExpanded = expandedReview === attempt.questionIndex; const selectedOption = question.options.find(option => option.id === attempt.selected); const correctOption = question.options.find(option => option.id === question.correct); return <button key={attempt.questionIndex} onClick={() => setExpandedReview(isExpanded ? null : attempt.questionIndex)} className={`w-full rounded-2xl border p-4 text-left transition sm:p-5 ${attempt.correct ? 'border-slate-100 bg-white hover:border-emerald-200' : 'border-red-100 bg-red-50/60'}`}><div className="flex items-start gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${attempt.correct ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>{attempt.correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start gap-2"><p className="flex-1 text-sm font-bold leading-6 text-slate-800">{question.question}</p><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${attempt.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{question.topic}</span></div><p className={`mt-2 text-xs font-semibold ${attempt.correct ? 'text-emerald-600' : 'text-red-500'}`}>{attempt.correct ? `Correct: ${correctOption?.text}` : 'Your answer was incorrect.'}</p>{isExpanded && <div className="mt-4 border-t border-slate-200/70 pt-4 text-xs leading-6 text-slate-600">{!attempt.correct && <><p><strong>Your answer:</strong> {selectedOption?.text}</p><p className="mt-1"><strong>Correct answer:</strong> {correctOption?.text}</p></>}<p className="mt-2"><strong>Explanation:</strong> {question.explanation}</p></div>}</div><ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-indigo-500 transition ${isExpanded ? 'rotate-180' : ''}`} /></div></button> })}</div>
        </section>

        <div className="flex justify-center pb-3"><button onClick={handleRestart} className="inline-flex min-h-13 items-center gap-2 rounded-xl bg-slate-950 px-7 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-950"><RotateCcw className="h-4 w-4" />Retake quiz</button></div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 py-3 lg:grid-cols-[250px_minmax(0,1fr)_290px] sm:py-6">
      <aside className="hidden h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(30,41,59,.05)] lg:block">
        <h2 className="text-lg font-extrabold text-slate-900">Questions</h2>
        <div className="mt-5 grid grid-cols-5 gap-2">{questions.map((_, index) => { const attempt = attempts.find(item => item.questionIndex === index); const active = current === index; return <span key={index} className={`flex aspect-square items-center justify-center rounded-xl border text-xs font-extrabold ${active ? 'border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200' : attempt ? attempt.correct ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-500' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>{index + 1}</span> })}</div>
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-500"><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-indigo-600" />Current question</p><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Correct answer</p><p className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-red-400" />Needs review</p></div>
      </aside>
      <div className="min-w-0">
      {/* Progress */}
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>Question <strong className="text-slate-900">{current + 1}</strong> of {questions.length}</span>
        <span>{score} correct so far</span>
      </div>
      <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all"
          style={{ width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,.06)] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty]}`}>
            {q.difficulty}
          </span>
          <span className="text-xs font-bold text-slate-400">{q.topic}</span>
        </div>
        <p className="text-xl font-extrabold leading-relaxed tracking-[-.02em] text-slate-900 sm:text-2xl">
          {q.question}
        </p>
      <div className="mt-7 space-y-3">
        {q.options.map((opt) => {
          const isSelected = selected === opt.id
          const isCorrect  = opt.id === q.correct
          const isWrong    = revealed && isSelected && !isCorrect

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left text-sm transition-all sm:p-5
                ${revealed && isCorrect
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                }`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-extrabold uppercase text-slate-600">{opt.id}</span>
              <span className="flex-1 font-semibold leading-6">{opt.text}</span>
              {revealed && isCorrect && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              {isWrong && (
                <X className="h-5 w-5 text-red-400" />
              )}
            </button>
          )
        })}
      </div></div>

      {/* Explanation */}
      {revealed && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-blue-800">
          <p className="mb-2 flex items-center gap-2 font-extrabold"><Lightbulb className="h-4 w-4" />Explanation</p>
          {q.explanation}
        </div>
      )}

      {/* Actions */}
      {!revealed ? (
        <button
          onClick={handleReveal}
          disabled={!selected}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-xl shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-40">
          Check answer <ArrowRight className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-xl shadow-indigo-200">
          {current < questions.length - 1 ? 'Next question →' : 'See results'}
        </button>
      )}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(30,41,59,.05)]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><Wrench className="h-5 w-5" /></span>
              <h2 className="text-lg font-extrabold text-slate-900">Your progress</h2>
            </div>
            <div className="mt-5 flex justify-center border-b border-slate-100 pb-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
                  <circle cx="56" cy="56" r="45" fill="none" stroke="#eef2ff" strokeWidth="10" />
                  <circle cx="56" cy="56" r="45" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * attempts.length / questions.length)} strokeLinecap="round" className="transition-all" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-950">{Math.round(attempts.length / questions.length * 100)}%</span>
              </div>
            </div>
            <div className="mt-2 divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Correct</span>
                <span className="text-sm font-extrabold text-slate-900">{score}/{questions.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-500"><Flame className="h-4 w-4 text-orange-500" />Streak</span>
                <span className="text-sm font-extrabold text-slate-900">{streak}</span>
              </div>
            </div>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(30,41,59,.05)]"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"><Lightbulb className="h-5 w-5" /></span><h2 className="text-lg font-extrabold text-slate-900">Question tips</h2></div><div className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 text-sm leading-7 text-slate-600">Focus on the key principle behind <strong className="text-slate-800">{q.topic}</strong>. Compare each option with established best practices before choosing.</div></section>
        </div>
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(30,41,59,.05)]"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600"><Code2 className="h-5 w-5" /></span><h2 className="text-lg font-extrabold text-slate-900">Topic</h2></div><span className="mt-5 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold text-indigo-600">{q.topic}</span></section>
      </aside>
    </div>
  )
}
