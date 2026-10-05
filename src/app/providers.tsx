'use client'
import { useEffect } from 'react'
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import { api } from '@/lib/api'

// Refetching the session runs the NextAuth jwt callback, which renews the
// backend access token before it expires (see lib/auth.ts)
const SESSION_REFETCH_SECONDS = 4 * 60

// If the backend login can't be renewed, or the backend rejects the token
// (account suspended, secret changed), sign out instead of leaving a page that
// looks signed in while every API call fails. Server-rendered pages swallow
// their API errors, so check the token here too — a 401 from api.* signs out.
function SessionErrorGuard() {
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.error === 'RefreshTokenError') signOut({ callbackUrl: '/login' })
  }, [session?.error])
  useEffect(() => {
    if (session?.accessToken && !session.error) api.auth.me(session.accessToken).catch(() => {})
  }, [session?.accessToken, session?.error])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_SECONDS}>
      <SessionErrorGuard />
      {children}
    </SessionProvider>
  )
}
