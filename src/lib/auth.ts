import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Refresh the backend's access token (60 min) well before it expires. The
// browser refetches the session every few minutes (see providers.tsx), so
// client code always holds a token with time left on it.
const REFRESH_MARGIN_MS = 10 * 60 * 1000

function tokenExpiry(jwt: string): number {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp * 1000
  } catch {
    return 0
  }
}

async function refreshAccessToken(token: Record<string, any>) {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh_token: token.refreshToken }),
    })
    if (!res.ok) throw new Error(`refresh failed: ${res.status}`)
    const data = await res.json()
    return {
      ...token,
      accessToken:        data.access_token,
      refreshToken:       data.refresh_token,
      accessTokenExpires: tokenExpiry(data.access_token),
      error:              undefined,
    }
  } catch {
    // The page signs the user out when it sees this (see providers.tsx)
    return { ...token, error: 'RefreshTokenError' }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_URL}/api/v1/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          const { access_token, refresh_token } = data

          // Fetch user profile
          const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          if (!meRes.ok) return null
          const user = await meRes.json()

          return {
            id:                 user.id,
            name:               user.name,
            email:              user.email,
            accessToken:        access_token,
            refreshToken:       refresh_token,
            hasFreeInterview:   user.has_free_interview,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken        = (user as any).accessToken
        token.refreshToken       = (user as any).refreshToken
        token.hasFreeInterview   = (user as any).hasFreeInterview
        token.userId             = (user as any).id
        token.accessTokenExpires = tokenExpiry((user as any).accessToken)
      }
      const expires = (token.accessTokenExpires as number) || tokenExpiry(token.accessToken as string)
      if (Date.now() < expires - REFRESH_MARGIN_MS) return token
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken       = token.accessToken as string
      session.user.id           = token.userId as string
      session.hasFreeInterview  = token.hasFreeInterview as boolean
      session.error             = token.error as string | undefined
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
