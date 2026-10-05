'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BarChart3, CheckCircle2, Lightbulb, MessageSquareText, Mic, Clock, PhoneOff, WifiOff, AlertCircle, Loader2, Sparkles } from 'lucide-react'
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
// When the clock hits zero Alex closes the interview; the call ends after this
const GRACE_SECONDS            = 60
const CLOSING_INSTRUCTION =
  'The interview time has ended. Say a warm, professional closing: thank the candidate for ' +
  'their time, give one brief positive observation about something they actually said (if they ' +
  'gave little or no real answer, thank them for practising instead of inventing praise), and let ' +
  'them know their feedback report will be ready shortly. Keep it under 30 seconds.'
const MIN_COACHING_WORDS       = 5

const TAG_STYLES = {
  positive: {
    dot:       'bg-green-500',
    labelText: 'text-green-600',
    pill:      'border border-green-100 bg-green-50 text-green-700',
    label:     'Positive',
    icon:      CheckCircle2,
  },
  tip: {
    dot:       'bg-amber-400',
    labelText: 'text-amber-600',
    pill:      'border border-amber-100 bg-amber-50 text-amber-700',
    label:     'Tip',
    icon:      Lightbulb,
  },
  pitfall: {
    dot:       'bg-red-400',
    labelText: 'text-red-500',
    pill:      'border border-red-100 bg-red-50 text-red-600',
    label:     'Pitfall',
    icon:      AlertCircle,
  },
}

const CODE_PRE_CLASS = `bg-gray-900 text-green-400 rounded-lg p-3 mt-2 mb-2
                        text-xs font-mono overflow-x-auto whitespace-pre-wrap`

// Alex is told to wrap spoken code in these phrases (see build_interviewer_prompt).
// Transcripts usually arrive as one paragraph, so these markers are the reliable signal.
const SPOKEN_CODE_RE = /(here is the code:?)([\s\S]*?)(end of code\.?|$)/gi

// For transcripts that do contain line breaks: lines that look like spoken code
const CODE_LINE_RE = /^\s*(def|function|class|const|let|var|import|return|if|for|while)\s|[:{]\s*$|^\s{2,}\S/
const MIN_CODE_LINES = 3

const CODING_QUESTION_RE = /\b(write|code|implement|function|algorithm|script|program)\b/i

function isCodingQuestion(text: string) {
  return CODING_QUESTION_RE.test(text)
}

// Wrap runs of 3+ consecutive code-like lines in a code block
function renderCodeLines(text: string, keyBase: number): React.ReactNode[] {
  const lines = text.split('\n')
  const parts: React.ReactNode[] = []
  let prose: string[] = []
  let i = 0
  const flushProse = () => {
    if (prose.length) parts.push(<span key={`${keyBase}-p${i}`}>{prose.join('\n')}</span>)
    prose = []
  }
  while (i < lines.length) {
    let j = i
    while (j < lines.length && CODE_LINE_RE.test(lines[j])) j++
    if (j - i >= MIN_CODE_LINES) {
      flushProse()
      parts.push(
        <pre key={`${keyBase}-c${i}`} className={CODE_PRE_CLASS}>
          <code>{lines.slice(i, j).join('\n')}</code>
        </pre>
      )
      i = j
    } else {
      prose.push(lines[i])
      i++
    }
  }
  flushProse()
  return parts
}

// Highlight code in a transcript line — from Alex's spoken markers, or from
// multi-line code-like text
function renderMessage(text: string) {
  const parts: React.ReactNode[] = []
  let last = 0
  let match

  SPOKEN_CODE_RE.lastIndex = 0
  while ((match = SPOKEN_CODE_RE.exec(text)) !== null) {
    const [whole, intro, code, outro] = match
    if (!code.trim()) {
      if (whole.length === 0) SPOKEN_CODE_RE.lastIndex++   // avoid looping on an empty match
      continue
    }
    parts.push(...renderCodeLines(text.slice(last, match.index) + intro, last))
    parts.push(
      <pre key={`code-${match.index}`} className={CODE_PRE_CLASS}>
        <code>{code.trim()}</code>
      </pre>
    )
    if (outro) parts.push(<span key={`outro-${match.index}`}>{outro}</span>)
    last = match.index + whole.length
  }
  parts.push(...renderCodeLines(text.slice(last), last))
  return parts.length > 0 ? parts : text
}

function InterviewRoom() {
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
  const [gracePeriod, setGracePeriod]     = useState(false)
  const [graceSecsLeft, setGraceSecsLeft] = useState(GRACE_SECONDS)
  const graceTimerRef                     = useRef<NodeJS.Timeout | null>(null)
  const graceStartedRef                   = useRef(false)   // interval callbacks can't see state
  const graceUsedRef                      = useRef(0)
  // Realtime rejects response.create while a response is in progress — queue it
  const responseActiveRef                 = useRef(false)
  const responsePendingRef                = useRef(false)

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
      if (s <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        startGracePeriod()
      }
    }, 1000)
  }

  // Time's up: Alex closes the interview, and the call ends GRACE_SECONDS later
  function startGracePeriod() {
    if (graceStartedRef.current || endingRef.current) return
    graceStartedRef.current = true
    setGracePeriod(true)
    setGraceSecsLeft(GRACE_SECONDS)
    sendTextEvent(CLOSING_INSTRUCTION)
    let grace = GRACE_SECONDS
    graceTimerRef.current = setInterval(() => {
      grace--
      graceUsedRef.current = GRACE_SECONDS - grace
      setGraceSecsLeft(grace)
      if (grace <= 0) {
        if (graceTimerRef.current) clearInterval(graceTimerRef.current)
        graceTimerRef.current = null
        handleEnd()
      }
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

    if (type === 'response.created') responseActiveRef.current = true
    if (type === 'response.done') {
      responseActiveRef.current = false
      if (responsePendingRef.current) {
        responsePendingRef.current = false
        requestResponse()
      }
    }

    if (type === 'error') {
      console.error('Realtime error event:', event.error)
    }
  }

  function requestResponse() {
    if (dcRef.current?.readyState !== 'open') return
    if (responseActiveRef.current) { responsePendingRef.current = true; return }
    dcRef.current.send(JSON.stringify({ type: 'response.create' }))
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
      requestResponse()
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
    const elapsed = total - timeLeftRef.current + graceUsedRef.current
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
    if (graceTimerRef.current) clearInterval(graceTimerRef.current)
    graceTimerRef.current = null
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
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8faff] text-slate-950">

      {/* Header */}
      <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-7">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <span className="hidden items-center gap-2.5 text-xl font-extrabold tracking-[-0.04em] text-slate-950 sm:inline-flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_8px_20px_rgba(99,102,241,.24)]"><Mic className="h-5 w-5" strokeWidth={2.5} /></span>
            <span>Career<span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">Mind</span></span>
          </span>
          <span className="truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 sm:px-4">
            {interview.role} · <span className="capitalize">{interview.level}</span>
          </span>
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            {connStatus === 'connected' ? (
              <><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-600">Live</span></>
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
        <div className="flex items-center gap-3 sm:gap-5">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${gracePeriod ? 'text-amber-500' : isWarning ? 'text-red-500' : 'text-slate-500'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono">{gracePeriod ? `+${graceSecsLeft}s` : fmtTime(timeLeft)}</span>
            {gracePeriod && <span className="hidden text-xs font-normal sm:inline">wrapping up</span>}
            {!gracePeriod && isWarning && <span className="hidden text-xs font-normal sm:inline">(wrapping up)</span>}
          </div>
          <button onClick={handleEnd} className="hidden min-h-11 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 text-sm font-extrabold text-red-500 transition hover:bg-red-100 md:inline-flex"><PhoneOff className="h-4 w-4" />End interview</button>
        </div>
      </header>

      {gracePeriod && (
        <div className="flex flex-shrink-0 items-center justify-between border-b border-amber-100 bg-amber-50 px-6 py-2">
          <p className="text-xs text-amber-700">Time&apos;s up — Alex is wrapping up the interview</p>
          <p className="font-mono text-xs text-amber-500">Ending in {graceSecsLeft}s</p>
        </div>
      )}

      {/* Main — split layout */}
      <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[1.18fr_.82fr]">

        {/* LEFT — Interview */}
        <div className="flex flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,41,59,.06)]">

          {/* Alex orb + status */}
          <div className="relative flex flex-shrink-0 flex-col items-center border-b border-slate-100 bg-[radial-gradient(circle_at_50%_0%,rgba(199,210,254,.38),transparent_60%)] pb-5 pt-6">
            <div className="absolute left-[calc(50%-125px)] top-12 hidden items-end gap-1 text-indigo-300 sm:flex">{[3,6,10,16,22,14,8,4].map((height, index) => <span key={index} className="w-1 rounded-full bg-current" style={{ height }} />)}</div>
            <div className="absolute right-[calc(50%-125px)] top-12 hidden items-end gap-1 text-indigo-300 sm:flex">{[4,8,14,22,16,10,6,3].map((height, index) => <span key={index} className="w-1 rounded-full bg-current" style={{ height }} />)}</div>
            <div className={`relative mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-lg transition-all
              ${turnStatus === 'alex_speaking'
                ? 'border-indigo-500 bg-indigo-50 shadow-indigo-200 orb-pulse'
                : turnStatus === 'user_speaking'
                ? 'border-green-400 bg-green-50 shadow-green-100'
                : 'border-slate-200 bg-white shadow-slate-100'}`}>
              <div className={`text-xl font-extrabold ${turnStatus === 'alex_speaking' ? 'text-indigo-600' : 'text-slate-600'}`}>A</div>
            </div>
            <p className="h-4 text-xs font-semibold text-slate-500">
              {connStatus === 'connected' && turnStatus === 'alex_speaking' && 'Alex is speaking...'}
              {connStatus === 'connected' && turnStatus === 'user_speaking' && 'Listening...'}
              {connStatus === 'connected' && turnStatus === 'processing'    && 'Processing...'}
              {connStatus === 'connected' && turnStatus === 'idle'          && 'Your turn — speak now'}
              {connStatus === 'connecting' && 'Connecting to Alex...'}
            </p>
            {connError && (
              <p className="mt-2 px-6 text-center text-xs font-semibold text-red-500">{connError}</p>
            )}
          </div>

          {/* Transcript */}
          <div ref={transcriptRef}
               className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
            {mergeLines(transcript, true).map((line, i) => (
              <div key={i}
                   className={`flex ${line.role === 'alex'
                     ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm sm:max-w-[80%]
                  ${line.role === 'alex'
                    ? 'rounded-tl-sm border border-slate-100 bg-slate-50 text-slate-800'
                    : 'rounded-tr-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-100'}`}>
                  {line.text
                    ? renderMessage(line.text)
                    : <span className="opacity-70 animate-pulse">…</span>}
                  {line.role === 'alex' && isCodingQuestion(line.text) && (
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600
                                     ">
                      Coding question
                    </span>
                  )}
                </div>
              </div>
            ))}
            {/* Live alex text (streaming) */}
            {alexText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-800 opacity-70 shadow-sm">
                  {alexText}
                  <span className="inline-block w-1 h-3 bg-gray-400
                                   animate-pulse ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Mic status + end button */}
          <div className="flex flex-shrink-0 items-center gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
            {/* Mic indicator — always on with Server VAD */}
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-3 py-2.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all
                ${turnStatus === 'user_speaking'
                  ? 'border-2 border-green-400 bg-green-100'
                  : 'border border-indigo-100 bg-white'}`}>
                <Mic className={`w-4 h-4
                  ${turnStatus === 'user_speaking'
                    ? 'text-green-500' : 'text-indigo-500'}`} />
              </div>
              <span className="truncate text-xs font-semibold text-slate-500">
                {turnStatus === 'user_speaking'
                  ? 'Microphone active'
                  : 'Microphone on — speak anytime'}
              </span>
            </div>

            <button
              onClick={handleEnd}
              className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-extrabold text-red-500 transition-colors hover:bg-red-100 md:hidden">
              <PhoneOff className="w-4 h-4" />
              End interview
            </button>
          </div>
        </div>

        {/* RIGHT — Live coaching */}
        <div className="hidden flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50/70 shadow-[0_16px_45px_rgba(30,41,59,.05)] lg:flex">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div><p className="text-lg font-extrabold tracking-[-0.02em] text-slate-900">Live coaching</p>
            <p className="mt-1 text-xs text-slate-500">
              Feedback appears after each answer
            </p></div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Live</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {coachingNotes.length === 0 ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <p className="text-sm font-extrabold text-slate-700">
                  Coaching notes will appear here
                </p>
                <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                  Answer naturally and Alex will share focused guidance after each response.
                </p>
              </div>
            ) : (
              coachingNotes.map((note) => {
                const style = TAG_STYLES[note.tag]
                const NoteIcon = style.icon
                return (
                  <div key={note.id}
                       className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                    {/* Tag */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${style.pill}`}><NoteIcon className="h-4 w-4" /></span>
                      <span className={`text-xs font-extrabold ${style.labelText}`}>
                        {style.label}
                      </span>
                    </div>
                    {/* What was said */}
                    <p className="mb-3 line-clamp-2 text-xs italic leading-relaxed text-slate-400">
                      "{note.question}"
                    </p>
                    {/* Coaching note */}
                    <p className={`rounded-xl px-4 py-3 text-xs font-semibold leading-relaxed ${style.pill}`}>
                      {note.coaching}
                    </p>
                    {/* Try instead */}
                    {note.try_instead && (
                      <div className="mt-2">
                        <p className="mb-1 text-xs font-bold text-indigo-500">
                          Try instead:
                        </p>
                        <p className="text-xs italic leading-relaxed text-slate-500">
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

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f8faff]"><Loader2 className="h-7 w-7 animate-spin text-indigo-500" /></div>}>
      <InterviewRoom />
    </Suspense>
  )
}
