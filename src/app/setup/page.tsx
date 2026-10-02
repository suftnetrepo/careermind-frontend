'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import Header from '@/components/layout/Header'
import { ArrowRight, Loader2 } from 'lucide-react'

const ROLES = [
  { group: 'Engineering',
    roles: [
      'Software Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'Site Reliability Engineer',
      'Security Engineer',
      'QA Engineer',
      'Embedded Systems Engineer',
    ]
  },
  { group: 'Data and AI',
    roles: [
      'AI Engineer',
      'Data Scientist',
      'Data Analyst',
      'Data Engineer',
      'ML Engineer',
      'BI Analyst',
    ]
  },
  { group: 'Product and Design',
    roles: [
      'Product Manager',
      'Technical Product Manager',
      'Product Designer',
      'UX Researcher',
      'UI Designer',
    ]
  },
  { group: 'Business',
    roles: [
      'Business Analyst',
      'Solutions Architect',
      'Project Manager',
      'Programme Manager',
      'Scrum Master',
      'Delivery Manager',
    ]
  },
  { group: 'Leadership',
    roles: [
      'Engineering Manager',
      'Head of Engineering',
      'VP Engineering',
      'CTO',
      'Head of Product',
      'Head of Data',
    ]
  },
  { group: 'Finance and Ops',
    roles: [
      'Financial Analyst',
      'Operations Manager',
      'Strategy Consultant',
      'Management Consultant',
    ]
  },
  { group: 'Sales and Marketing',
    roles: [
      'Sales Engineer',
      'Account Executive',
      'Growth Manager',
      'Marketing Manager',
    ]
  },
]

const PRESETS = [
  'Make it challenging',
  'Focus on my weak areas',
  'Be encouraging — I get nervous',
  'Senior level questions only',
  'Focus on system design',
  'Focus on behavioural questions',
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

  const [role,       setRole]       = useState('')
  const [customRole, setCustomRole] = useState('')
  const isCustomRole  = role === 'other'
  const effectiveRole = (isCustomRole ? customRole : role).trim()
  const [level,    setLevel]    = useState('Mid-level')
  const [focus,    setFocus]    = useState('Mixed')
  const [duration, setDuration] = useState(30)
  const [jd,       setJd]       = useState('')
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [customPrompt,    setCustomPrompt]    = useState('')
  const [cvFile,      setCvFile]      = useState<File | null>(null)
  const [cvText,      setCvText]      = useState('')
  const [cvUploading, setCvUploading] = useState(false)
  const [cvError,     setCvError]     = useState('')
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

  const togglePreset = (p: string) => {
    setSelectedPresets(prev =>
      prev.includes(p)
        ? prev.filter(x => x !== p)
        : [...prev, p]
    )
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''   // let the same file be picked again after an error
    if (!file) return
    if (!session?.accessToken) { router.push('/login'); return }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setCvError('Please upload a PDF file')
      return
    }
    setCvFile(file)
    setCvUploading(true)
    setCvError('')
    try {
      const data = await api.interviews.uploadCv(session.accessToken, file)
      setCvText(data.cv_text)
    } catch (err: any) {
      setCvError(err.message || 'Upload failed')
      setCvFile(null)
      setCvText('')
    } finally {
      setCvUploading(false)
    }
  }

  async function handleGenerate() {
    if (!session?.accessToken) { router.push('/login'); return }
    if (!effectiveRole) return
    setError(''); setLoading(true)
    try {
      const result: any = await api.interviews.setup(session.accessToken, {
        role:             effectiveRole,
        level:            level.toLowerCase().replace('-', ''),
        focus:            focus.toLowerCase(),
        duration_minutes: duration,
        voice:            voice,
        job_description:  jd || undefined,
        cv_text:          cvText || undefined,
        custom_prompt:    customPrompt || undefined,
        preset_prompts:   selectedPresets.length > 0
                            ? selectedPresets
                            : undefined,
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
      <Header rightContent={
        <span className="text-sm text-gray-400">
          {isFree
            ? '1 free interview remaining'
            : 'Pay per session'}
        </span>
      } />

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">1</div>
            <h2 className="text-base font-medium text-gray-900">Pick a role</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 pl-9">This sets the scoring rubric and question focus.</p>
          <div className="mb-6">
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                         bg-white text-gray-900 focus:outline-none
                         focus:ring-2 focus:ring-indigo-500 mb-3">
              <option value="">Select a role...</option>
              {ROLES.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
              ))}
              <option value="other">Other — type your role</option>
            </select>

            {isCustomRole && (
              <input
                type="text"
                placeholder="Type your role..."
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                maxLength={100}
                className="input w-full"
              />
            )}
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
            <h2 className="text-base font-medium text-gray-900">Interview preferences</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 pl-9">Optional — help Alex tailor the interview to you.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => togglePreset(p)}
                className={`pill text-xs ${selectedPresets.includes(p) ? 'selected' : ''}`}>
                {p}
              </button>
            ))}
          </div>
          <textarea
            className="input resize-none h-16 text-sm w-full"
            placeholder="Anything else you want Alex to know? e.g. 'I have 5 years Python experience' or 'Ask me about my last project'"
            value={customPrompt}
            maxLength={1000}
            onChange={e => setCustomPrompt(e.target.value)}
          />
        </div>

        {/* Step 6 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">6</div>
            <h2 className="text-base font-medium text-gray-900">Upload your CV or paste a job description</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4 pl-9">
            Both optional — the more context you give, the more personalised your interview will be.
          </p>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Your CV (PDF)
            </p>
            <label className={`flex items-center justify-center gap-3 border-2 border-dashed
                               rounded-xl p-5 cursor-pointer transition-colors
              ${cvFile
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleCvUpload}
              />
              {cvUploading ? (
                <span className="text-sm text-gray-400">Reading CV...</span>
              ) : cvFile ? (
                <span className="text-sm text-indigo-600">✓ {cvFile.name}</span>
              ) : (
                <span className="text-sm text-gray-400">Click to upload PDF · max 5MB</span>
              )}
            </label>
            {cvError && (
              <p className="text-xs text-red-500 mt-1">{cvError}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Job description
            </p>
            <textarea
              className="input resize-none h-20 text-sm w-full"
              placeholder="Paste the job posting here..."
              value={jd}
              onChange={e => setJd(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button onClick={handleGenerate} disabled={!effectiveRole || loading || cvUploading}
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
