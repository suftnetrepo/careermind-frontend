'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { CheckCircle, Mic, ArrowLeft, Loader2, Headphones, Clock, Lightbulb } from 'lucide-react'

const TOPIC_COLORS = ['bg-brand-500', 'bg-brand-500', 'bg-green-500', 'bg-amber-500', 'bg-gray-300']

const SCORE_WEIGHTS = [
  { label: 'Technical depth',  pct: 40, color: 'bg-brand-500' },
  { label: 'Communication',    pct: 25, color: 'bg-green-500' },
  { label: 'Examples used',    pct: 20, color: 'bg-amber-500' },
  { label: 'Structure',        pct: 15, color: 'bg-gray-300' },
]

export default function PreviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('cm_interview')
    if (!stored) { router.push('/setup'); return }
    setInterview(JSON.parse(stored))
  }, [])

  const topics = interview?.questions?.map((q: any) => q.topic) ?? []

  const price = ((interview?.duration_minutes ?? 0) * 0.20).toFixed(2)

  async function handleStart() {
    if (!session?.accessToken || !interview?.interview_id) return
    setLoading(true)
    try {
      if (interview.is_free) {
        await api.interviews.start(session.accessToken, interview.interview_id)
        router.push(`/interview?id=${interview.interview_id}`)
      } else {
        const { checkout_url } = await api.sessions.checkout(session.accessToken, {
          interview_id:     interview.interview_id,
          duration_minutes: interview.duration_minutes,
        })
        window.location.href = checkout_url
      }
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  if (!interview) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        <button onClick={() => router.push('/setup')} className="text-sm text-gray-400 flex items-center gap-1 hover:text-gray-600">
          <ArrowLeft className="w-4 h-4" /> Change setup
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        {interview.is_free && (
          <div className="inline-flex items-center gap-1.5 bg-green-50
                          text-green-700 text-xs px-3 py-1 rounded-full mb-4">
            Using your free interview (15 minutes)
          </div>
        )}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">Your interview is ready</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8 pl-9">
          {interview.role} · {interview.level} · {interview.duration_minutes} minutes · {interview.questions?.length ?? 8} questions
        </p>

        {/* Topics */}
        <div className="card mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Topics covered</p>
          {topics.slice(0, 5).map((topic: string, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 text-sm text-gray-700">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TOPIC_COLORS[i] || 'bg-gray-300'}`} />
              {topic}
            </div>
          ))}
        </div>

        {/* Scoring rubric */}
        <div className="card mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">What we score</p>
          {SCORE_WEIGHTS.map((s) => (
            <div key={s.label} className="flex items-center gap-3 mb-2.5 last:mb-0">
              <span className="text-sm text-gray-500 w-32 flex-shrink-0">{s.label}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{s.pct}%</span>
            </div>
          ))}
          <p className="text-xs text-gray-300 mt-3">Scoring rubric shown before you start, not after.</p>
        </div>

        {/* Tips */}
        <div className="card mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Before you start</p>
          {[
            { icon: Headphones, text: 'Headphones give the best voice experience' },
            { icon: Mic,        text: 'Speak clearly — the AI listens and responds naturally' },
            { icon: Clock,      text: `You have ${interview.duration_minutes} minutes — pace yourself` },
            { icon: Lightbulb,  text: "It's fine to pause and think before answering" },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-3 py-1.5 text-sm text-gray-500">
              <t.icon className="w-4 h-4 text-brand-400 flex-shrink-0" />
              {t.text}
            </div>
          ))}
        </div>

        <button onClick={handleStart} disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{interview.is_free ? 'Starting...' : 'Redirecting to payment...'}</>
          ) : (
            <><Mic className="w-4 h-4" />
              {interview.is_free ? 'Start free interview →' : `Pay £${price} and start →`}
            </>
          )}
        </button>
      </main>
    </div>
  )
}
