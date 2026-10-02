'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { Mic, MicOff, Clock, AlertCircle, Loader2 } from 'lucide-react'

const PAYMENT_POLL_ATTEMPTS = 10
const PAYMENT_POLL_INTERVAL_MS = 2000

export default function InterviewPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const interviewId = params.get('id')
  const paymentSuccess = params.get('payment') === 'success'

  const [interview,  setInterview]  = useState<any>(null)
  const [micActive,  setMicActive]  = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(true)
  const [timeLeft,   setTimeLeft]   = useState(0)
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([])
  const [qIndex,     setQIndex]     = useState(0)
  const [ending,     setEnding]     = useState(false)
  const [payError,   setPayError]   = useState('')
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const begunRef = useRef(false)

  useEffect(() => {
    if (!interviewId) { router.push('/setup'); return }
    const stored = sessionStorage.getItem('cm_interview')

    // Stripe just redirected back — confirm payment with the API before proceeding
    if (paymentSuccess) {
      if (authStatus === 'loading') return
      if (!session?.accessToken) { router.push('/login'); return }
      let cancelled = false
      confirmPaymentAndStart(session.accessToken, stored ? JSON.parse(stored) : {})
        .then(data => { if (!cancelled && data) begin(data) })
        .catch(err => { if (!cancelled) setPayError(err.message || 'Could not confirm payment') })
      return () => { cancelled = true }
    }

    if (!stored) { router.push('/setup'); return }
    const interview = JSON.parse(stored)

    // If interview is not paid, redirect back to preview
    if (!interview.paid && !interview.is_free) {
      router.push(`/preview?id=${interview.interview_id}`)
      return
    }

    begin(interview)
  }, [authStatus])

  useEffect(() => () => clearInterval(timerRef.current), [])

  async function confirmPaymentAndStart(token: string, stored: any) {
    for (let i = 0; i < PAYMENT_POLL_ATTEMPTS; i++) {
      const fresh = await api.interviews.get(token, interviewId!)
      if (fresh.paid) {
        if (fresh.status === 'setup') await api.interviews.start(token, interviewId!)
        const data = { ...stored, ...fresh, interview_id: fresh.id }
        sessionStorage.setItem('cm_interview', JSON.stringify(data))
        return data
      }
      await new Promise(r => setTimeout(r, PAYMENT_POLL_INTERVAL_MS))
    }
    throw new Error('We could not confirm your payment yet. Please refresh in a moment.')
  }

  function begin(data: any) {
    if (begunRef.current) return
    begunRef.current = true
    setInterview(data)
    setTimeLeft(data.duration_minutes * 60)
    startTimer(data.duration_minutes * 60)
    // First question from AI
    if (data.questions?.[0]) {
      setTimeout(() => {
        setTranscript([{ role: 'ai', text: data.questions[0].question }])
        setAiSpeaking(false)
      }, 1500)
    }
  }

  function startTimer(secs: number) {
    let s = secs
    timerRef.current = setInterval(() => {
      s--
      setTimeLeft(s)
      if (s <= 0) { clearInterval(timerRef.current); handleEnd() }
    }, 1000)
  }

  function fmtTime(s: number) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  async function handleEnd() {
    if (ending || !session?.accessToken || !interviewId) return
    setEnding(true)
    clearInterval(timerRef.current)
    const elapsed = (interview?.duration_minutes ?? 15) * 60 - timeLeft
    await api.interviews.end(session.accessToken, {
      interview_id:     interviewId,
      transcript_json:  JSON.stringify(transcript),
      duration_seconds: elapsed,
    })
    router.push(`/feedback?id=${interviewId}`)
  }

  if (!interview) {
    if (!paymentSuccess) return null
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        {payError ? (
          <>
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-sm text-gray-600">{payError}</p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            <p className="text-sm text-gray-500">Confirming your payment...</p>
          </>
        )}
      </div>
    )
  }

  const currentQ = interview.questions?.[qIndex]
  const isWarning = timeLeft <= 120

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          {interview.role} · {interview.level}
        </span>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${isWarning ? 'text-red-500' : 'text-gray-500'}`}>
          <Clock className="w-4 h-4" />
          {fmtTime(timeLeft)}
          {isWarning && <span className="text-xs">(wrapping up)</span>}
        </div>
      </header>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-gray-100">
        {/* Left — interview */}
        <div className="p-6 flex flex-col">
          {/* AI orb */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-2 transition-all
              ${aiSpeaking ? 'border-brand-500 bg-brand-50' : micActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <Mic className={`w-6 h-6 ${aiSpeaking ? 'text-brand-500' : micActive ? 'text-green-500' : 'text-gray-300'}`} />
            </div>
            <p className="text-xs text-gray-400">
              {aiSpeaking ? 'AI interviewer is speaking...' : micActive ? 'Listening...' : 'Tap mic to answer'}
            </p>
          </div>

          {/* Current question */}
          {currentQ && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl rounded-tl-sm px-4 py-3 mb-4 text-sm text-gray-700 leading-relaxed">
              {currentQ.question}
            </div>
          )}

          {/* Answer area */}
          <div className="mb-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Your answer</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-tr-sm px-4 py-3 min-h-16 text-sm text-gray-600 leading-relaxed">
              {transcript.filter(t => t.role === 'user').slice(-1)[0]?.text || (
                <span className="text-gray-300 italic">Tap the mic and start speaking...</span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="flex justify-between text-xs text-gray-400 mb-1.5 mt-4">
            <span>Question {qIndex + 1} of {interview.questions?.length ?? 8}</span>
            <span>{currentQ?.type}</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full mb-5">
            <div className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${((qIndex + 1) / (interview.questions?.length ?? 8)) * 100}%` }} />
          </div>

          {/* Mic button */}
          <div className="flex justify-center mb-4">
            <button onClick={() => setMicActive(!micActive)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all
                ${micActive ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              {micActive
                ? <Mic className="w-5 h-5 text-green-500" />
                : <MicOff className="w-5 h-5 text-gray-400" />}
            </button>
          </div>

          <button onClick={handleEnd} disabled={ending}
            className="w-full py-2 border border-red-200 text-red-400 text-sm rounded-lg hover:bg-red-50 transition-colors">
            End session
          </button>
        </div>

        {/* Right — live coaching */}
        <div className="p-6 bg-gray-50">
          <p className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-500 text-xs flex items-center justify-center">AI</span>
            Live coaching
          </p>

          {/* Placeholder coaching cards — Sprint 3 will wire these from the Realtime API */}
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Positive
              </div>
              <p className="text-xs text-gray-500 italic mb-2">"Can you tell me more about how you handled that?"</p>
              <p className="text-xs text-gray-600 bg-green-50 rounded-lg p-2 leading-relaxed">
                Great follow-up — it shows you can explore topics in depth.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Tip
              </div>
              <p className="text-xs text-gray-500 italic mb-2">"What specific results did that produce?"</p>
              <p className="text-xs text-gray-600 bg-amber-50 rounded-lg p-2 leading-relaxed">
                Strong question. Try asking about trade-offs too — interviewers value that thinking.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium mb-2">
                <AlertCircle className="w-3 h-3" />
                Pitfall
              </div>
              <p className="text-xs text-gray-500 italic mb-2">"Didn't your manager make a mistake there?"</p>
              <p className="text-xs text-gray-600 bg-red-50 rounded-lg p-2 leading-relaxed">
                Could read as biased. Try: "How did you handle differences of opinion?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
