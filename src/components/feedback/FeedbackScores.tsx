'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, BarChart3, BookOpen, CheckCircle2, ChevronDown, Clock3, Code2, Fingerprint, Info, Lightbulb, ListChecks, MessageSquareText, Smartphone, Target, Users } from 'lucide-react'
import { api } from '@/lib/api'
import type { FeedbackReport } from '@/types'

const POLL_INTERVAL_MS = 3000
// The backend regenerates feedback that's still missing 2 minutes after the
// interview ended, so keep polling past that point
const MAX_POLLS = 60   // 3 minutes

function scoreColor(s: number) {
  if (s >= 80) return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' }
  if (s >= 65) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return        { bar: 'bg-red-400',   text: 'text-red-500',   bg: 'bg-red-50'   }
}

interface Props {
  interviewId: string | null
  // Already-generated feedback, fetched by the server page — skips polling
  initial:     FeedbackReport | null
}

export default function FeedbackScores({ interviewId, initial }: Props) {
  const { data: session } = useSession()
  const [fb,      setFb]      = useState<FeedbackReport | null>(initial)
  const [fbError, setFbError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Feedback is generated in the background after the interview ends — poll until ready
  useEffect(() => {
    if (fb || !session?.accessToken || !interviewId) return
    let cancelled = false
    let polls = 0
    let timer: ReturnType<typeof setTimeout>

    const poll = async () => {
      try {
        const data = await api.interviews.getFeedbackStatus(session.accessToken, interviewId)
        if (cancelled) return
        if (data.ready && data.feedback) { setFb(data.feedback); return }
        if (data.retrying) setRetrying(true)
      } catch { /* keep polling */ }
      if (cancelled) return
      if (++polls >= MAX_POLLS) {
        setFbError('Feedback is taking longer than expected. Please refresh the page.')
        return
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [session?.accessToken, interviewId, fb])

  if (!interviewId) {
    return <div className="mb-6 rounded-[24px] border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">No interview selected.</div>
  }

  if (!fb) {
    return (
      <div className="mb-6 rounded-[24px] border border-slate-200 bg-white py-12 text-center shadow-sm">
        {fbError ? (
          <p className="text-sm text-gray-500">{fbError}</p>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">
              {retrying ? 'Taking longer than expected — still analysing your interview...' : 'Analysing your interview...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {retrying ? 'This can take up to a minute' : 'This takes about 10 seconds'}
            </p>
          </>
        )}
      </div>
    )
  }

  const score = fb.overall_score
  const coveredCount = fb.questions.filter(question => question.covered).length
  const questionIcons = [Smartphone, Lightbulb, MessageSquareText, BarChart3, Users, Fingerprint, Clock3, Code2]
  const questionIconStyles = ['bg-sky-100 text-sky-600', 'bg-violet-100 text-violet-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-slate-100 text-slate-500', 'bg-slate-100 text-slate-500']

  return (
    <>
      {/* Overall score */}
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-7">
        <div className="grid items-center gap-7 xl:grid-cols-[220px_minmax(260px,1fr)_minmax(420px,1.35fr)] xl:gap-6">
          <div>
            <p className="mb-3 flex items-center justify-center gap-2 text-sm font-extrabold text-slate-800 sm:justify-start">Overall readiness score <Info className="h-4 w-4 text-slate-400" /></p>
            <div className="relative mx-auto h-52 w-52">
              <svg width="208" height="208" viewBox="0 0 208 208" className="-rotate-90">
                <circle cx="104" cy="104" r="88" fill="none" stroke="#f1f3fb" strokeWidth="14" />
                <circle cx="104" cy="104" r="88" fill="none" stroke="#655cf6" strokeWidth="14" strokeDasharray="552.9" strokeDashoffset={552.9 - (552.9 * score / 100)} strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tight text-slate-950">{score}</span>
                <span className="mt-1 text-lg text-slate-400">/100</span>
              </div>
            </div>
          </div>

          <div className="min-w-0 text-center xl:text-left">
            <h3 className="text-xl font-extrabold tracking-tight text-indigo-600">{score >= 80 ? 'Interview ready!' : score >= 60 ? 'You are making strong progress!' : "You're on the right track!"}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">You have a solid foundation. Focus on the suggested areas to improve and keep practicing to increase your score.</p>
            {fb.recommended_focus && (
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-4 text-left">
                <p className="flex items-center gap-2 text-sm font-extrabold text-indigo-700"><Target className="h-4 w-4" />Focus next</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{fb.recommended_focus}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            {[
              { label: 'Technical', val: fb.technical_score, icon: Code2, color: 'bg-sky-100 text-sky-600' },
              { label: 'Communication', val: fb.communication_score, icon: MessageSquareText, color: 'bg-blue-100 text-blue-600' },
              { label: 'Examples', val: fb.examples_score, icon: Lightbulb, color: 'bg-rose-100 text-rose-600' },
              { label: 'Structure', val: fb.structure_score, icon: ListChecks, color: 'bg-violet-100 text-violet-600' },
            ].map((d) => (
              <div key={d.label} className="rounded-2xl border border-slate-100 bg-white p-3 text-center sm:p-4">
                <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${d.color}`}><d.icon className="h-5 w-5" /></span>
                <div className="mt-2 text-2xl font-black text-slate-950">{d.val}</div>
                <div className="mt-1 text-xs font-semibold leading-tight text-slate-400">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(30,41,59,.05)]">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><BarChart3 className="h-5 w-5" /></span><div><h2 className="text-lg font-extrabold text-slate-900">Question breakdown</h2><p className="mt-1 text-xs text-slate-400">Performance across each interview topic</p></div></div><span className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-extrabold text-violet-600"><BookOpen className="h-4 w-4" />{coveredCount} of {fb.questions.length} topics covered</span></div>
        <div className="mx-4 hidden grid-cols-[minmax(220px,1fr)_240px_minmax(300px,1.4fr)_24px] gap-5 rounded-xl bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-500 lg:grid"><span>Topic</span><span>Score</span><span>Feedback</span><span /></div>
        {fb.questions.map((q, i) => {
          const c = scoreColor(q.score)
          const Icon = questionIcons[i % questionIcons.length]
          const expanded = expandedQuestion === i
          return (
            <div key={i} className={`border-b border-slate-100 px-5 py-4 last:border-0 sm:px-8 ${q.covered ? 'bg-white' : 'bg-slate-50/30'}`}>
              <button type="button" onClick={() => q.covered && setExpandedQuestion(expanded ? null : i)} className={`grid w-full items-center gap-4 text-left lg:grid-cols-[minmax(220px,1fr)_240px_minmax(300px,1.4fr)_24px] lg:gap-5 ${q.covered ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className="flex min-w-0 items-center gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${questionIconStyles[i % questionIconStyles.length]}`}><Icon className="h-5 w-5" /></span><span className={`truncate text-sm font-bold ${q.covered ? 'text-slate-800' : 'text-slate-400'}`}>{q.topic}</span></div>
                <div className="flex items-center gap-3 pl-[60px] lg:pl-0">{q.covered ? <><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${c.bar}`} style={{ width: `${q.score}%` }} /></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${c.bg} ${c.text}`}>{q.score}/100</span></> : <><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-1/3 rounded-full bg-slate-200" /></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400">Not covered</span></>}</div>
                <p className={`pl-[60px] text-xs leading-5 lg:pl-0 ${q.covered ? 'text-slate-500' : 'text-slate-400'}`}>{q.covered ? q.feedback : 'This topic was not discussed in the interview.'}</p>
                {q.covered ? <ChevronDown className={`hidden h-4 w-4 text-indigo-500 transition lg:block ${expanded ? 'rotate-180' : ''}`} /> : <span />}
              </button>
              {q.covered && expanded && q.improvement && <div className="ml-[60px] mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-700"><strong>How to improve:</strong> {q.improvement}</div>}
            </div>
          )
        })}
      </div>

      {/* Strengths and improvements */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {fb.strengths.length > 0 && (
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/60 p-6"><p className="mb-4 flex items-center gap-2 text-lg font-extrabold text-emerald-800"><CheckCircle2 className="h-5 w-5" />Strengths</p>
            {fb.strengths.map((s, i) => (
              <div key={i} className="mb-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
                <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
                {s}
              </div>
            ))}
          </div>
        )}
        <div className="rounded-[24px] border border-amber-100 bg-amber-50/60 p-6"><p className="mb-4 flex items-center gap-2 text-lg font-extrabold text-amber-800"><AlertTriangle className="h-5 w-5" />Areas to improve</p>
        {fb.improvements.map((s, i) => (
          <div key={i} className="mb-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-amber-500" />
            {s}
          </div>
        ))}</div>
      </div>
    </>
  )
}
