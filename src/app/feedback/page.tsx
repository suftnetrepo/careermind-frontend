import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StudyTabs from '@/components/feedback/StudyTabs'
import FeedbackScores from '@/components/feedback/FeedbackScores'
import type { StudyMaterials } from '@/types'
import { api } from '@/lib/api'
import { CheckCircle2, Sparkles } from 'lucide-react'

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
      ? { quiz: cached.quiz, flashcards: cached.flashcards, cached: true, model: cached.model }
      : null
  const status = id
    ? await api.interviews.getFeedbackStatus(session.accessToken, id).catch(() => null)
    : null
  const subtitle = interview
    ? [interview.role, interview.level, fmtDuration(interview.duration_seconds)].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_95%_8%,rgba(196,181,253,.24),transparent_25%),radial-gradient(circle_at_5%_72%,rgba(191,219,254,.2),transparent_25%),#f8faff]">
      <StudyTabs
        interviewId={id ?? null}
        initialMaterials={initialMaterials}
        transcript={(interview?.transcript as any[]) || []}
        role={interview?.role || ''}
        level={interview?.level || ''}
        createdAt={interview?.created_at ?? null}
        durationSeconds={interview?.duration_seconds ?? null}
      >
        <section className="relative mb-6 overflow-hidden rounded-[30px] border border-indigo-100 bg-[radial-gradient(circle_at_84%_30%,rgba(167,139,250,.3),transparent_28%),linear-gradient(135deg,#fff,#eef4ff)] px-7 py-10 shadow-[0_22px_60px_rgba(79,70,229,.08)] sm:px-10">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/50" />
          <div className="relative flex items-center gap-5"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200"><CheckCircle2 className="h-8 w-8" /></span><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-indigo-600">Session complete</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-4xl">Interview complete!</h1><p className="mt-2 text-sm capitalize text-slate-500 sm:text-base">{subtitle}</p></div></div>
          <div className="relative mt-6 inline-flex items-center gap-2 rounded-xl border border-white bg-white/70 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm"><Sparkles className="h-4 w-4 text-indigo-500" />Your personalised analysis and next steps are ready below.</div>
        </section>

        <FeedbackScores interviewId={id ?? null} initial={status?.feedback ?? null} />
      </StudyTabs>
    </div>
  )
}
