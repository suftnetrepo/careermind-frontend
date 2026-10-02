'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { FeedbackReport } from '@/types'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20   // 60 seconds

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
    return <div className="card text-center py-12 mb-6 text-sm text-gray-400">No interview selected.</div>
  }

  if (!fb) {
    return (
      <div className="card text-center py-12 mb-6">
        {fbError ? (
          <p className="text-sm text-gray-500">{fbError}</p>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Analysing your interview...</p>
            <p className="text-xs text-gray-400 mt-1">This takes about 10 seconds</p>
          </>
        )}
      </div>
    )
  }

  const score = fb.overall_score

  return (
    <>
      {/* Overall score */}
      <div className="card mb-4">
        <div className="text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
              <circle cx="48" cy="48" r="40" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 - (251.3 * score / 100)}
                strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-medium text-gray-900">{score}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Overall readiness score</p>

          <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
            {[
              { label: 'Technical',     val: fb.technical_score },
              { label: 'Communication', val: fb.communication_score },
              { label: 'Examples',      val: fb.examples_score },
              { label: 'Structure',     val: fb.structure_score },
            ].map((d) => (
              <div key={d.label} className="bg-white border border-gray-100 rounded-lg p-2 text-center">
                <div className={`text-base font-medium ${scoreColor(d.val).text}`}>{d.val}</div>
                <div className="text-xs text-gray-400 leading-tight mt-0.5">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
        {fb.recommended_focus && (
          <p className="text-sm text-gray-600 text-center border-t border-gray-50 pt-4">
            <span className="text-indigo-500 font-medium">Focus next: </span>
            {fb.recommended_focus}
          </p>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="card mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Question breakdown</p>
        {fb.questions.map((q, i) => {
          const c = scoreColor(q.score)
          return (
            <div key={i} className="py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${q.covered ? 'text-gray-800' : 'text-gray-400'}`}>{q.topic}</span>
                {q.covered ? (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {q.score}/100
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                    Not covered
                  </span>
                )}
              </div>
              {q.covered && (
                <>
                  <div className="h-1 bg-gray-100 rounded-full mb-2">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${q.score}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{q.feedback}</p>
                  {q.improvement && (
                    <p className="text-xs text-indigo-500 mt-1">→ {q.improvement}</p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Strengths and improvements */}
      <div className="card mb-8">
        {fb.strengths.length > 0 && (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Strengths</p>
            {fb.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {s}
              </div>
            ))}
          </>
        )}
        <p className={`text-xs text-gray-400 uppercase tracking-wide mb-3 ${fb.strengths.length > 0 ? 'mt-4' : ''}`}>Work on</p>
        {fb.improvements.map((s, i) => (
          <div key={i} className="flex items-start gap-2 mb-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            {s}
          </div>
        ))}
      </div>
    </>
  )
}
