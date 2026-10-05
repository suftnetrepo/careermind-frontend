'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MailCheck, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

// Shown while a user with a free interview hasn't confirmed their email —
// the backend won't start the free interview until they do
export default function VerifyEmailNotice({ email }: { email?: string | null }) {
  const { data: session } = useSession()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function resend() {
    if (!session?.accessToken) return
    setState('sending')
    try {
      const res = await api.auth.resendVerification(session.accessToken)
      if (res.already_verified) { window.location.reload(); return }
      setState('sent')
    } catch (err: any) {
      setMessage(err.message || 'Could not send the email')
      setState('error')
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
          <MailCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-amber-900">Confirm your email to unlock your free interview</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            {state === 'sent'
              ? `New link sent${email ? ` to ${email}` : ''}. It can take a minute to arrive — check spam too.`
              : state === 'error'
                ? message
                : `We sent a confirmation link${email ? ` to ${email}` : ''}. Click it, then come back here.`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={state === 'sending' || state === 'sent'}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-xs font-extrabold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60">
        {state === 'sending' ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : state === 'sent' ? 'Email sent' : 'Resend email'}
      </button>
    </div>
  )
}
