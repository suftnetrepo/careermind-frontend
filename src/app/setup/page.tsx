'use client'
import { useEffect, useState } from 'react'
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

// Must match REALTIME_VOICES in the backend
const VOICES = [
  { id: 'alloy', name: 'Alloy', desc: 'Neutral and balanced' },
  { id: 'ash',   name: 'Ash',   desc: 'Calm and measured' },
  { id: 'coral', name: 'Coral', desc: 'Warm and friendly' },
  { id: 'echo',  name: 'Echo',  desc: 'Clear and steady' },
  { id: 'marin', name: 'Marin', desc: 'Natural and conversational' },
  { id: 'cedar', name: 'Cedar', desc: 'Relaxed and confident' },
]

const DURATIONS = [
  { min: 15, price: '£3.00',  label: 'Quick practice' },
  { min: 30, price: '£6.00',  label: 'Standard session' },
  { min: 45, price: '£9.00',  label: 'Deep dive' },
  { min: 60, price: '£12.00', label: 'Full interview' },
]

const LEVELS  = ['Junior', 'Mid-level', 'Senior']
const FOCUSES = ['Technical', 'Behavioural', 'Mixed']

export default function SetupPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [role,     setRole]     = useState('AI Engineer')
  const [level,    setLevel]    = useState('Mid-level')
  const [focus,    setFocus]    = useState('Mixed')
  const [duration, setDuration] = useState(30)
  const [jd,       setJd]       = useState('')
  const [voice,    setVoice]    = useState('alloy')
  const [freshFree, setFreshFree] = useState<boolean | null>(null)
  const isFree = (freshFree ?? session?.hasFreeInterview) === true

  // The login session goes stale once the free interview is used — ask the API
  useEffect(() => {
    if (!session?.accessToken) return
    api.auth.me(session.accessToken)
      .then(me => setFreshFree(me.has_free_interview))
      .catch(() => {})
  }, [session?.accessToken])
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
        voice,
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
          {isFree ? '1 free interview available' : '£0.20 per minute'}
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
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">3</div>
            <h2 className="text-base font-medium text-gray-900">Duration</h2>
          </div>
          {isFree ? (
            <div className="pl-9">
              <div className="inline-flex items-center gap-1.5 bg-green-50
                              text-green-700 text-xs px-3 py-1 rounded-full">
                Using your free interview (15 minutes)
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4 pl-9">£0.20 per minute · Charged once before your interview starts.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DURATIONS.map((d) => (
                  <button
                    key={d.min}
                    onClick={() => setDuration(d.min)}
                    className={`p-4 rounded-xl border-2 text-left transition-all
                      ${duration === d.min
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div className={`text-sm font-medium mb-1
                      ${duration === d.min ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {d.min} minutes
                    </div>
                    <div className={`text-xl font-medium mb-1
                      ${duration === d.min ? 'text-indigo-600' : 'text-gray-900'}`}>
                      {d.price}
                    </div>
                    <div className="text-xs text-gray-400">
                      {d.label}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Step 4 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">4</div>
            <h2 className="text-base font-medium text-gray-900">Choose your interviewer's voice</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 pl-9">Alex will speak to you in this voice.</p>
          <div className="grid grid-cols-3 gap-3">
            {VOICES.map((v) => (
              <button key={v.id} onClick={() => setVoice(v.id)}
                className={`text-left p-4 rounded-xl border transition-all ${voice === v.id
                  ? 'border-brand-500 border-2 bg-brand-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                <div className={`text-sm font-medium mb-1 ${voice === v.id ? 'text-brand-600' : 'text-gray-900'}`}>
                  {v.name}
                </div>
                <div className={`text-xs ${voice === v.id ? 'text-brand-400' : 'text-gray-400'}`}>
                  {v.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 5 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">5</div>
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
            isFree
              ? <>Generate free interview <ArrowRight className="w-4 h-4" /></>
              : <>Generate interview — {DURATIONS.find(d => d.min === duration)?.price} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </main>
    </div>
  )
}
