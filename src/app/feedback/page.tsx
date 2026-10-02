import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import StudyTabs from '@/components/feedback/StudyTabs'
import type { StudyMaterials } from '@/types'
import { api } from '@/lib/api'
import { CheckCircle, AlertTriangle } from 'lucide-react'

// Placeholder feedback — Sprint 4 will wire real GPT-4o scoring
const MOCK_FEEDBACK = {
  overall_score:       78,
  technical_score:     85,
  communication_score: 80,
  examples_score:      70,
  structure_score:     60,
  strengths: [
    'Technical depth on RAG and LLMs — confident and accurate',
    'Clear, well-paced communication throughout',
  ],
  improvements: [
    'Behavioural answers — use the STAR framework for more impact',
    'System design — address scale, latency, and failure modes',
  ],
  questions: [
    { topic: 'RAG pipeline design',      score: 82, feedback: 'Strong architecture knowledge. Could mention RAGAS evaluation metrics next time.' },
    { topic: 'Fine-tuning vs prompting', score: 91, feedback: 'Excellent — clear distinction with a strong real-world example.' },
    { topic: 'Behavioural — failure',    score: 65, feedback: 'Answer lacked impact. Structure with the STAR method next time.' },
    { topic: 'System design',            score: 73, feedback: 'Good foundations — go deeper on scaling and latency trade-offs.' },
  ],
}

function scoreColor(s: number) {
  if (s >= 80) return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' }
  if (s >= 65) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return        { bar: 'bg-red-400',   text: 'text-red-500',   bg: 'bg-red-50'   }
}

function fmtDuration(seconds?: number | null) {
  if (!seconds) return null
  return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`
}

export default async function FeedbackPage({
  searchParams,
}: { searchParams: Promise<{ id?: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await searchParams
  const interview = id
    ? await api.interviews.get(session.accessToken, id).catch(() => null)
    : null
  const cached = id
    ? await api.interviews.getStudyMaterials(session.accessToken, id).catch(() => null)
    : null
  const initialMaterials: StudyMaterials | null =
    cached?.quiz && cached.flashcards
      ? { quiz: cached.quiz, flashcards: cached.flashcards, cached: true }
      : null
  const subtitle = interview
    ? [interview.role, interview.level, fmtDuration(interview.duration_seconds)].filter(Boolean).join(' · ')
    : 'AI Engineer · Mid-level · 14 min 22 sec'

  const fb = MOCK_FEEDBACK
  const score = fb.overall_score

  return (
    <div className="min-h-screen bg-gray-50">
      <Header rightContent={
        <Link href="/dashboard"
              className="text-sm text-gray-400 hover:text-gray-600">
          Back to dashboard
        </Link>
      } />

      <StudyTabs
        interviewId={id ?? null}
        initialMaterials={initialMaterials}
        transcript={(interview?.transcript as any[]) || []}
        role={interview?.role || ''}
        level={interview?.level || ''}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Interview complete</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8 pl-9 capitalize">{subtitle}</p>

        {/* Overall score */}
        <div className="card mb-4">
          <div className="text-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg width="96" height="96"
                   viewBox="0 0 96 96"
                   className="rotate-[-90deg]">
                <circle cx="48" cy="48" r="40"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"/>
                <circle cx="48" cy="48" r="40"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - (251.3 * score / 100)}
                  strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-medium text-gray-900">
                  {score}
                </span>
                <span className="text-xs text-gray-400">
                  /100
                </span>
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
                <div key={d.label}
                     className="bg-white border border-gray-100 rounded-lg p-2 text-center">
                  <div className={`text-base font-medium ${scoreColor(d.val).text}`}>
                    {d.val}
                  </div>
                  <div className="text-xs text-gray-400 leading-tight mt-0.5">
                    {d.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="card mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Question breakdown</p>
          {fb.questions.map((q) => {
            const c = scoreColor(q.score)
            return (
              <div key={q.topic} className="py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-800">{q.topic}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                    {q.score}/100
                  </span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full mb-2">
                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${q.score}%` }} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{q.feedback}</p>
              </div>
            )
          })}
        </div>

        {/* Strengths and improvements */}
        <div className="card mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Strengths</p>
          {fb.strengths.map((s) => (
            <div key={s} className="flex items-start gap-2 mb-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 mt-4">Work on</p>
          {fb.improvements.map((s) => (
            <div key={s} className="flex items-start gap-2 mb-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>

      </StudyTabs>
    </div>
  )
}
