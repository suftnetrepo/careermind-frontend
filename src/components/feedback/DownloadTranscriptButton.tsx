'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Download } from 'lucide-react'
import { api } from '@/lib/api'
import type { FeedbackReport } from '@/types'

interface TranscriptLine {
  role: 'alex' | 'user'
  text: string
}

interface Props {
  interviewId:     string | null
  transcript:      TranscriptLine[]
  role:            string
  level:           string
  createdAt:       string | null
  durationSeconds: number | null
}

function buildReport(p: Props, fb: FeedbackReport | null) {
  const minutes = Math.floor((p.durationSeconds || 0) / 60)
  const seconds = (p.durationSeconds || 0) % 60
  const date = p.createdAt ? new Date(p.createdAt) : new Date()

  const header = [
    'Interquis Interview Transcript',
    `Role: ${p.role} · ${p.level}`,
    `Date: ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    `Duration: ${minutes} min ${seconds} sec`,
    '─'.repeat(40),
    '',
  ].join('\n')

  const lines = p.transcript.map(line => {
    const speaker = line.role === 'alex' ? 'Alex (Interviewer)' : 'You (Candidate)'
    return `${speaker}:\n${line.text}\n`
  })

  const summary = fb ? [
    '',
    '─'.repeat(40),
    'FEEDBACK SUMMARY',
    '─'.repeat(40),
    `Overall score: ${fb.overall_score}/100`,
    '',
    'STRENGTHS:',
    ...(fb.strengths || []).map(s => `• ${s}`),
    '',
    'AREAS TO IMPROVE:',
    ...(fb.improvements || []).map(s => `• ${s}`),
    '',
    'QUESTION SCORES:',
    ...(fb.questions || []).map(q =>
      q.covered ? `• ${q.topic}: ${q.score}/100 — ${q.feedback}` : `• ${q.topic}: not covered`),
  ].join('\n') : ''

  return header + lines.join('\n') + summary
}

export default function DownloadTranscriptButton(props: Props) {
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const empty = props.transcript.length === 0

  async function handleDownload() {
    setBusy(true)
    // Feedback may have finished after the page loaded — fetch the latest
    let fb: FeedbackReport | null = null
    if (session?.accessToken && props.interviewId) {
      fb = await api.interviews.getFeedbackStatus(session.accessToken, props.interviewId)
        .then(s => s.feedback)
        .catch(() => null)
    }
    const blob = new Blob([buildReport(props, fb)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interquis-interview-${props.role.toLowerCase().replace(/\s+/g, '-')}-` +
                 `${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setBusy(false)
  }

  return (
    <button
      className="btn-secondary flex items-center gap-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={empty || busy}
      title={empty ? 'No transcript was recorded for this interview' : undefined}
      onClick={handleDownload}>
      <Download className="w-4 h-4" /> Download transcript
    </button>
  )
}
