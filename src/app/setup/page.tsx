'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { SignOutButton } from '@/components/layout/Header'
import {
  ArrowRight, BarChart3, BriefcaseBusiness, Check, CheckCircle2, Code2,
  FileText, Heart, History, Home, Lightbulb, Loader2, Mic, Play,
  Sparkles, Target, Upload, Users, Volume2, Zap,
} from 'lucide-react'

const ROLES = [
  { group: 'Engineering', roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Python Developer', 'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer', 'Site Reliability Engineer', 'Security Engineer', 'QA Engineer', 'Embedded Systems Engineer'] },
  { group: 'Data and AI', roles: ['AI Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer', 'ML Engineer', 'BI Analyst'] },
  { group: 'Product and Design', roles: ['Product Manager', 'Technical Product Manager', 'Product Designer', 'UX Researcher', 'UI Designer'] },
  { group: 'Business', roles: ['Business Analyst', 'Solutions Architect', 'Project Manager', 'Programme Manager', 'Scrum Master', 'Delivery Manager'] },
  { group: 'Leadership', roles: ['Engineering Manager', 'Head of Engineering', 'VP Engineering', 'CTO', 'Head of Product', 'Head of Data'] },
  { group: 'Finance and Ops', roles: ['Financial Analyst', 'Operations Manager', 'Strategy Consultant', 'Management Consultant'] },
  { group: 'Sales and Marketing', roles: ['Sales Engineer', 'Account Executive', 'Growth Manager', 'Marketing Manager'] },
]

const PRESETS = ['Make it challenging', 'Focus on my weak areas', 'Be encouraging — I get nervous', 'Senior level questions only', 'Focus on system design', 'Focus on behavioural questions']
const VOICES = [
  { id: 'alloy', name: 'Alloy', desc: 'Neutral and balanced', color: 'bg-violet-100 text-violet-600' },
  { id: 'ash', name: 'Ash', desc: 'Calm and measured', color: 'bg-sky-100 text-sky-600' },
  { id: 'coral', name: 'Coral', desc: 'Warm and friendly', color: 'bg-rose-100 text-rose-600' },
  { id: 'echo', name: 'Echo', desc: 'Clear and steady', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'marin', name: 'Marin', desc: 'Natural and conversational', color: 'bg-amber-100 text-amber-600' },
  { id: 'cedar', name: 'Cedar', desc: 'Relaxed and confident', color: 'bg-cyan-100 text-cyan-600' },
]
const DURATIONS = [
  { min: 15, price: '£3.00', label: 'Quick practice' }, { min: 30, price: '£6.00', label: 'Standard session' },
  { min: 45, price: '£9.00', label: 'Deep dive' }, { min: 60, price: '£12.00', label: 'Full interview' },
]
const LEVELS = ['Junior', 'Mid-level', 'Senior']
const FOCUSES = ['Technical', 'Behavioural', 'Mixed']
const LEVEL_ICONS = [Sparkles, Users, Target]
const FOCUS_ICONS = [Code2, Users, Sparkles]
const PRESET_ICONS = [BarChart3, Target, Heart, Users, BriefcaseBusiness, FileText]

function Brand() {
  return <span className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-slate-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.24)]"><Mic className="h-5 w-5" strokeWidth={2.5} /></span><span>Career<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Mind</span></span></span>
}

function StepHeading({ number, title, description }: { number: number; title: string; description?: string }) {
  return <div className="mb-5 flex items-start gap-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white shadow-md shadow-indigo-200">{number}</span><div><h2 className="text-lg font-extrabold tracking-[-0.02em] text-slate-900">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}</div></div>
}

export default function SetupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const isCustomRole = role === 'other'
  const effectiveRole = (isCustomRole ? customRole : role).trim()
  const [level, setLevel] = useState('Mid-level')
  const [focus, setFocus] = useState('Mixed')
  const [duration, setDuration] = useState(30)
  const [jd, setJd] = useState('')
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState('')
  const [cvUploading, setCvUploading] = useState(false)
  const [cvError, setCvError] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [freshFree, setFreshFree] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isFree = (freshFree ?? session?.hasFreeInterview) === true
  const firstName = session?.user?.name?.split(' ')[0] || 'Candidate'

  useEffect(() => {
    if (!session?.accessToken) return
    api.auth.me(session.accessToken).then(me => setFreshFree(me.has_free_interview)).catch(() => {})
  }, [session?.accessToken])

  const togglePreset = (preset: string) => setSelectedPresets(previous => previous.includes(preset) ? previous.filter(item => item !== preset) : [...previous, preset])

  async function handleCvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!session?.accessToken) { router.push('/login'); return }
    if (!file.name.toLowerCase().endsWith('.pdf')) { setCvError('Please upload a PDF file'); return }
    setCvFile(file); setCvUploading(true); setCvError('')
    try {
      const data = await api.interviews.uploadCv(session.accessToken, file)
      setCvText(data.cv_text)
    } catch (uploadError: any) {
      setCvError(uploadError.message || 'Upload failed'); setCvFile(null); setCvText('')
    } finally { setCvUploading(false) }
  }

  async function handleGenerate() {
    if (!session?.accessToken) { router.push('/login'); return }
    if (!effectiveRole) return
    setError(''); setLoading(true)
    try {
      const result = await api.interviews.setup(session.accessToken, {
        role: effectiveRole, level: level.toLowerCase().replace('-', ''), focus: focus.toLowerCase(),
        duration_minutes: isFree ? 15 : duration, voice, job_description: jd || undefined, cv_text: cvText || undefined,
        custom_prompt: customPrompt || undefined, preset_prompts: selectedPresets.length ? selectedPresets : undefined,
      })
      sessionStorage.setItem('cm_interview', JSON.stringify(result))
      router.push('/preview')
    } catch (generateError: any) {
      setError(generateError.message || 'Failed to generate questions')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between">
          <Link href="/dashboard" aria-label="CareerMind dashboard"><Brand /></Link>
          <div className="flex items-center gap-3 sm:gap-5"><span className={`hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:inline-flex ${isFree ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}><Zap className="h-3.5 w-3.5" fill="currentColor" />{isFree ? '1 free interview remaining' : 'Pay as you practise'}</span><SignOutButton /><span className="hidden h-7 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">{firstName.charAt(0).toUpperCase()}</span><span className="hidden text-sm font-bold text-slate-800 md:block">{firstName}</span></div></div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white px-5 py-8 lg:flex">
          <nav className="space-y-2" aria-label="Dashboard navigation">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"><Home className="h-5 w-5" />Dashboard</Link>
            <Link href="/setup" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3.5 text-sm font-bold text-indigo-600 shadow-sm"><Mic className="h-5 w-5" />New interview</Link>
            <Link href="/history" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"><History className="h-5 w-5" />History</Link>
          </nav>
          <div className="mt-auto rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Lightbulb className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-extrabold text-slate-900">Prepare with purpose</h3><p className="mt-2 text-xs leading-5 text-slate-500">Add your CV and job description for more relevant questions.</p></div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
          <nav className="mx-auto mb-8 flex max-w-6xl gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"><Link href="/dashboard" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm"><Home className="h-3.5 w-3.5" />Dashboard</Link><Link href="/setup" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white"><Mic className="h-3.5 w-3.5" />New interview</Link><Link href="/history" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm"><History className="h-3.5 w-3.5" />History</Link></nav>
          <div className="mx-auto grid max-w-6xl items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(30,41,59,.06)]">
              <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_85%_30%,rgba(196,181,253,.25),transparent_28%),linear-gradient(135deg,#fff,#f8f9ff)] px-6 py-7 sm:px-9"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Create an interview</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Build your personalised practice</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Tell Alex what you are preparing for. Every choice helps shape a more realistic interview.</p></div>
              <div className="divide-y divide-slate-100 px-6 sm:px-9">
                <section className="py-8"><StepHeading number={1} title="Pick a role" description="This sets the scoring rubric and question focus." /><div className="relative"><BriefcaseBusiness className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" /><select value={role} onChange={event => setRole(event.target.value)} className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-12 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"><option value="">Select a role...</option>{ROLES.map(group => <optgroup key={group.group} label={group.group}>{group.roles.map(item => <option key={item} value={item}>{item}</option>)}</optgroup>)}<option value="other">Other — type your role</option></select><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500">⌄</span></div>{isCustomRole && <input value={customRole} onChange={event => setCustomRole(event.target.value)} maxLength={100} placeholder="Type your role..." className="mt-3 min-h-13 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />}</section>

                <section className="py-8"><StepHeading number={2} title="Level and focus" /><div className="space-y-6"><div><p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">Experience level</p><div className="flex flex-wrap gap-2.5">{LEVELS.map((item, index) => { const Icon = LEVEL_ICONS[index]; const active = level === item; return <button key={item} onClick={() => setLevel(item)} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-bold transition ${active ? 'border-indigo-400 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200'}`}><Icon className="h-4 w-4" />{item}</button> })}</div></div><div><p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">Question focus</p><div className="flex flex-wrap gap-2.5">{FOCUSES.map((item, index) => { const Icon = FOCUS_ICONS[index]; const active = focus === item; return <button key={item} onClick={() => setFocus(item)} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-bold transition ${active ? 'border-indigo-400 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200'}`}><Icon className="h-4 w-4" />{item}</button> })}</div></div></div></section>

                <section className="py-8"><StepHeading number={3} title="Duration" description={isFree ? undefined : '£0.20 per minute · charged once before your interview starts.'} />{isFree ? <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-emerald-800">Using your free interview</p><p className="mt-1 text-xs text-emerald-700">15 minutes · no card needed</p></div></div> : <div className="grid gap-3 sm:grid-cols-2">{DURATIONS.map(item => { const active = duration === item.min; return <button key={item.min} onClick={() => setDuration(item.min)} className={`rounded-2xl border-2 p-4 text-left transition ${active ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}><div className="flex items-center justify-between"><span className={`text-sm font-extrabold ${active ? 'text-indigo-700' : 'text-slate-900'}`}>{item.min} minutes</span><span className={`text-lg font-black ${active ? 'text-indigo-600' : 'text-slate-700'}`}>{item.price}</span></div><p className="mt-2 text-xs text-slate-500">{item.label}</p></button> })}</div>}</section>

                <section className="py-8"><StepHeading number={4} title="Choose your interviewer's voice" description="Alex will speak to you in this voice." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{VOICES.map(item => { const active = voice === item.id; return <button key={item.id} onClick={() => setVoice(item.id)} className={`relative rounded-2xl border-2 p-4 text-left transition ${active ? 'border-indigo-500 bg-indigo-50/70 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>{active && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white"><Check className="h-3 w-3" /></span>}<div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}><Play className="h-4 w-4 fill-current" /></span><div><p className={`text-sm font-extrabold ${active ? 'text-indigo-700' : 'text-slate-900'}`}>{item.name}</p><div className="mt-1 flex items-center gap-1 text-indigo-300"><Volume2 className="h-3 w-3" /><span className="tracking-[-2px]">|||||</span></div></div></div><p className="mt-3 text-xs leading-5 text-slate-500">{item.desc}</p></button> })}</div></section>

                <section className="py-8"><StepHeading number={5} title="Interview preferences" description="Optional — help Alex tailor the interview to you." /><div className="flex flex-wrap gap-2.5">{PRESETS.map((item, index) => { const Icon = PRESET_ICONS[index]; const active = selectedPresets.includes(item); return <button key={item} onClick={() => togglePreset(item)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${active ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200'}`}><Icon className="h-4 w-4" />{item}</button> })}</div><textarea value={customPrompt} onChange={event => setCustomPrompt(event.target.value)} maxLength={1000} placeholder="Anything else you want Alex to know? e.g. 'I have 5 years Python experience' or 'Ask me about my last project'" className="mt-4 min-h-24 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" /></section>

                <section className="py-8"><StepHeading number={6} title="Add your CV or job description" description="Both are optional. More context creates a more personalised interview." /><div className="space-y-5"><div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">Your CV (PDF)</p><label className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${cvFile ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40'}`}><input type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />{cvUploading ? <Loader2 className="h-7 w-7 animate-spin text-indigo-500" /> : cvFile ? <CheckCircle2 className="h-7 w-7 text-emerald-500" /> : <Upload className="h-7 w-7 text-indigo-500" />}<span className={`mt-3 text-sm font-extrabold ${cvFile ? 'text-indigo-700' : 'text-slate-700'}`}>{cvUploading ? 'Reading CV...' : cvFile ? cvFile.name : 'Click to upload PDF'}</span><span className="mt-1 text-xs text-slate-400">Maximum file size 5MB</span></label>{cvError && <p className="mt-2 text-xs font-semibold text-red-500">{cvError}</p>}</div><div><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-slate-400">Job description</p><textarea value={jd} onChange={event => setJd(event.target.value)} placeholder="Paste the job posting here..." className="min-h-48 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /></div></div></section>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 p-6 sm:p-8">{error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}<button onClick={handleGenerate} disabled={!effectiveRole || loading || cvUploading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-base font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{loading ? <><Loader2 className="h-5 w-5 animate-spin" />Generating interview...</> : isFree ? <><Sparkles className="h-5 w-5" />Generate free interview <ArrowRight className="h-5 w-5" /></> : <><Sparkles className="h-5 w-5" />Generate interview — {DURATIONS.find(item => item.min === duration)?.price}<ArrowRight className="h-5 w-5" /></>}</button></div>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28">
              <div className="relative overflow-hidden rounded-[28px] border border-indigo-100 bg-[radial-gradient(circle_at_70%_12%,rgba(167,139,250,.35),transparent_30%),linear-gradient(145deg,#f9faff,#eef2ff)] p-7 shadow-[0_20px_50px_rgba(79,70,229,.08)]"><div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border-[20px] border-white/40" /><span className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-200"><Mic className="h-8 w-8" /></span><h2 className="relative mt-7 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Your AI interviewer</h2><p className="relative mt-3 text-sm leading-6 text-slate-600">Get realistic, role-specific questions and focused feedback to help you prepare with confidence.</p><div className="relative mt-7 space-y-5">{[{ icon: Target, color: 'bg-emerald-100 text-emerald-600', title: 'Personalised questions', text: 'Tailored to your role, level and focus' }, { icon: Mic, color: 'bg-violet-100 text-violet-600', title: 'Natural conversation', text: 'A realistic voice interview experience' }, { icon: BarChart3, color: 'bg-amber-100 text-amber-600', title: 'Instant feedback', text: 'Know what to improve straight away' }].map(item => <div key={item.title} className="flex gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.color}`}><item.icon className="h-5 w-5" /></span><div><p className="text-sm font-extrabold text-slate-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.text}</p></div></div>)}</div></div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(30,41,59,.05)]"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Lightbulb className="h-5 w-5" /></span><h3 className="font-extrabold text-slate-900">Tips for a great interview</h3></div><ul className="mt-5 space-y-4 text-sm text-slate-600">{['Choose the role and level carefully', 'Use a quiet environment', 'Speak naturally, like a real interview', 'Be honest for more useful feedback', 'Review your feedback after each session'].map(item => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />{item}</li>)}</ul></div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
