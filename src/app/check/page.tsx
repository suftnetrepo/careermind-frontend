'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mic, Volume2, Wifi, CheckCircle, XCircle, Loader2, ArrowRight, X, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { CheckReady } from '@/types'

type CheckStatus = 'idle' | 'checking' | 'pass' | 'fail'
type Browser = 'chrome' | 'safari' | 'firefox' | 'edge'
// Why the drawer is open: the browser blocked the mic, or it's allowed but silent
type Problem = 'permission' | 'silent'

interface Checks {
  mic:        CheckStatus
  audio:      CheckStatus
  connection: CheckStatus
}

const IDLE: Checks = { mic: 'idle', audio: 'idle', connection: 'idle' }
const LISTEN_MS = 5000
const DETECT_LEVEL = 8

function detectBrowser(): Browser {
  const ua = navigator.userAgent
  if (ua.includes('Edg/'))     return 'edge'
  if (ua.includes('Firefox/') || ua.includes('FxiOS/')) return 'firefox'
  if (ua.includes('Chrome/'))  return 'chrome'
  if (ua.includes('Safari/'))  return 'safari'
  return 'chrome'
}

const BROWSER_NAMES: Record<Browser, string> = { chrome: 'Chrome', safari: 'Safari', firefox: 'Firefox', edge: 'Edge' }

const PERMISSION_STEPS: Record<Browser, string[]> = {
  chrome: [
    'Click the icon at the left of the address bar (🔒 or the sliders icon)',
    'Find "Microphone" in the list',
    'Change it from "Block" to "Allow"',
    'Refresh this page and try again',
  ],
  safari: [
    'In the menu bar, open Safari → Settings for This Website',
    'Find "Microphone" in the permissions list',
    'Set it to "Allow"',
    'Refresh this page and try again',
  ],
  firefox: [
    'Click the 🔒 lock or crossed-out microphone icon in the address bar',
    'Next to "Use the microphone", click × to clear the block',
    'Refresh this page and try again',
  ],
  edge: [
    'Click the 🔒 lock icon in the address bar',
    'Find "Microphone" in the permissions',
    'Change it to "Allow"',
    'Refresh this page and try again',
  ],
}

// Permission is granted but nothing is coming through — the browser settings are fine
const SILENT_STEPS: Record<Browser, string[]> = Object.fromEntries(
  (Object.keys(BROWSER_NAMES) as Browser[]).map(b => [b, [
    'Check your microphone or headset is not muted — many have a mute switch or button',
    'Make sure the right microphone is selected in your computer\'s sound settings',
    b === 'safari'
      ? 'If you have more than one microphone, choose the input in System Settings → Sound → Input'
      : `Check ${BROWSER_NAMES[b]} is using the right microphone: click the icon at the left of the address bar and open its site settings`,
    'Speak at a normal volume, close to the microphone, then try again',
  ]]),
) as Record<Browser, string[]>

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'idle')     return <span className="text-xs text-gray-300">Waiting</span>
  if (status === 'checking') return <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
  if (status === 'pass')     return <CheckCircle className="h-5 w-5 text-green-500" />
  return <XCircle className="h-5 w-5 text-red-400" />
}

function MicCheck() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const id = useSearchParams().get('id')
  const token = session?.accessToken

  const [interview, setInterview] = useState<CheckReady | null>(null)
  const [checks, setChecks] = useState<Checks>(IDLE)
  const [audioLevel, setAudioLevel] = useState(0)
  const [needsTap, setNeedsTap] = useState(false)
  const [pageError, setPageError] = useState('')
  const [startError, setStartError] = useState('')
  const [starting, setStarting] = useState(false)
  const [speakerPlaying, setSpeakerPlaying] = useState(false)
  const [speakerTested, setSpeakerTested] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [browser, setBrowser] = useState<Browser>('chrome')

  const streamRef     = useRef<MediaStream | null>(null)
  const animFrameRef  = useRef<number | null>(null)
  const audioCtxRef   = useRef<AudioContext | null>(null)
  const runIdRef      = useRef(0)
  const loadedRef     = useRef(false)

  useEffect(() => { setBrowser(detectBrowser()) }, [])

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.replace('/login')
  }, [authStatus, router])

  // Load once per token — the session object changes on every refetch and
  // window focus, which must not restart (or tear down) a check in progress
  useEffect(() => {
    if (!token || !id || loadedRef.current) return
    loadedRef.current = true
    api.interviews.checkReady(token, id).then(async data => {
      if (data.completed) { router.replace(`/feedback?id=${id}`); return }
      if (data.already_started) { await goToInterview(token, id); return }
      if (!data.ready) { setPageError('This interview is not ready. Please complete payment first.'); return }
      setInterview(data)
      runChecks()
    }).catch(() => setPageError('Interview not found.'))
  }, [token, id])

  useEffect(() => () => stopStream(), [])

  function stopStream() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
  }

  function openDrawer(p: Problem) {
    setProblem(p)
    setDrawerOpen(true)
  }

  async function runChecks() {
    // A newer run supersedes this one — every async step checks it's still current
    const runId = ++runIdRef.current
    const current = () => runIdRef.current === runId
    stopStream()
    setChecks({ mic: 'checking', audio: 'idle', connection: 'checking' })
    setAudioLevel(0)
    setNeedsTap(false)
    setDrawerOpen(false)

    checkConnection().then(ok => {
      if (current()) setChecks(c => ({ ...c, connection: ok ? 'pass' : 'fail' }))
    })

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      if (!current()) return
      setChecks(c => ({ ...c, mic: 'fail', audio: 'fail' }))
      openDrawer('permission')
      return
    }
    if (!current()) { stream.getTracks().forEach(t => t.stop()); return }
    streamRef.current = stream
    setChecks(c => ({ ...c, mic: 'pass', audio: 'checking' }))

    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    ctx.createMediaStreamSource(stream).connect(analyser)

    // Browsers start an AudioContext suspended until the page has been clicked;
    // a suspended context reads silence, so ask for a tap instead of failing
    await Promise.race([ctx.resume().catch(() => {}), new Promise(r => setTimeout(r, 500))])
    if (!current()) return
    if (ctx.state !== 'running') {
      setChecks(c => ({ ...c, audio: 'idle' }))
      setNeedsTap(true)
      return
    }
    listen(analyser, current)
  }

  async function resumeAndListen() {
    const ctx = audioCtxRef.current
    const stream = streamRef.current
    if (!ctx || !stream) { runChecks(); return }
    await ctx.resume().catch(() => {})
    const runId = runIdRef.current
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    ctx.createMediaStreamSource(stream).connect(analyser)
    setNeedsTap(false)
    setChecks(c => ({ ...c, audio: 'checking' }))
    listen(analyser, () => runIdRef.current === runId)
  }

  function listen(analyser: AnalyserNode, current: () => boolean) {
    const data = new Uint8Array(analyser.frequencyBinCount)
    const start = Date.now()
    let detected = false
    const monitor = () => {
      if (!current()) return
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      const level = Math.min(100, Math.round(avg * 2.5))
      setAudioLevel(level)
      if (level > DETECT_LEVEL) detected = true

      if (Date.now() - start < LISTEN_MS) {
        animFrameRef.current = requestAnimationFrame(monitor)
        return
      }
      animFrameRef.current = null
      setChecks(c => ({ ...c, audio: detected ? 'pass' : 'fail' }))
      if (!detected) openDrawer('silent')
    }
    animFrameRef.current = requestAnimationFrame(monitor)
  }

  // The interview is a WebRTC call brokered by our API — both must work
  async function checkConnection() {
    if (typeof RTCPeerConnection === 'undefined') return false
    return api.health()
  }

  function retry() {
    setDrawerOpen(false)
    setTimeout(runChecks, 200)
  }

  async function playTestTone() {
    setSpeakerPlaying(true)
    try {
      const ctx = new AudioContext()
      await ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
      osc.start()
      osc.stop(ctx.currentTime + 1.5)
      setTimeout(() => {
        ctx.close().catch(() => {})
        setSpeakerPlaying(false)
        setSpeakerTested(true)
      }, 1600)
    } catch {
      setSpeakerPlaying(false)
    }
  }

  // The interview page reads the full interview from sessionStorage
  async function goToInterview(accessToken: string, interviewId: string) {
    const full = await api.interviews.get(accessToken, interviewId)
    sessionStorage.setItem('cm_interview', JSON.stringify({
      ...full, interview_id: full.id, transcript: undefined, feedback: undefined,
    }))
    router.push(`/interview?id=${interviewId}`)
  }

  async function handleStart() {
    if (!token || !id) return
    setStarting(true)
    setStartError('')
    runIdRef.current++
    stopStream()
    try {
      await api.interviews.start(token, id)
      await goToInterview(token, id)
    } catch (err: any) {
      setStartError(err.message || 'Failed to start')
      setStarting(false)
    }
  }

  const allPassed = checks.mic === 'pass' && checks.audio === 'pass' && checks.connection === 'pass'
  const anyFailed = checks.mic === 'fail' || checks.audio === 'fail' || checks.connection === 'fail'
  // The level meter can miss a quiet microphone; once the browser has granted
  // access, let the candidate overrule it rather than lock them out of a paid interview
  const canOverride = checks.mic === 'pass' && checks.audio === 'fail' && checks.connection === 'pass'
  const steps = (problem === 'silent' ? SILENT_STEPS : PERMISSION_STEPS)[browser]

  if (pageError) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-sm text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
        <p className="mb-4 text-sm text-gray-600">{pageError}</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary w-full">Back to dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10">
      {/* Main content — shifts left on wide screens so the drawer doesn't cover it */}
      <div className={`w-full max-w-sm transition-all duration-300 ${drawerOpen ? 'md:mr-40' : ''}`}>
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 text-base font-medium text-gray-900"><img src="/interquis-logo.png" alt="" className="h-7 w-auto" /><span>Inter<span className="text-indigo-500">quis</span></span></p>
          {interview && (
            <p className="mt-1 text-sm capitalize text-gray-400">
              {interview.role} · {interview.level.replace('midlevel', 'mid-level')} · {interview.duration_minutes} min
            </p>
          )}
        </div>

        {/* Checks card */}
        <div className="card mb-4">
          <p className="mb-1 text-sm font-medium text-gray-900">Setup check</p>
          <p className="mb-4 text-xs text-gray-400">Checking your microphone and connection before you start</p>

          <div className="flex items-center justify-between border-b border-gray-50 py-3">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-700">Microphone permission</p>
            </div>
            <StatusIcon status={checks.mic} />
          </div>

          <div className="border-b border-gray-50 py-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-700">Microphone audio</p>
              </div>
              <StatusIcon status={checks.audio} />
            </div>
            {needsTap && (
              <button onClick={resumeAndListen} className="w-full rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100">
                Test microphone
              </button>
            )}
            {checks.audio === 'checking' && (
              <>
                <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${audioLevel}%`,
                      background: audioLevel > 30 ? '#22c55e' : audioLevel > 10 ? '#f59e0b' : '#e5e7eb',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {audioLevel > 10 ? '✓ Audio detected — keep speaking' : 'Speak into your microphone...'}
                </p>
              </>
            )}
            {checks.audio === 'fail' && checks.mic === 'pass' && (
              <p className="mt-1 text-xs text-red-400">No audio detected. Check your mic is not muted.</p>
            )}
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-700">Internet connection</p>
            </div>
            <StatusIcon status={checks.connection} />
          </div>
          {checks.connection === 'fail' && (
            <p className="text-xs text-red-400">Can&apos;t reach Interquis. Check your internet connection.</p>
          )}
        </div>

        {/* Speaker test */}
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Speaker test</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {speakerTested ? 'Did you hear the tone?' : 'Optional — test your speakers'}
              </p>
            </div>
            <button
              onClick={playTestTone}
              disabled={speakerPlaying}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50"
            >
              <Volume2 className="h-3.5 w-3.5" />
              {speakerPlaying ? 'Playing...' : 'Play tone'}
            </button>
          </div>
        </div>

        {anyFailed && (
          <button onClick={retry} className="btn-secondary mb-3 w-full">Try again</button>
        )}

        {startError && <p className="mb-3 text-center text-xs text-red-500">{startError}</p>}

        <button
          onClick={handleStart}
          disabled={!allPassed || starting}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? <><Loader2 className="h-4 w-4 animate-spin" />Starting...</> : <>Start interview<ArrowRight className="h-4 w-4" /></>}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          {allPassed
            ? '✓ All checks passed'
            : anyFailed
              ? 'Fix the issues above to start your interview'
              : 'Checking your setup...'}
        </p>
        {canOverride && !starting && (
          <button onClick={handleStart} className="mx-auto mt-2 block text-xs text-gray-400 underline hover:text-gray-600">
            My microphone works — start anyway
          </button>
        )}
      </div>

      {/* Right drawer */}
      <aside
        aria-hidden={!drawerOpen}
        className="fixed right-0 top-0 z-20 h-full w-80 max-w-[90vw] overflow-y-auto border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-in-out"
        style={{ transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-900">
                {problem === 'silent' ? 'No sound from your microphone' : 'Fix your microphone'}
              </p>
              <p className="mt-1 text-xs text-gray-400">{BROWSER_NAMES[browser]} instructions</p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="mb-8 space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-medium text-indigo-600">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{step}</p>
              </div>
            ))}
          </div>

          {problem === 'permission' && (
            <div className="mb-6 rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Look for this in your browser:</p>
              <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white p-2">
                <span className="text-base">🔒</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100" />
              </div>
              <p className="mt-2 text-xs text-gray-400">The icon at the left of your address bar</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5">
            <p className="mb-3 text-center text-xs text-gray-400">
              {problem === 'silent' ? 'Once your microphone is on:' : 'After allowing access:'}
            </p>
            <button onClick={retry} className="btn-primary w-full py-2.5 text-sm">Try again</button>
          </div>
        </div>
      </aside>

      {/* Tap outside to close on small screens */}
      {drawerOpen && <div className="fixed inset-0 z-10 bg-black/10 md:hidden" onClick={() => setDrawerOpen(false)} />}
    </div>
  )
}

export default function MicCheckPage() {
  return (
    <Suspense fallback={null}>
      <MicCheck />
    </Suspense>
  )
}
