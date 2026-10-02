'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Check, Lock, RefreshCw, Shield, Loader2 } from 'lucide-react'

const PACKS = [
  { id: '1',  sessions: 1,  price: '£2.99',  per: '15 minutes',        save: '',        popular: false },
  { id: '5',  sessions: 5,  price: '£11.99', per: '£2.40 per session',  save: 'Save 20%', popular: true  },
  { id: '10', sessions: 10, price: '£19.99', per: '£2.00 per session',  save: 'Save 33%', popular: false },
]

const INCLUDES = [
  '15 minutes of live voice AI',
  'Real-time coaching panel',
  'Tailored questions per role',
  'Detailed feedback report',
  'Job description support',
  'Sessions never expire',
]

export default function BuySessionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selected, setSelected] = useState('5')
  const [loading,  setLoading]  = useState(false)

  async function handleBuy() {
    if (!session?.accessToken) { router.push('/login'); return }
    setLoading(true)
    try {
      const result = await api.sessions.checkout(session.accessToken, selected as '1' | '5' | '10')
      window.location.href = result.checkout_url
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        {session && (
          <span className="text-sm text-gray-400">
            {session.sessionsRemaining} sessions remaining
          </span>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <p className="text-xs text-brand-500 uppercase tracking-widest mb-2">Buy sessions</p>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Pay only for what you use</h1>
          <p className="text-sm text-gray-400">Sessions never expire. Buy once, use whenever you need to practise.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {PACKS.map((p) => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`relative bg-white rounded-xl p-5 text-center border-2 transition-all
                ${selected === p.id ? 'border-brand-500' : 'border-gray-100 hover:border-gray-200'}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs px-3 py-0.5 rounded-full">
                  Most popular
                </div>
              )}
              <div className="text-sm text-gray-400 mb-1">{p.sessions} {p.sessions === 1 ? 'session' : 'sessions'}</div>
              <div className="text-3xl font-medium text-gray-900 mb-1">{p.price}</div>
              <div className="text-xs text-gray-400 mb-1">{p.per}</div>
              <div className="text-xs text-green-600 font-medium h-4">{p.save}</div>
            </button>
          ))}
        </div>

        <div className="card mb-6">
          <p className="text-sm font-medium text-gray-900 mb-4">What's included in every session</p>
          <div className="grid grid-cols-2 gap-2">
            {INCLUDES.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleBuy} disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base mb-4">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Redirecting to payment...</>
          ) : (
            <><Lock className="w-4 h-4" />Buy {PACKS.find(p => p.id === selected)?.sessions} session{selected !== '1' ? 's' : ''} — {PACKS.find(p => p.id === selected)?.price}</>
          )}
        </button>

        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-green-500" />Stripe secured</div>
          <div className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 text-green-500" />Sessions never expire</div>
          <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-green-500" />Refund if unused</div>
        </div>
      </main>
    </div>
  )
}
