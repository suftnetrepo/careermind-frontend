'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { priceDisplay } from '@/lib/pricing'
import type { CheckReady } from '@/types'

const POLL_INTERVAL_MS = 2000
const POLL_ATTEMPTS = 10

function PaymentSuccess() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const id = useSearchParams().get('id')
  const token = session?.accessToken

  const [interview, setInterview] = useState<CheckReady | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  // Stripe redirects here as soon as the card is charged; the webhook (or the
  // API's own Stripe lookup) marks the interview paid a moment later
  useEffect(() => {
    if (!token || !id) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const poll = async (attempt: number) => {
      const data = await api.interviews.checkReady(token, id).catch(() => null)
      if (cancelled) return
      if (data?.completed) { router.replace(`/feedback?id=${id}`); return }
      if (data?.paid) {
        setInterview(data)
        setLoading(false)
        return
      }
      if (attempt >= POLL_ATTEMPTS) {
        setError('Payment confirmed but interview is still being set up. Check your dashboard.')
        setLoading(false)
        return
      }
      timer = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS)
    }
    poll(0)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [token, id, router])

  if (!id) {
    return <Shell><div className="py-6"><p className="mb-4 text-sm text-gray-600">No interview found.</p><DashboardButton /></div></Shell>
  }

  return (
    <Shell>
      {loading ? (
        <div className="py-8">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-500">Confirming your payment...</p>
        </div>
      ) : error ? (
        <div className="py-6">
          <p className="mb-4 text-sm text-gray-600">{error}</p>
          <DashboardButton primary />
        </div>
      ) : (
        <div className="py-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          <h1 className="mb-1 text-lg font-medium text-gray-900">Payment successful</h1>

          <div className="mb-6 mt-4 rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-sm font-medium text-gray-800">{interview?.role}</p>
            <p className="text-xs capitalize text-gray-400">
              {interview?.level?.replace('midlevel', 'mid-level')}
              {' · '}{interview?.duration_minutes} min
              {' · '}{priceDisplay(interview?.duration_minutes, interview?.amount_pence)}
            </p>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            {interview?.ready
              ? 'Your interview is unlocked and ready whenever you are.'
              : 'This interview has already been started.'}
          </p>

          <div className="space-y-3">
            {interview?.ready && (
              <button
                onClick={() => router.push(`/check?id=${id}`)}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3"
              >
                Start interview now
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <DashboardButton />
          </div>

          {interview?.ready && (
            <p className="mt-4 text-xs text-gray-400">You can start this interview anytime from your dashboard.</p>
          )}
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-base font-medium text-gray-900">
            Career<span className="text-indigo-500">Mind</span>
          </p>
        </div>
        <div className="card text-center">{children}</div>
      </div>
    </div>
  )
}

function DashboardButton({ primary = false }: { primary?: boolean }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/dashboard')}
      className={`${primary ? 'btn-primary' : 'btn-secondary'} flex w-full items-center justify-center gap-2 py-3`}
    >
      <LayoutDashboard className="h-4 w-4" />
      Go to dashboard
    </button>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  )
}
