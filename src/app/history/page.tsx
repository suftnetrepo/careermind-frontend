import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import { SignOutButton } from '@/components/layout/Header'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  History,
  Home,
  Mic,
  Sparkles,
  Zap,
} from 'lucide-react'

type HistoryItem = {
  id: string
  role: string
  level: string
  focus: string
  status: string
  paid: boolean
  overall_score: number | null
  duration_seconds: number | null
  created_at: string | null
}

function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-slate-950">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.24)]"><Mic className="h-5 w-5" strokeWidth={2.5} /></span>
      <span>Career<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Mind</span></span>
    </span>
  )
}

function formatDate(value: string | null) {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function formatDuration(seconds: number | null) {
  if (!seconds) return 'Not completed'
  return `${Math.max(1, Math.round(seconds / 60))} min`
}

export default async function HistoryPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [me, historyResult] = await Promise.all([
    api.auth.me(session.accessToken).catch(() => null),
    api.interviews.history(session.accessToken).catch(() => []),
  ])
  const sessions: HistoryItem[] = Array.isArray(historyResult)
    ? historyResult.filter((item): item is HistoryItem => Boolean(item && typeof item === 'object' && 'id' in item))
    : []
  const completed = sessions.filter(item => item.status === 'completed')
  const scored = completed.filter(item => item.overall_score != null)
  const averageScore = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + (item.overall_score ?? 0), 0) / scored.length)
    : null
  const firstName = session.user?.name?.split(' ')[0] || 'Candidate'

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between">
          <Link href="/dashboard" aria-label="CareerMind dashboard"><Brand /></Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:inline-flex ${me?.has_free_interview ?? session.hasFreeInterview ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
              <Zap className="h-3.5 w-3.5" fill="currentColor" />
              {me?.has_free_interview ?? session.hasFreeInterview ? '1 free interview remaining' : 'Pay as you practise'}
            </span>
            <SignOutButton />
            <span className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">{firstName.charAt(0).toUpperCase()}</span>
              <span className="hidden text-sm font-bold text-slate-800 md:block">{firstName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden min-h-[calc(100vh-5rem)] w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-5 py-8 lg:flex">
          <nav className="space-y-2" aria-label="Dashboard navigation">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"><Home className="h-5 w-5" />Dashboard</Link>
            <Link href="/setup" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"><Mic className="h-5 w-5" />New interview</Link>
            <Link href="/history" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3.5 text-sm font-bold text-indigo-600 shadow-sm"><History className="h-5 w-5" />History</Link>
          </nav>
          <div className="mt-auto rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Sparkles className="h-5 w-5" /></span>
            <h2 className="mt-4 text-sm font-extrabold text-slate-900">Keep building confidence</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">Review your previous sessions and keep practising for your next opportunity.</p>
            <Link href="/setup" className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600">Start practising <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto max-w-6xl">
            <nav className="mb-8 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile dashboard navigation">
              <Link href="/dashboard" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm"><Home className="h-3.5 w-3.5" />Dashboard</Link>
              <Link href="/setup" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm"><Mic className="h-3.5 w-3.5" />New interview</Link>
              <Link href="/history" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white"><History className="h-3.5 w-3.5" />History</Link>
            </nav>

            <section className="relative overflow-hidden rounded-[30px] border border-indigo-100 bg-[radial-gradient(circle_at_87%_45%,rgba(167,139,250,.28),transparent_27%),linear-gradient(135deg,#ffffff_0%,#f4f7ff_58%,#eef2ff_100%)] p-7 shadow-[0_20px_60px_rgba(79,70,229,.08)] sm:p-10">
              <div className="absolute -right-8 -top-16 h-60 w-60 rounded-full border-[28px] border-white/50" />
              <div className="relative">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 transition hover:text-indigo-800"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Your practice</p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl">Interview history</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Review every session, revisit feedback and track your progress over time.</p>
              </div>
            </section>

            <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Interview statistics">
              <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(30,41,59,.05)]"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total sessions</p><p className="mt-2 text-3xl font-black text-slate-950">{sessions.length}</p></div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(30,41,59,.05)]"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Completed</p><p className="mt-2 text-3xl font-black text-emerald-600">{completed.length}</p></div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(30,41,59,.05)]"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average score</p><p className="mt-2 text-3xl font-black text-indigo-600">{averageScore == null ? '—' : `${averageScore}%`}</p></div>
            </section>

            <section className="pt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">All sessions</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Your interviews</h2></div>
                <Link href="/setup" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-extrabold text-white shadow-lg transition hover:bg-indigo-950 sm:px-5 sm:text-sm">New interview <ArrowRight className="h-4 w-4" /></Link>
              </div>
              {sessions.length ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(30,41,59,.05)]">
                  {sessions.map((item, index) => (
                    <article key={item.id} className={`flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${index !== sessions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex min-w-0 items-center gap-4">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{item.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}</span>
                        <div className="min-w-0"><h3 className="truncate font-extrabold capitalize text-slate-900">{item.role}</h3><p className="mt-1 text-xs capitalize leading-5 text-slate-500">{item.level} · {item.focus} · {formatDate(item.created_at)} · {formatDuration(item.duration_seconds)}</p></div>
                      </div>
                      <div className="flex items-center justify-between gap-5 pl-16 sm:justify-end sm:pl-0">
                        {item.overall_score != null && <div className="text-right"><p className="text-lg font-black text-slate-900">{item.overall_score}%</p><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Score</p></div>}
                        {item.status === 'completed' ? <Link href={`/feedback?id=${item.id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-indigo-600">View feedback <ArrowRight className="h-4 w-4" /></Link> : item.status === 'setup' && item.paid ? <span className="flex items-center gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Ready to start</span><Link href={`/check?id=${item.id}`} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-indigo-600">Start <ArrowRight className="h-4 w-4" /></Link></span> : <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold capitalize text-amber-700">{item.status}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_14px_35px_rgba(30,41,59,.05)]">
                  <div className="absolute -left-16 bottom-0 h-36 w-72 rounded-full bg-violet-50 blur-2xl" /><div className="absolute -right-16 top-0 h-36 w-72 rounded-full bg-sky-50 blur-2xl" />
                  <div className="relative"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Clock3 className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-extrabold text-slate-900">No sessions yet</h3><p className="mt-2 text-sm text-slate-500">Your interview history and feedback will appear here.</p><Link href="/setup" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-extrabold text-white shadow-lg transition hover:bg-indigo-950">Start your first interview <ArrowRight className="h-4 w-4" /></Link></div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
