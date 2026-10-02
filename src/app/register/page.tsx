'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.auth.register({ name, email, password })
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Account created but login failed. Please log in.')
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header rightContent={
        <Link href="/login"
              className="text-sm text-indigo-500">
          Log in
        </Link>
      } />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-medium text-gray-900">
            Career<span className="text-brand-500">Mind</span>
          </Link>
          <p className="text-sm text-gray-400 mt-1">Practice interviews. Land the job.</p>
        </div>

        <div className="card">
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full mb-4">
            1 free interview on signup
          </div>
          <h1 className="text-lg font-medium text-gray-900 mb-6">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" type="text" placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="At least 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account — it\'s free'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-500 hover:underline">Log in</Link>
          </p>
          <p className="text-center text-xs text-gray-300 mt-3">
            By signing up you agree to our{' '}
            <Link href="/terms" className="text-brand-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
      </div>
  )
}
