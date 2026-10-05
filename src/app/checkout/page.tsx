'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { priceDisplay } from '@/lib/pricing'
import { ArrowLeft, ArrowRight, Check, Clock3, CreditCard, Loader2, LockKeyhole, Mic, ShieldCheck } from 'lucide-react'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [interview, setInterview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('cm_interview')
    if (!stored) { router.replace('/setup'); return }
    try { const data = JSON.parse(stored); if (data.is_free) router.replace('/preview'); else setInterview(data) } catch { router.replace('/setup') }
  }, [router])

  if (!interview) return <div className="flex min-h-screen items-center justify-center bg-[#f8faff]"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
  const duration = interview.duration_minutes ?? 15
  const price = priceDisplay(duration, interview.amount_pence)

  async function handleCheckout() {
    if (!session?.accessToken || !interview?.interview_id) return
    setLoading(true); setError('')
    try {
      const { checkout_url } = await api.sessions.checkout(session.accessToken, { interview_id: interview.interview_id, duration_minutes: duration, consent: consentGiven })
      window.location.href = checkout_url
    } catch (checkoutError: any) { setError(checkoutError.message || 'Unable to open secure checkout'); setLoading(false) }
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_90%_8%,rgba(196,181,253,.3),transparent_28%),radial-gradient(circle_at_6%_88%,rgba(191,219,254,.25),transparent_26%),#f8faff] px-5 py-8 sm:px-8">
    <header className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/dashboard" className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-.04em] text-slate-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200"><Mic className="h-5 w-5" /></span>Career<span className="-ml-2.5 text-indigo-600">Mind</span></Link><Link href="/preview" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" />Back to preview</Link></header>
    <div className="mx-auto mt-10 grid max-w-5xl gap-7 lg:grid-cols-[1fr_380px]">
      <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(30,41,59,.08)] sm:p-10"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-indigo-600">Secure checkout</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.05em] text-slate-950">Review your interview</h1><p className="mt-3 text-base leading-7 text-slate-500">Confirm the session details below. You will complete payment securely with Stripe.</p>
        <div className="mt-8 rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><Mic className="h-6 w-6" /></span><div><h2 className="text-lg font-extrabold capitalize text-slate-900">{interview.role}</h2><p className="mt-1 text-sm capitalize text-slate-500">{String(interview.level).replace('midlevel', 'mid-level')} · {interview.focus}</p></div></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/80 p-4"><Clock3 className="h-5 w-5 text-emerald-500" /><p className="mt-3 text-xs font-bold text-slate-400">Duration</p><p className="mt-1 font-extrabold text-slate-900">{duration} minutes</p></div><div className="rounded-2xl bg-white/80 p-4"><CreditCard className="h-5 w-5 text-violet-500" /><p className="mt-3 text-xs font-bold text-slate-400">Price</p><p className="mt-1 font-extrabold text-slate-900">{price}</p></div></div></div>
        <div className="mt-8 space-y-4">{['Real-time AI voice interview', 'Live coaching during your answers', 'Detailed feedback and score report', 'Quiz and flashcard study tools'].map(item => <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-600"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-4 w-4" /></span>{item}</div>)}</div>
      </section>
      <aside className="h-fit rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(30,41,59,.08)]"><h2 className="text-xl font-extrabold text-slate-950">Order summary</h2><div className="mt-6 space-y-4 border-b border-slate-100 pb-6 text-sm"><div className="flex justify-between text-slate-500"><span>{duration}-minute interview</span><span className="font-bold text-slate-800">{price}</span></div><div className="flex justify-between text-slate-500"><span>VAT</span><span>Included</span></div></div><div className="flex items-end justify-between py-6"><span className="font-extrabold text-slate-900">Total</span><span className="text-3xl font-black tracking-tight text-slate-950">{price}</span></div><div className="mb-4 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"><input type="checkbox" id="consent" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className="mt-0.5 flex-shrink-0 accent-indigo-500" /><label htmlFor="consent" className="cursor-pointer text-xs leading-relaxed text-gray-500">I agree that the interview starts immediately on payment and I waive my right to cancel under the Consumer Contracts Regulations 2013. Payments are non-refundable once the interview has started.</label></div>{error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div>}<button onClick={handleCheckout} disabled={loading || !session?.accessToken || !consentGiven} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-50">{loading ? <><Loader2 className="h-5 w-5 animate-spin" />Opening Stripe...</> : <>Continue to secure payment <ArrowRight className="h-5 w-5" /></>}</button><div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"><LockKeyhole className="h-4 w-4" />Secure payment powered by Stripe</div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-500" />Payment protection</p><p className="mt-2 text-xs leading-5 text-slate-500">CareerMind never stores your card details. Stripe handles the payment securely.</p></div></aside>
    </div>
  </main>
}
