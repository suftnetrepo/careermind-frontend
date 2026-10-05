import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { AdminInterviewDetail } from '@/types'

function scoreColor(s: number | null | undefined) {
  if (!s) return 'text-gray-300'
  if (s >= 80) return 'text-green-600'
  if (s >= 60) return 'text-amber-500'
  return 'text-red-500'
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtDuration(secs: number | null) {
  if (!secs) return '—'
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

// Server-rendered: admin status is checked before anything is shown, and the
// API returns scores and feedback only — never the transcript or CV
export default async function AdminInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const me = await api.auth.me(session.accessToken).catch(() => null)
  if (!me?.is_admin) redirect('/dashboard')

  const { id } = await params
  let interview: AdminInterviewDetail | null = null
  let error = ''
  try {
    interview = await api.admin.interviewDetail(session.accessToken, id)
  } catch (err: any) {
    error = err.message || 'Failed to load'
  }

  if (!interview) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="card text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <Link href="/admin" className="btn-secondary">Back to admin</Link>
      </div>
    </div>
  )

  const fb = interview.feedback

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Interview detail</span>
          </div>
          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">Admin view</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {/* Interview summary */}
        <div className="card">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs text-gray-400">Candidate</p>
              <p className="text-base font-medium text-gray-900">{interview.user_name}</p>
              <p className="text-sm text-gray-400">{interview.user_email}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs text-gray-400">Overall score</p>
              <p className={`text-3xl font-medium ${scoreColor(interview.overall_score)}`}>
                {interview.overall_score ?? '—'}
                <span className="text-base text-gray-300">/100</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
            {[
              { label: 'Role',     value: interview.role },
              { label: 'Level',    value: interview.level },
              { label: 'Duration', value: fmtDuration(interview.duration_seconds) },
              { label: 'Type',     value: interview.is_free
                  ? 'Free'
                  : interview.paid
                    ? `Paid — £${((interview.amount_pence || 0) / 100).toFixed(2)}`
                    : 'Unpaid' },
            ].map(item => (
              <div key={item.label}>
                <p className="mb-1 text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-medium capitalize text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            {[
              { label: 'Started', value: fmtDate(interview.started_at) },
              { label: 'Ended',   value: fmtDate(interview.ended_at) },
              { label: 'Voice',   value: interview.voice || 'alloy' },
            ].map(item => (
              <div key={item.label}>
                <p className="mb-1 text-xs text-gray-400">{item.label}</p>
                <p className="text-sm capitalize text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension scores */}
        {fb && (
          <div className="card">
            <p className="mb-4 text-sm font-medium text-gray-900">Score breakdown</p>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Technical',     val: fb.technical_score },
                { label: 'Communication', val: fb.communication_score },
                { label: 'Examples',      val: fb.examples_score },
                { label: 'Structure',     val: fb.structure_score },
              ].map(d => (
                <div key={d.label} className="text-center">
                  <p className={`mb-1 text-2xl font-medium ${scoreColor(d.val)}`}>{d.val || '—'}</p>
                  <p className="text-xs text-gray-400">{d.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Strengths</p>
                {(fb.strengths || []).length === 0 && <p className="text-sm text-gray-300">None recorded</p>}
                {(fb.strengths || []).map((s, i) => (
                  <div key={i} className="mb-2 flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 text-green-500">✓</span>
                    {s}
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Areas to improve</p>
                {(fb.improvements || []).map((s, i) => (
                  <div key={i} className="mb-2 flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0 text-amber-400">→</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        {fb && fb.questions?.length > 0 && (
          <div className="card">
            <p className="mb-4 text-sm font-medium text-gray-900">Question breakdown</p>
            <div className="space-y-4">
              {fb.questions.map((q, i) => (
                <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <p className={`text-sm font-medium ${q.covered ? 'text-gray-800' : 'text-gray-400'}`}>{q.topic}</p>
                    {q.covered
                      ? <span className={`text-sm font-medium ${scoreColor(q.score)}`}>{q.score}/100</span>
                      : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Not covered</span>}
                  </div>
                  {q.covered && (
                    <>
                      <div className="mb-2 h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${q.score}%`,
                            background: q.score >= 80 ? '#22c55e' : q.score >= 60 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <p className="text-xs leading-relaxed text-gray-500">{q.feedback}</p>
                      {q.improvement && <p className="mt-1 text-xs text-indigo-500">→ {q.improvement}</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics covered — labels only; question text can contain CV details */}
        {interview.questions.length > 0 && (
          <div className="card">
            <p className="mb-4 text-sm font-medium text-gray-900">
              Topics covered
              <span className="ml-2 font-normal text-gray-400">({interview.questions.length})</span>
            </p>
            <div className="space-y-2">
              {interview.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-gray-50 py-2 last:border-0">
                  <span className="w-5 flex-shrink-0 text-xs text-gray-300">{i + 1}</span>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{q.topic}</span>
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs capitalize text-gray-400">{q.difficulty}</span>
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs capitalize text-gray-400">{q.type.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No feedback yet */}
        {!fb && (
          <div className="card py-8 text-center">
            <p className="text-sm text-gray-400">No feedback generated yet</p>
            <p className="mt-1 text-xs text-gray-300">Feedback is generated automatically after the interview ends</p>
          </div>
        )}
      </main>
    </div>
  )
}
