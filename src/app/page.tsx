import Link from 'next/link'
import { Mic, Brain, FileText, BarChart3, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3 h-3" />
          Powered by OpenAI Realtime API
        </div>
        <h1 className="text-4xl font-medium text-gray-900 leading-tight mb-4">
          Practice interviews.<br />
          <span className="text-brand-500">Land the job.</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          CareerMind generates a tailored interview for any role or job description,
          then coaches you live with a real voice AI. No scripts. No nerves on the day.
        </p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Link href="/register" className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#pricing" className="btn-secondary px-6 py-3 text-base">
            View pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400">
          <span className="text-brand-500">1 free interview</span> on signup · No credit card required
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 grid grid-cols-3">
        {[
          { num: '10,000+', label: 'Interviews practised' },
          { num: '40+',     label: 'Roles covered' },
          { num: '4.8 / 5', label: 'Average rating' },
        ].map((s) => (
          <div key={s.label} className="py-8 text-center border-r border-gray-100 last:border-r-0">
            <div className="text-2xl font-medium text-gray-900 mb-1">{s.num}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-xs text-brand-500 uppercase tracking-widest mb-2">How it works</p>
        <h2 className="text-2xl font-medium text-gray-900 mb-8">Three steps then you're interviewing</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { n: '1', t: 'Pick your role', d: 'Choose from 40+ roles or paste the actual job description.' },
            { n: '2', t: 'Generate interview', d: 'Questions tailored to your exact role and level in seconds.' },
            { n: '3', t: 'Interview by voice', d: 'The AI asks, listens and follows up. A live coaching panel runs alongside.' },
          ].map((s) => (
            <div key={s.n} className="card">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center mb-3">
                {s.n}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">{s.t}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-8 pb-16 max-w-3xl mx-auto">
        <p className="text-xs text-brand-500 uppercase tracking-widest mb-2">Features</p>
        <h2 className="text-2xl font-medium text-gray-900 mb-8">Built for the real interview</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Mic,      color: 'bg-brand-50 text-brand-500', t: 'Real-time voice AI',       d: 'Natural voice conversation — not a script. The AI follows up on your answers the way a real interviewer would.' },
            { icon: FileText, color: 'bg-green-50 text-green-600', t: 'Paste any job description', d: 'Drop in a LinkedIn posting. CareerMind extracts requirements and builds questions from the actual JD.' },
            { icon: Brain,    color: 'bg-amber-50 text-amber-600', t: 'Live coaching panel',       d: 'Flags strong moments, tips for improvement, and question pitfalls in real time.' },
            { icon: BarChart3, color: 'bg-purple-50 text-purple-600', t: 'Detailed feedback report', d: 'Score per question with rubric breakdown. Downloadable PDF to track improvement across sessions.' },
          ].map((f) => (
            <div key={f.t} className="card">
              <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center mb-3`}>
                <f.icon className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">{f.t}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <p className="text-2xl font-medium text-gray-900 mb-2">
              Pay per minute
            </p>
            <p className="text-3xl font-medium text-brand-500 mb-1">
              £0.20 <span className="text-lg text-gray-400">/ minute</span>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              10 minutes minimum · 60 minutes maximum ·
              No subscription · No expiry
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500 mb-8">
              <span>10 min = £2.00</span>
              <span>15 min = £3.00</span>
              <span>20 min = £4.00</span>
              <span>30 min = £6.00</span>
            </div>
            <Link href="/register" className="btn-primary px-8 py-3 text-base">
              Start free — first interview on us
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-md mx-auto card">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Ready to start practising?</h2>
          <p className="text-sm text-gray-400 mb-6">Your first interview is free. No card needed.</p>
          <Link href="/register" className="btn-primary flex items-center justify-center gap-2 w-full py-3">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        © 2026 CareerMind · Suftnet Ltd ·{' '}
        <Link href="/privacy" className="text-brand-500 hover:underline">Privacy</Link>
        {' · '}
        <Link href="/terms" className="text-brand-500 hover:underline">Terms</Link>
      </footer>
    </div>
  )
}
