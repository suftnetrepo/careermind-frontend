'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mic, Clock, PhoneOff, WifiOff, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { CoachingNote } from '@/types'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
type TurnStatus = 'alex_speaking' | 'user_speaking' | 'processing' | 'idle'

interface TranscriptLine {
  role:      'alex' | 'user'
  text:      string
  timestamp: number
  itemId?:   string   // candidate speech turn; text is '' until Whisper finishes
}

// One answer often arrives as several VAD turns — show and save it as one line.
// A user line with no text yet is still being transcribed.
function mergeLines(lines: TranscriptLine[], keepPending: boolean): TranscriptLine[] {
  const out: TranscriptLine[] = []
  for (const line of lines) {
    if (line.role === 'user' && !line.text && !keepPending) continue
    const last = out[out.length - 1]
    if (line.role === 'user' && last?.role === 'user') {
      out[out.length - 1] = { ...last, text: [last.text, line.text].filter(Boolean).join(' ') }
    } else {
      out.push({ ...line })
    }
  }
  return out
}

const REALTIME_CALLS_URL       = 'https://api.openai.com/v1/realtime/calls'
const PAYMENT_POLL_ATTEMPTS    = 10
const PAYMENT_POLL_INTERVAL_MS = 2000
const WRAP_UP_SECONDS          = 120
const MIN_COACHING_WORDS       = 5

const TAG_STYLES = {
  positive: {
    dot:       'bg-green-500',
    labelText: 'text-green-600',
    pill:      'bg-green-50 text-green-700',
    label:     'Positive',
  },
  tip: {
    dot:       'bg-amber-400',
    labelText: 'text-amber-600',
    pill:      'bg-amber-50 text-amber-700',
    label:     'Tip',
  },
  pitfall: {
    dot:       'bg-red-400',
    labelText: 'text-red-500',
    pill:      'bg-red-50 text-red-600',
    label:     'Pitfall',
  },
}

// Render ```fenced``` code inside a transcript line as a code block
function renderMessage(text: string) {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const parts: React.ReactNode[] = []
  let last = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={last}>{text.slice(last, match.index)}</span>)
    }
    parts.push(
      <pre key={match.index}
           className="bg-gray-900 text-green-400 rounded-lg p-3 mt-2 mb-2
                      text-xs font-mono overflow-x-auto whitespace-pre-wrap">
        <code>{match[2].trim()}</code>
      </pre>
    )
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push(<span key={last}>{text.slice(last)}</span>)
  }
  return parts.length > 0 ? parts : text
}

export default function InterviewPage() {
  const { data: session, status: authStatus } = useSession()
  const router             = useRouter()
  const params             = useSearchParams()
  const interviewId        = params.get('id')
  const paymentSuccess     = params.get('payment') === 'success'

  // Interview data
  const [interview, setInterview]   = useState<any>(null)
  const [payError,  setPayError]    = useState('')

  // Connection
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting')
  const [connError,  setConnError]  = useState('')
  const [turnStatus, setTurnStatus] = useState<TurnStatus>('idle')

  // Timer
  const [timeLeft,  setTimeLeft]    = useState(0)
  const timerRef                    = useRef<NodeJS.Timeout | null>(null)
  const timeLeftRef                 = useRef(0)
  const warnedRef                   = useRef(false)

  // Transcript
  const [transcript, setTranscript]   = useState<TranscriptLine[]>([])
  const [alexText,   setAlexText]     = useState('')
  const transcriptRef                 = useRef<HTMLDivElement>(null)
  const linesRef                      = useRef<TranscriptLine[]>([])
  const alexTextRef                   = useRef('')

  // Coaching
  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>([])
  const lastQuestionRef                   = useRef('')
  const lastTagRef                        = useRef<string>('')
  const greetingRef                       = useRef('')
  // One candidate answer, which server VAD may split into several speech turns
  // (item ids). It is coached once Alex has replied AND every turn is transcribed —
  // Whisper can finish after Alex starts talking, especially for long answers.
  const pendingAnswerRef                  = useRef<{
    question:    string
    itemIds:     string[]
    texts:       Record<string, string>
    alexReplied: boolean
  } | null>(null)

  // WebRTC
  const pcRef           = useRef<RTCPeerConnection | null>(null)
  const dcRef           = useRef<RTCDataChannel | null>(null)
  const audioElRef      = useRef<HTMLAudioElement | null>(null)
  const streamRef       = useRef<MediaStream | null>(null)
  const endingRef       = useRef(false)

  // Event handlers and timers outlive the render that created them, so they
  // read the latest values through refs
  const interviewRef = useRef<any>(null)
  const tokenRef     = useRef<string | undefined>(undefined)
  interviewRef.current = interview
  tokenRef.current     = session?.accessToken

  // ── Load interview data ──────────────────────────────────
  useEffect(() => {
    if (!interviewId) { router.push('/setup'); return }
    const stored = sessionStorage.getItem('cm_interview')

    // Stripe just redirected back — confirm payment with the API before proceeding
    if (paymentSuccess) {
      if (authStatus === 'loading') return
      if (!session?.accessToken) { router.push('/login'); return }
      let cancelled = false
      confirmPaymentAndStart(session.accessToken, stored ? JSON.parse(stored) : {})
        .then(data => { if (!cancelled) loadInterview(data) })
        .catch(err => { if (!cancelled) setPayError(err.message || 'Could not confirm payment') })
      return () => { cancelled = true }
    }

    if (!stored) { router.push('/setup'); return }
    const data = JSON.parse(stored)

    // If interview is not paid, redirect back to preview
    if (!data.paid && !data.is_free) {
      router.push(`/preview?id=${data.interview_id}`)
      return
    }

    loadInterview(data)
  }, [authStatus])

  function loadInterview(data: any) {
    setInterview(data)
    setTimeLeft((data.duration_minutes ?? 15) * 60)
    timeLeftRef.current = (data.duration_minutes ?? 15) * 60
  }

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

  // ── Start connection once interview is loaded ────────────
  useEffect(() => {
    if (!interview || !session?.accessToken) return
    // Strict mode mounts effects twice in dev — the flag stops the first,
    // abandoned run from opening a second call with Alex
    const run = { cancelled: false }
    initRealtime(session.accessToken, run)
    return () => { run.cancelled = true; cleanup() }
  }, [interview, session?.accessToken])

  // ── Auto-scroll transcript ───────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript, alexText])

  // ── Timer ────────────────────────────────────────────────
  function startTimer(secs: number) {
    if (timerRef.current) return
    let s = secs
    timerRef.current = setInterval(() => {
      s--
      timeLeftRef.current = s
      setTimeLeft(s)
      if (s === WRAP_UP_SECONDS && !warnedRef.current) {
        warnedRef.current = true
        sendTextEvent('You have 2 minutes remaining. Please wrap up naturally.')
      }
      if (s <= 0) handleEnd()
    }, 1000)
  }

  function fmtTime(s: number) {
    const m   = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  function addLine(line: TranscriptLine) {
    linesRef.current = [...linesRef.current, line]
    setTranscript(linesRef.current)
  }

  // Whisper often finishes after Alex has started replying, so the candidate's
  // line is placed when they start speaking and its text filled in later
  function setUserText(itemId: string, text: string) {
    const lines = linesRef.current
    const exists = lines.some(l => l.itemId === itemId)
    linesRef.current = !exists
      ? (text ? [...lines, { role: 'user', text, timestamp: Date.now(), itemId }] : lines)
      : text
        ? lines.map(l => l.itemId === itemId ? { ...l, text } : l)
        : lines.filter(l => l.itemId !== itemId)
    setTranscript(linesRef.current)
  }

  // ── WebRTC + Realtime API ────────────────────────────────
  async function initRealtime(token: string, run: { cancelled: boolean }) {
    if (!interviewId) return
    let pc: RTCPeerConnection | null = null
    let stream: MediaStream | null = null
    const abandon = () => {
      stream?.getTracks().forEach(t => t.stop())
      pc?.close()
    }

    try {
      setConnStatus('connecting')
      setConnError('')

      // 1. Get ephemeral token from our backend
      const tokenData = await api.interviews.realtimeToken(token, interviewId)
      if (run.cancelled) return

      // 2. Microphone input
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        throw new Error('Microphone access is needed for the interview. Allow it in your browser and refresh.')
      }
      if (run.cancelled) return abandon()

      // 3. Peer connection
      pc = new RTCPeerConnection()
      stream.getTracks().forEach(t => pc!.addTrack(t, stream!))

      // 4. Audio output — play Alex's voice
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      pc.ontrack = e => { audioEl.srcObject = e.streams[0] }

      // 5. Data channel for events
      const dc = pc.createDataChannel('oai-events')
      dc.onopen    = () => {
        setConnStatus('connected')
        startTimer(timeLeftRef.current)
        // Server VAD only replies after the candidate speaks — ask Alex to open
        dc.send(JSON.stringify({ type: 'response.create' }))
      }
      dc.onmessage = e => handleRealtimeEvent(JSON.parse(e.data))
      dc.onerror   = () => setConnStatus('error')
      dc.onclose   = () => {
        if (!endingRef.current) setConnStatus('disconnected')
      }

      // 6. SDP offer/answer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      if (run.cancelled) return abandon()

      const sdpRes = await fetch(REALTIME_CALLS_URL, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.client_secret}`,
          'Content-Type':  'application/sdp',
        },
        body: offer.sdp,
      })
      if (!sdpRes.ok) throw new Error(`Could not connect to Alex (${sdpRes.status})`)
      const answerSdp = await sdpRes.text()
      if (run.cancelled) return abandon()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      pcRef.current      = pc
      dcRef.current      = dc
      streamRef.current  = stream
      audioElRef.current = audioEl
    } catch (err: any) {
      abandon()
      if (run.cancelled) return
      console.error('Realtime init failed:', err)
      setConnError(err?.message || 'Could not connect to Alex')
      setConnStatus('error')
    }
  }

  // ── Handle Realtime API events ───────────────────────────
  function handleRealtimeEvent(event: any) {
    const type = event.type

    // Alex's audio — the transcript arrives well before playback ends, so the
    // speaking state follows the audio buffer, not the transcript
    if (type === 'output_audio_buffer.started') {
      setTurnStatus('alex_speaking')
      if (pendingAnswerRef.current) {
        pendingAnswerRef.current.alexReplied = true
        flushAnswerIfReady()
      }
    }
    if (type === 'output_audio_buffer.stopped' || type === 'output_audio_buffer.cleared') {
      setTurnStatus(prev => prev === 'alex_speaking' ? 'idle' : prev)
    }

    // Alex's words, streaming
    if (type === 'response.output_audio_transcript.delta') {
      alexTextRef.current += event.delta || ''
      setAlexText(alexTextRef.current)
    }

    // Alex's turn fully transcribed — commit to transcript
    if (type === 'response.output_audio_transcript.done') {
      const text = event.transcript || alexTextRef.current
      if (text.trim()) {
        addLine({ role: 'alex', text, timestamp: Date.now() })
        if (!greetingRef.current) greetingRef.current = text
        lastQuestionRef.current = text
      }
      alexTextRef.current = ''
      setAlexText('')
    }

    // User is speaking (VAD detected)
    if (type === 'input_audio_buffer.speech_started') {
      setTurnStatus('user_speaking')
      pendingAnswer().itemIds.push(event.item_id)
      addLine({ role: 'user', text: '', timestamp: Date.now(), itemId: event.item_id })
    }

    // User stopped speaking
    if (type === 'input_audio_buffer.speech_stopped' ||
        type === 'input_audio_buffer.committed') {
      setTurnStatus('processing')
    }

    // User transcript (whisper)
    if (type === 'conversation.item.input_audio_transcription.completed') {
      const text = event.transcript || ''
      setUserText(event.item_id, text.trim())
      recordTranscript(event.item_id, text.trim())
      setTurnStatus(prev => prev === 'processing' ? 'idle' : prev)
    }

    // A turn that can't be transcribed shouldn't hold up coaching forever
    if (type === 'conversation.item.input_audio_transcription.failed') {
      setUserText(event.item_id, '')
      recordTranscript(event.item_id, '')
    }

    if (type === 'error') {
      console.error('Realtime error event:', event.error)
    }
  }

  // ── Send a system note to Alex mid-interview ─────────────
  function sendTextEvent(text: string) {
    if (dcRef.current?.readyState === 'open') {
      dcRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type:    'message',
          role:    'system',
          content: [{ type: 'input_text', text }],
        },
      }))
      dcRef.current.send(JSON.stringify({ type: 'response.create' }))
    }
  }

  // ── Coaching panel ───────────────────────────────────────
  // Coach the whole answer once Alex replies to it — not each VAD fragment,
  // and not the candidate's reply to the greeting
  function pendingAnswer() {
    if (!pendingAnswerRef.current) {
      pendingAnswerRef.current = {
        question: lastQuestionRef.current, itemIds: [], texts: {}, alexReplied: false,
      }
    }
    return pendingAnswerRef.current
  }

  function recordTranscript(itemId: string, text: string) {
    const pending = pendingAnswer()
    if (!pending.itemIds.includes(itemId)) pending.itemIds.push(itemId)
    pending.texts[itemId] = text
    flushAnswerIfReady()
  }

  function flushAnswerIfReady() {
    const pending = pendingAnswerRef.current
    if (!pending?.alexReplied) return
    if (!pending.itemIds.every(id => id in pending.texts)) return
    pendingAnswerRef.current = null
    if (!pending.question || pending.question === greetingRef.current) return
    const answer = pending.itemIds.map(id => pending.texts[id]).filter(Boolean).join(' ')
    if (answer.split(/\s+/).filter(Boolean).length < MIN_COACHING_WORDS) return
    fetchCoaching(pending.question, answer, interviewRef.current?.role)
  }

  async function fetchCoaching(question: string, answer: string, role: string) {
    const token = tokenRef.current
    if (!token || !interviewId) return
    try {
      const note = await api.interviews.coaching(
        token, interviewId, question, answer, role,
        lastTagRef.current || undefined,
      )
      lastTagRef.current = note.tag
      setCoachingNotes(prev => [
        {
          id:       Date.now().toString(),
          question: question.length > 80 ? question.slice(0, 80) + '...' : question,
          ...note,
        },
        ...prev.slice(0, 4),   // keep last 5 notes
      ])
    } catch {
      // Coaching is non-critical — fail silently
    }
  }

  // ── End session ──────────────────────────────────────────
  async function handleEnd() {
    if (endingRef.current) return
    endingRef.current = true
    cleanup()
    const token = tokenRef.current
    if (!token || !interviewId) return
    const total   = (interviewRef.current?.duration_minutes ?? 15) * 60
    const elapsed = total - timeLeftRef.current
    try {
      await api.interviews.end(token, {
        interview_id:     interviewId,
        transcript_json:  JSON.stringify(
          mergeLines(linesRef.current, false).map(({ itemId, ...line }) => line)
        ),
        duration_seconds: Math.max(elapsed, 0),
      })
    } catch { /* best effort */ }
    router.push(`/feedback?id=${interviewId}`)
  }

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    dcRef.current?.close()
    pcRef.current?.close()
    if (audioElRef.current) audioElRef.current.srcObject = null
    streamRef.current = dcRef.current = pcRef.current = audioElRef.current = null
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

  const isWarning = timeLeft <= WRAP_UP_SECONDS && timeLeft > 0

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-3 flex items-center
                         justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            {interview.role} · <span className="capitalize">{interview.level}</span>
          </span>
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            {connStatus === 'connected' ? (
              <><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Live</span></>
            ) : connStatus === 'connecting' ? (
              <><div className="w-3.5 h-3.5 border-2 border-gray-200
                               border-t-brand-500 rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Connecting...</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400">Disconnected</span></>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium
          ${isWarning ? 'text-red-500' : 'text-gray-500'}`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono">{fmtTime(timeLeft)}</span>
          {isWarning && (
            <span className="text-xs font-normal">(wrapping up)</span>
          )}
        </div>
      </header>

      {/* Main — split layout */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-gray-100
                      overflow-hidden">

        {/* LEFT — Interview */}
        <div className="flex flex-col overflow-hidden">

          {/* Alex orb + status */}
          <div className="flex flex-col items-center pt-6 pb-4 flex-shrink-0">
            <div className={`relative w-16 h-16 rounded-full border-2
                            flex items-center justify-center mb-3 transition-all
              ${turnStatus === 'alex_speaking'
                ? 'border-indigo-500 bg-indigo-50 orb-pulse'
                : turnStatus === 'user_speaking'
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-xl font-medium
                ${turnStatus === 'alex_speaking' ? 'text-indigo-600' : 'text-gray-600'}`}>A</div>
            </div>
            <p className="text-xs text-gray-400 h-4">
              {connStatus === 'connected' && turnStatus === 'alex_speaking' && 'Alex is speaking...'}
              {connStatus === 'connected' && turnStatus === 'user_speaking' && 'Listening...'}
              {connStatus === 'connected' && turnStatus === 'processing'    && 'Processing...'}
              {connStatus === 'connected' && turnStatus === 'idle'          && 'Your turn — speak now'}
              {connStatus === 'connecting' && 'Connecting to Alex...'}
            </p>
            {connError && (
              <p className="text-xs text-red-500 mt-2 px-6 text-center">{connError}</p>
            )}
          </div>

          {/* Transcript */}
          <div ref={transcriptRef}
               className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
            {mergeLines(transcript, true).map((line, i) => (
              <div key={i}
                   className={`flex ${line.role === 'alex'
                     ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px]
                                leading-relaxed
                  ${line.role === 'alex'
                    ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    : 'bg-indigo-500 text-white rounded-tr-sm'}`}>
                  {line.text
                    ? renderMessage(line.text)
                    : <span className="opacity-70 animate-pulse">…</span>}
                </div>
              </div>
            ))}
            {/* Live alex text (streaming) */}
            {alexText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 text-gray-800 rounded-2xl
                               rounded-tl-sm px-4 py-2.5 text-[13px] leading-relaxed
                               opacity-70">
                  {alexText}
                  <span className="inline-block w-1 h-3 bg-gray-400
                                   animate-pulse ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Mic status + end button */}
          <div className="flex-shrink-0 px-5 pb-5 pt-3
                          border-t border-gray-50 space-y-3">
            {/* Mic indicator — always on with Server VAD */}
            <div className="flex items-center justify-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center
                              justify-center transition-all
                ${turnStatus === 'user_speaking'
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-gray-100 border border-gray-200'}`}>
                <Mic className={`w-4 h-4
                  ${turnStatus === 'user_speaking'
                    ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <span className="text-xs text-gray-400">
                {turnStatus === 'user_speaking'
                  ? 'Microphone active'
                  : 'Microphone on — speak anytime'}
              </span>
            </div>

            <button
              onClick={handleEnd}
              className="w-full flex items-center justify-center gap-2
                         py-2.5 rounded-xl border border-red-200 text-red-400
                         text-sm hover:bg-red-50 transition-colors">
              <PhoneOff className="w-4 h-4" />
              End interview
            </button>
          </div>
        </div>

        {/* RIGHT — Live coaching */}
        <div className="flex flex-col overflow-hidden bg-gray-50">
          <div className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">Live coaching</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Feedback appears after each answer
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {coachingNotes.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-full bg-gray-100
                               flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">💬</span>
                </div>
                <p className="text-sm text-gray-400">
                  Coaching notes will appear here
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  After each answer Alex receives
                </p>
              </div>
            ) : (
              coachingNotes.map((note) => {
                const style = TAG_STYLES[note.tag]
                return (
                  <div key={note.id}
                       className="bg-white border border-gray-100
                                  rounded-xl p-3">
                    {/* Tag */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full
                                      ${style.dot}`} />
                      <span className={`text-xs font-medium ${style.labelText}`}>
                        {style.label}
                      </span>
                    </div>
                    {/* What was said */}
                    <p className="text-xs text-gray-400 italic mb-2
                                  leading-relaxed line-clamp-2">
                      "{note.question}"
                    </p>
                    {/* Coaching note */}
                    <p className={`text-xs leading-relaxed rounded-lg
                                  px-3 py-2 ${style.pill}`}>
                      {note.coaching}
                    </p>
                    {/* Try instead */}
                    {note.try_instead && (
                      <div className="mt-2">
                        <p className="text-xs text-indigo-500 mb-1">
                          Try instead:
                        </p>
                        <p className="text-xs text-gray-500 italic
                                      leading-relaxed">
                          "{note.try_instead}"
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
