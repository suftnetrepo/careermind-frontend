import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react'

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

const SCORE_DIMS = [
  { label: 'Technical depth',  key: 'technical_score' },
  { label: 'Communication',    key: 'communication_score' },
  { label: 'Examples used',    key: 'examples_score' },
  { label: 'Structure',        key: 'structure_score' },
]

function scoreColor(s: number) {
  if (s >= 80) return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' }
  if (s >= 65) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return        { bar: 'bg-red-400',   text: 'text-red-500',   bg: 'bg-red-50'   }
}

export default async function FeedbackPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const fb = MOCK_FEEDBACK

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">Back to dashboard</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Interview complete</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8 pl-9">AI Engineer · Mid-level · 14 min 22 sec</p>

        {/* Overall score */}
        <div className="card text-center mb-4">
          <div className="text-5xl font-medium text-gray-900 mb-1">
            {fb.overall_score}<span className="text-2xl text-gray-300">/100</span>
          </div>
          <p className="text-sm text-gray-400 mb-5">Overall readiness score</p>
          <div className="space-y-2.5 max-w-xs mx-auto text-left">
            {SCORE_DIMS.map((d) => {
              const val = (fb as any)[d.key] as number
              const c = scoreColor(val)
              return (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 flex-shrink-0">{d.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className={`text-xs font-medium w-6 text-right ${c.text}`}>{val}</span>
                </div>
              )
            })}
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

        <div className="flex gap-3">
          <Link href="/setup" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            Practice again <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="btn-secondary flex items-center gap-2 px-4">
            <Download className="w-4 h-4" /> Report
          </button>
        </div>
      </main>
    </div>
  )
}
