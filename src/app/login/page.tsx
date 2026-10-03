'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/auth/AuthShell'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email, password, redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Incorrect email or password')
    } else {
      router.push('/dashboard')
    }
  }

  return <AuthShell action={<p className="text-sm text-slate-500">New here? <Link href="/register" className="ml-1 font-extrabold text-indigo-600">Create an account</Link></p>}>
    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-indigo-600">Welcome back</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.05em] text-slate-950">Continue your progress</h1><p className="mt-3 text-base leading-7 text-slate-500">Sign in to practise, review feedback and prepare for your next opportunity.</p>
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div><label className="mb-2 block text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></div></div>
      <div><label className="mb-2 block text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">Password</label><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></div></div>
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
      <button type="submit" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-50" disabled={loading}>{loading ? 'Signing in...' : <>Sign in <ArrowRight className="h-5 w-5" /></>}</button>
    </form>
    <p className="mt-7 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/register" className="font-extrabold text-indigo-600">Start free</Link></p>
  </AuthShell>
}
