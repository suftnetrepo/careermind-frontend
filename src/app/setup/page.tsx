'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { Brain, Code, Layout, BarChart3, Briefcase, Users, ArrowRight, Loader2 } from 'lucide-react'

const ROLES = [
  { name: 'AI Engineer',          icon: Brain,     cat: 'AI and machine learning' },
  { name: 'Python Developer',     icon: Code,      cat: 'Engineering' },
  { name: 'Full Stack Developer', icon: Layout,    cat: 'Engineering' },
  { name: 'Data Scientist',       icon: BarChart3, cat: 'Data' },
  { name: 'Product Manager',      icon: Briefcase, cat: 'Product' },
  { name: 'Business Analyst',     icon: Users,     cat: 'Business' },
]

const LEVELS  = ['Junior', 'Mid-level', 'Senior']
const FOCUSES = ['Technical', 'Behavioural', 'Mixed']
const DURATIONS = [10, 15, 20]

export default function SetupPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [role,     setRole]     = useState('AI Engineer')
  const [level,    setLevel]    = useState('Mid-level')
  const [focus,    setFocus]    = useState('Mixed')
  const [duration, setDuration] = useState(15)
  const [jd,       setJd]       = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleGenerate() {
    if (!session?.accessToken) { router.push('/login'); return }
    setError(''); setLoading(true)
    try {
      const result: any = await api.interviews.setup(session.accessToken, {
        role,
        level:            level.toLowerCase().replace('-', ''),
        focus:            focus.toLowerCase(),
        duration_minutes: duration,
        job_description:  jd || undefined,
      })
      // Store in sessionStorage for preview page
      sessionStorage.setItem('cm_interview', JSON.stringify(result))
      router.push('/preview')
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        <span className="text-sm text-gray-400">
          {session?.sessionsRemaining ?? '—'} sessions remaining
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">1</div>
            <h2 className="text-base font-medium text-gray-900">Pick a role</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 pl-9">This sets the scoring rubric and question focus.</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button key={r.name} onClick={() => setRole(r.name)}
                className={`text-left p-4 rounded-xl border transition-all ${role === r.name
                  ? 'border-brand-500 border-2 bg-brand-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3
                  ${role === r.name ? 'bg-brand-100' : 'bg-gray-50'}`}>
                  <r.icon className={`w-4 h-4 ${role === r.name ? 'text-brand-500' : 'text-gray-400'}`} />
                </div>
                <div className={`text-xs mb-1 ${role === r.name ? 'text-brand-400' : 'text-gray-400'}`}>
                  {r.cat}
                </div>
                <div className={`text-sm font-medium ${role === r.name ? 'text-brand-600' : 'text-gray-900'}`}>
                  {r.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">2</div>
            <h2 className="text-base font-medium text-gray-900">Level and focus</h2>
          </div>
          <div className="pl-9 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Experience level</p>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-all ${level === l
                      ? 'bg-brand-50 border-brand-400 text-brand-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Question focus</p>
              <div className="flex gap-2">
                {FOCUSES.map((f) => (
                  <button key={f} onClick={() => setFocus(f)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-all ${focus === f
                      ? 'bg-brand-50 border-brand-400 text-brand-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Duration</p>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-all ${duration === d
                      ? 'bg-brand-50 border-brand-400 text-brand-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">3</div>
            <h2 className="text-base font-medium text-gray-900">Or paste a job description</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3 pl-9">CareerMind will tailor every question to the exact role.</p>
          <textarea
            className="input resize-none h-24 pl-9"
            placeholder="Paste the job posting here — CareerMind will extract the requirements and build questions from it..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button onClick={handleGenerate} disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Generating interview...</>
          ) : (
            <>Generate interview <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </main>
    </div>
  )
}
