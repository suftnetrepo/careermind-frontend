'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import { api } from '@/lib/api'

function VerifyEmail() {
  const token = useSearchParams().get('token')
  const [state, setState] = useState<'verifying' | 'verified' | 'failed'>('verifying')
  const [message, setMessage] = useState('')
  const started = useRef(false)   // strict mode runs effects twice in dev

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!token) { setState('failed'); setMessage('This verification link is incomplete.'); return }
    api.auth.verifyEmail(token)
      .then(() => setState('verified'))
      .catch(err => { setState('failed'); setMessage(err.message || 'This verification link is invalid or has expired') })
  }, [token])

  return (
    <div className="mx-auto max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_40px_rgba(30,41,59,.06)]">
      {state === 'verifying' && (
        <>
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-500" />
          <h1 className="text-xl font-extrabold text-slate-900">Confirming your email...</h1>
        </>
      )}
      {state === 'verified' && (
        <>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h1 className="text-xl font-extrabold text-slate-900">Email confirmed</h1>
          <p className="mt-2 text-sm text-slate-500">Your free 10-minute interview is unlocked.</p>
          <Link href="/setup" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-extrabold text-white hover:bg-indigo-950">
            Start your free interview
          </Link>
        </>
      )}
      {state === 'failed' && (
        <>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="text-xl font-extrabold text-slate-900">We couldn&apos;t confirm your email</h1>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          <p className="mt-2 text-sm text-slate-500">Sign in and use &quot;Resend email&quot; to get a new link.</p>
          <Link href="/dashboard" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-extrabold text-slate-800 hover:bg-slate-50">
            Go to dashboard
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-6 py-16">
        <Suspense fallback={null}>
          <VerifyEmail />
        </Suspense>
      </main>
    </div>
  )
}
