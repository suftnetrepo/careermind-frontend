'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { priceDisplay } from '@/lib/pricing'
import {
  ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2, Clock3, Code2,
  Database, FileCheck2, Headphones, Lightbulb, ListChecks, Loader2, Mic,
  MessageSquareText, Sparkles, Target, Trophy, Volume2, Zap,
} from 'lucide-react'

const SCORE_WEIGHTS = [
  { label: 'Technical depth', pct: 40, color: 'bg-gradient-to-r from-indigo-500 to-violet-500', icon: Code2, iconColor: 'bg-violet-100 text-violet-600' },
  { label: 'Communication', pct: 25, color: 'bg-gradient-to-r from-emerald-400 to-emerald-500', icon: MessageSquareText, iconColor: 'bg-emerald-100 text-emerald-600' },
  { label: 'Examples used', pct: 20, color: 'bg-gradient-to-r from-amber-400 to-orange-400', icon: Lightbulb, iconColor: 'bg-amber-100 text-amber-600' },
  { label: 'Structure', pct: 15, color: 'bg-gradient-to-r from-sky-400 to-indigo-400', icon: ListChecks, iconColor: 'bg-sky-100 text-sky-600' },
]

const TOPIC_STYLES = [
  { icon: Code2, color: 'bg-sky-100 text-sky-600' },
  { icon: Database, color: 'bg-amber-100 text-amber-600' },
  { icon: BarChart3, color: 'bg-violet-100 text-violet-600' },
  { icon: Lightbulb, color: 'bg-rose-100 text-rose-600' },
  { icon: Target, color: 'bg-emerald-100 text-emerald-600' },
  { icon: FileCheck2, color: 'bg-indigo-100 text-indigo-600' },
]

function Brand() {
  return <span className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-slate-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.24)]"><Mic className="h-5 w-5" strokeWidth={2.5} /></span><span>Career<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Mind</span></span></span>
}

export default function PreviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('cm_interview')
    if (!stored) { router.push('/setup'); return }
    try { setInterview(JSON.parse(stored)) } catch { sessionStorage.removeItem('cm_interview'); router.push('/setup') }
  }, [router])

  const topics = useMemo(() => {
    const questions = Array.isArray(interview?.questions) ? interview.questions : []
    const unique = new Map<string, { topic: string; detail: string }>()
    questions.forEach((question: any) => {
      const topic = typeof question?.topic === 'string' && question.topic.trim() ? question.topic.trim() : 'Interview technique'
      if (!unique.has(topic)) {
        const type = typeof question?.type === 'string' ? question.type.replaceAll('_', ' ') : 'role-specific'
        const difficulty = typeof question?.difficulty === 'string' ? question.difficulty : 'focused'
        unique.set(topic, { topic, detail: `${difficulty} · ${type}` })
      }
    })
    return Array.from(unique.values()).slice(0, 6)
  }, [interview])

  const duration = interview?.duration_minutes ?? 15
  const questionCount = interview?.questions?.length ?? 0
  const price = priceDisplay(interview?.duration_minutes, interview?.amount_pence)
  const firstName = session?.user?.name?.split(' ')[0] || 'Candidate'

  async function handleStart() {
    if (!session?.accessToken || !interview?.interview_id) return
    if (!interview.is_free) { router.push('/checkout'); return }
    setError(''); setLoading(true)
    try {
      await api.interviews.start(session.accessToken, interview.interview_id)
      router.push(`/interview?id=${interview.interview_id}`)
    } catch (startError: any) {
      setError(startError.message || 'Unable to start the interview. Please try again.')
      setLoading(false)
    }
  }

  if (!interview) return <div className="flex min-h-screen items-center justify-center bg-[#f8faff]"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /></div>

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_95%_8%,rgba(196,181,253,.28),transparent_25%),radial-gradient(circle_at_5%_75%,rgba(191,219,254,.24),transparent_25%),#f8faff] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
          <Link href="/dashboard" aria-label="CareerMind dashboard"><Brand /></Link>
          <div className="flex items-center gap-3 sm:gap-5"><span className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:inline-flex ${interview.is_free ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}><Zap className="h-3.5 w-3.5" fill="currentColor" />{interview.is_free ? '1 free interview remaining' : `${price} interview`}</span><button onClick={() => router.push('/setup')} className="hidden items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 sm:inline-flex"><ArrowLeft className="h-4 w-4" />Change setup</button><span className="hidden h-7 w-px bg-slate-200 md:block" /><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">{firstName.charAt(0).toUpperCase()}</span><span className="hidden text-sm font-bold text-slate-800 md:block">{firstName}</span></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <button onClick={() => router.push('/setup')} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 sm:hidden"><ArrowLeft className="h-4 w-4" />Change setup</button>

        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-[radial-gradient(circle_at_80%_35%,rgba(167,139,250,.25),transparent_28%),linear-gradient(135deg,#fff_0%,#f7f8ff_60%,#eef2ff_100%)] px-6 py-12 text-center shadow-[0_24px_70px_rgba(79,70,229,.09)] sm:px-10 sm:py-14">
          <div className="absolute -left-24 bottom-0 h-52 w-80 rounded-full bg-sky-100/50 blur-2xl" /><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[30px] border-white/50" />
          <div className="relative"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100"><CheckCircle2 className="h-10 w-10" strokeWidth={2.5} /></span><p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Setup complete</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-5xl">Your interview is <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">ready</span></h1><p className="mt-4 text-sm capitalize text-slate-500 sm:text-lg">{interview.role} · {String(interview.level).replace('midlevel', 'mid-level')} · {duration} minutes · {questionCount} questions</p>{interview.is_free && <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-extrabold text-emerald-700"><Check className="h-4 w-4" />Using your free interview ({duration} minutes)</span>}</div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><FileCheck2 className="h-6 w-6" /></span><div><h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-900">Topics covered</h2><p className="mt-1 text-sm text-slate-500">Your interview will focus on these generated areas.</p></div></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-extrabold text-indigo-600"><ListChecks className="h-4 w-4" />{questionCount} questions</span></div>
          <div className="mt-7 grid gap-3 md:grid-cols-2">{topics.length ? topics.map((item, index) => { const style = TOPIC_STYLES[index % TOPIC_STYLES.length]; const Icon = style.icon; return <div key={item.topic} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.color}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold capitalize text-slate-900">{item.topic}</h3><p className="mt-1 truncate text-xs capitalize text-slate-500">{item.detail}</p></div><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" /></div> }) : <div className="col-span-full rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Your personalised topics have been prepared.</div>}</div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-8">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><BarChart3 className="h-6 w-6" /></span><div><h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-900">What we score</h2><p className="mt-1 text-sm text-slate-500">A balanced rubric provides focused feedback after your interview.</p></div></div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center"><div className="space-y-5">{SCORE_WEIGHTS.map(item => <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:grid-cols-[180px_1fr_42px]"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconColor}`}><item.icon className="h-4 w-4" /></span><span className="hidden text-sm font-bold text-slate-700 sm:block">{item.label}</span></div><div><span className="mb-2 block text-xs font-bold text-slate-600 sm:hidden">{item.label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} /></div></div><span className="text-right text-sm font-extrabold text-slate-500">{item.pct}%</span></div>)}</div><div className="rounded-[22px] border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><Trophy className="h-5 w-5" /></span><h3 className="font-extrabold text-violet-700">Personalised feedback</h3></div><ul className="mt-5 space-y-3 text-sm text-slate-600">{['Detailed score breakdown', 'Strengths and areas to improve', 'Tips and suggested resources', 'Progress saved for future review'].map(item => <li key={item} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />{item}</li>)}</ul></div></div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,.05)] sm:p-8"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><Headphones className="h-6 w-6" /></span><div><h2 className="text-xl font-extrabold tracking-[-0.02em] text-slate-900">Before you start</h2><p className="mt-1 text-sm text-slate-500">A few quick tips for the best experience.</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ icon: Headphones, color: 'bg-violet-100 text-violet-600', title: 'Use headphones', text: 'Get the clearest voice experience with good audio.' }, { icon: Mic, color: 'bg-sky-100 text-sky-600', title: 'Speak clearly', text: 'Alex listens and responds naturally.' }, { icon: Clock3, color: 'bg-emerald-100 text-emerald-600', title: 'Take your time', text: `You have ${duration} minutes — pace yourself.` }, { icon: Lightbulb, color: 'bg-amber-100 text-amber-600', title: "It's fine to pause", text: 'Take a moment to think before answering.' }].map(item => <div key={item.title} className="rounded-[20px] border border-slate-100 bg-slate-50/60 p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}><item.icon className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-extrabold text-slate-900">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{item.text}</p></div>)}</div></section>

        <div className="mx-auto max-w-3xl pb-10 pt-7">{error && <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-600">{error}</div>}<button onClick={handleStart} disabled={loading || !session?.accessToken} className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-lg font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{loading ? <><Loader2 className="h-5 w-5 animate-spin" />{interview.is_free ? 'Starting your interview...' : 'Redirecting to payment...'}</> : <><Mic className="h-5 w-5" />{interview.is_free ? 'Start free interview' : `Pay ${price} and start`}<ArrowRight className="h-5 w-5" /></>}</button><p className="mt-3 text-center text-xs text-slate-400">Check your microphone and find a quiet place before you begin.</p></div>
      </main>
    </div>
  )
}
