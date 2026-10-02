import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import StudyTabs from '@/components/feedback/StudyTabs'
import FeedbackScores from '@/components/feedback/FeedbackScores'
import type { StudyMaterials } from '@/types'
import { api } from '@/lib/api'
import { CheckCircle } from 'lucide-react'

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
  const status = id
    ? await api.interviews.getFeedbackStatus(session.accessToken, id).catch(() => null)
    : null
  const subtitle = interview
    ? [interview.role, interview.level, fmtDuration(interview.duration_seconds)].filter(Boolean).join(' · ')
    : ''

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

        <FeedbackScores interviewId={id ?? null} initial={status?.feedback ?? null} />
      </StudyTabs>
    </div>
  )
}
