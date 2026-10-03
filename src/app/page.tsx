import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, CheckCircle2, FileText, Lightbulb, Mic, Pause, Play, Quote, ShieldCheck, Sparkles, Star, Users, Volume2, WandSparkles } from 'lucide-react'

const steps = [
  { icon: FileText, title: 'Pick your role', description: 'Choose a role or paste the actual job description you are applying for.' },
  { icon: WandSparkles, title: 'Generate your interview', description: 'Get focused questions tailored to your experience, role and seniority.' },
  { icon: Mic, title: 'Practise by voice', description: 'Answer naturally while your AI coach listens, follows up and guides you.' },
]

const features = [
  { icon: Mic, iconClass: 'bg-violet-100 text-violet-600', title: 'Real-time voice AI', description: 'A natural interview conversation, with thoughtful follow-up questions based on your answers.' },
  { icon: FileText, iconClass: 'bg-emerald-100 text-emerald-600', title: 'Use any job description', description: 'Paste a vacancy and CareerMind turns its requirements into realistic, relevant questions.' },
  { icon: BarChart3, iconClass: 'bg-sky-100 text-sky-600', title: 'Live feedback and scoring', description: 'See where your answers are strong and receive practical guidance while you practise.' },
  { icon: Lightbulb, iconClass: 'bg-amber-100 text-amber-600', title: 'Actionable coaching', description: 'Turn broad feedback into clear next steps you can use in your next interview.' },
  { icon: ShieldCheck, iconClass: 'bg-indigo-100 text-indigo-600', title: 'Private practice space', description: 'Build confidence at your own pace in a calm environment designed for focused preparation.' },
  { icon: BriefcaseBusiness, iconClass: 'bg-rose-100 text-rose-600', title: 'Built around your role', description: 'Prepare for behavioural, leadership and role-specific questions instead of generic scripts.' },
]

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.04em] ${inverted ? 'text-white' : 'text-slate-950'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.25)]"><Mic className="h-[18px] w-[18px]" strokeWidth={2.5} /></span>
      <span>Career<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Mind</span></span>
    </span>
  )
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[690px] lg:ml-auto">
      <div className="absolute -left-8 top-16 h-56 w-56 rounded-full bg-violet-300/25 blur-2xl" />
      <div className="absolute -right-8 bottom-4 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute -top-12 right-20 z-20 hidden h-16 w-16 items-center justify-center rounded-full border border-white bg-white text-violet-600 shadow-xl sm:flex"><Lightbulb className="h-7 w-7" /></div>
      <div className="relative z-10 rounded-[30px] border border-white/80 bg-white/80 p-3 shadow-[0_32px_90px_rgba(82,82,180,.16)] backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between px-1"><Brand /><div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />00:42</div></div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative min-h-[340px] overflow-hidden rounded-[23px] bg-slate-200 sm:min-h-[390px]">
            <Image src="/images/interview-candidate.png" alt="Candidate practising an interview with CareerMind" fill priority sizes="(max-width: 640px) 100vw, 470px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
              <button aria-label="Pause interview" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur"><Pause className="h-4 w-4" fill="currentColor" /></button>
              <button aria-label="Mute microphone" className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-950/20"><Mic className="h-4 w-4" /></button>
              <button aria-label="Audio settings" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur"><Volume2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold text-slate-800">Live feedback</span><span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">On track</span></div>
              <ul className="space-y-3 text-[11px] font-medium text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Clear structure</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong example</li>
                <li className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Add a measurable result</li>
              </ul>
            </div>
            <div className="flex-1 rounded-[20px] bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600"><Volume2 className="h-3.5 w-3.5" /> Next question</div>
              <p className="text-sm font-semibold leading-6 text-slate-800">How do you handle conflicting priorities?</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-5 top-[38%] z-20 hidden max-w-[210px] rounded-2xl border border-white bg-white/95 p-4 shadow-xl backdrop-blur md:block"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"><Volume2 className="h-4 w-4" /></span><p className="text-xs font-semibold leading-5 text-slate-700">Tell me about a time you solved a complex problem.</p></div></div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <div className="relative bg-[radial-gradient(circle_at_82%_22%,rgba(199,210,254,.46),transparent_27%),radial-gradient(circle_at_7%_58%,rgba(224,231,255,.55),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]">
        <header className="relative z-50 px-5 sm:px-8">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
            <Link href="/" aria-label="CareerMind home"><Brand /></Link>
            <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex" aria-label="Main navigation">
              <a href="#features" className="transition hover:text-indigo-600">Features</a><a href="#how-it-works" className="transition hover:text-indigo-600">How it works</a><a href="#roles" className="transition hover:text-indigo-600">Roles</a><a href="#pricing" className="transition hover:text-indigo-600">Pricing</a><a href="#stories" className="transition hover:text-indigo-600">Testimonials</a>
            </nav>
            <div className="flex items-center gap-5"><Link href="/login" className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600">Log in</Link><Link href="/register" className="hidden min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-indigo-950 sm:inline-flex">Get started free<ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </header>

        <section className="relative px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:pb-24 lg:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[.88fr_1.12fr]">
            <div className="relative z-20">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/90 px-4 py-2 text-xs font-bold text-indigo-600"><Sparkles className="h-3.5 w-3.5" /> Powered by OpenAI Realtime API</div>
              <h1 className="max-w-2xl text-[clamp(3rem,6.3vw,5.5rem)] font-extrabold leading-[.98] tracking-[-0.065em] text-slate-950">Practice interviews.<br /><span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">Land the job.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">CareerMind creates a tailored interview for any role or job description, then coaches you live with a natural voice AI.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-slate-950 px-7 text-base font-bold text-white shadow-xl shadow-indigo-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-950">Start free <ArrowRight className="h-5 w-5" /></Link>
                <a href="#how-it-works" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-7 text-base font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50"><Play className="h-4 w-4 fill-slate-800" /> See how it works</a>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <div className="flex -space-x-2" aria-hidden="true">{['bg-amber-200', 'bg-rose-200', 'bg-sky-200', 'bg-emerald-200'].map((color, i) => <span key={color} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white ${color} text-xs font-bold text-slate-700`}>{['AM', 'JD', 'SK', 'LR'][i]}</span>)}</div>
                <div><div className="flex gap-0.5 text-amber-400" aria-label="Five star rating">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div><span className="mt-1 block text-xs">Join candidates building interview confidence</span></div>
              </div>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section className="px-5 pb-14 sm:px-8 lg:pb-20" aria-label="Product highlights"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[26px] border border-slate-100 bg-white/90 shadow-[0_20px_55px_rgba(30,41,59,.07)] backdrop-blur md:grid-cols-4">
          {[{ icon: Users, title: 'Role-specific', text: 'Tailored practice' }, { icon: BriefcaseBusiness, title: 'Any role', text: 'Use a job description' }, { icon: BarChart3, title: 'Instant feedback', text: 'Actionable coaching' }, { icon: ShieldCheck, title: 'Private by design', text: 'Practise with confidence' }].map((item, i) => <div key={item.title} className="flex items-center gap-4 border-b border-slate-100 px-6 py-6 last:border-0 md:border-b-0 md:border-r md:last:border-r-0 lg:px-8"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${['bg-violet-100 text-violet-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-sky-100 text-sky-600'][i]}`}><item.icon className="h-5 w-5" /></span><div><p className="font-extrabold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.text}</p></div></div>)}
        </div></section>
      </div>

      <section id="how-it-works" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl">
        <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">How it works</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">Three steps, then you&apos;re interviewing</h2><p className="mt-4 text-lg leading-8 text-slate-500">From job description to realistic practice in just a few minutes.</p></div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">{steps.map((step, i) => <div key={step.title} className="group relative rounded-[24px] border border-slate-200 bg-white p-7 shadow-[0_14px_36px_rgba(30,41,59,.05)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"><span className="absolute right-6 top-6 text-5xl font-black text-slate-100">0{i + 1}</span><span className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600"><step.icon className="h-6 w-6" /></span><h3 className="text-lg font-extrabold text-slate-900">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">{step.description}</p></div>)}</div>
      </div></section>

      <section id="features" className="scroll-mt-20 bg-slate-50/70 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Features</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">Built for the real interview</h2><p className="mt-4 text-lg text-slate-500">Everything you need to prepare, practise and improve.</p></div><Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800">Try every feature <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map(feature => <div key={feature.title} className="rounded-[24px] border border-slate-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(30,41,59,.04)]"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconClass}`}><feature.icon className="h-5 w-5" /></span><h3 className="mt-6 text-lg font-extrabold text-slate-900">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{feature.description}</p></div>)}</div>
      </div></section>

      <section id="roles" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl items-center gap-12 rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-8 text-white sm:p-12 lg:grid-cols-2 lg:p-16">
        <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-300">Practise for your opportunity</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">One coach. Every role you&apos;re aiming for.</h2><p className="mt-5 max-w-xl text-base leading-8 text-indigo-100/70">Bring the job description and CareerMind adapts the interview to the skills, language and expectations that matter.</p><Link href="/register" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-indigo-50">Build my interview <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid grid-cols-2 gap-3 text-sm font-bold sm:grid-cols-3">{['Software engineering', 'Product management', 'Data & AI', 'Sales', 'Healthcare', 'Operations', 'Finance', 'Marketing', 'Leadership'].map(role => <div key={role} className="flex min-h-20 items-center gap-2 rounded-2xl border border-white/10 bg-white/[.07] px-4 backdrop-blur"><Check className="h-4 w-4 shrink-0 text-emerald-400" />{role}</div>)}</div>
      </div></section>

      <section id="stories" className="scroll-mt-20 bg-indigo-50/50 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-5xl text-center"><Quote className="mx-auto h-10 w-10 text-indigo-300" /><blockquote className="mt-7 text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-900 sm:text-4xl">“The best preparation feels like the real conversation—not another script to memorise.”</blockquote><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500">CareerMind gives every candidate a focused place to practise out loud, reflect and improve before the interview matters.</p></div></section>

      <section id="pricing" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl">
        <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Simple pricing</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">Pay only when you practise</h2><p className="mt-4 text-lg text-slate-500">Your first interview is free. No subscription and no card required.</p></div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-4">{[{ min: 15, price: '£3', label: 'Quick practice' }, { min: 30, price: '£6', label: 'Standard', popular: true }, { min: 45, price: '£9', label: 'Deep dive' }, { min: 60, price: '£12', label: 'Full interview' }].map(plan => <div key={plan.min} className={`relative rounded-[24px] border p-6 ${plan.popular ? 'border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'border-slate-200 bg-white text-slate-950'}`}>{plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">Most popular</span>}<p className={`text-xs font-bold ${plan.popular ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.min} minutes</p><p className="mt-5 text-4xl font-black tracking-tight">{plan.price}</p><p className={`mt-2 text-sm font-semibold ${plan.popular ? 'text-indigo-100' : 'text-slate-600'}`}>{plan.label}</p><Link href="/register" className={`mt-7 flex min-h-11 items-center justify-center rounded-xl text-sm font-extrabold ${plan.popular ? 'bg-white text-indigo-700' : 'bg-slate-950 text-white'}`}>Get started</Link></div>)}</div>
      </div></section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-28"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[32px] bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-12 text-center text-white sm:px-12 lg:flex-row lg:text-left"><div><h2 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Walk into your next interview ready.</h2><p className="mt-3 text-indigo-100">Start with one free interview. No credit card required.</p></div><Link href="/register" className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-xl bg-white px-7 font-extrabold text-indigo-700 shadow-xl transition hover:-translate-y-0.5">Start practising free <ArrowRight className="h-5 w-5" /></Link></div></section>

      <footer className="bg-slate-950 px-5 py-12 text-slate-400 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div><Brand inverted /><p className="mt-3 text-sm">AI interview practice designed to build real confidence.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link><Link href="/login" className="hover:text-white">Log in</Link></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs">© 2026 CareerMind · Suftnet Ltd</div></footer>
    </main>
  )
}
