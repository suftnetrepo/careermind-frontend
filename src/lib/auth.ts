import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
            sessionsRemaining:  user.sessions_remaining,
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
        token.accessToken       = (user as any).accessToken
        token.refreshToken      = (user as any).refreshToken
        token.sessionsRemaining = (user as any).sessionsRemaining
        token.userId            = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken       = token.accessToken as string
      session.user.id           = token.userId as string
      session.sessionsRemaining = token.sessionsRemaining as number
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
