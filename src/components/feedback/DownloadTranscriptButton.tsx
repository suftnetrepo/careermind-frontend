'use client'
import { FileText } from 'lucide-react'

interface TranscriptLine {
  role: 'alex' | 'user'
  text: string
}

function downloadTranscript(transcript: TranscriptLine[], role: string, level: string) {
  const lines = transcript.map((line) => {
    const speaker = line.role === 'alex' ? 'Alex (Interviewer)' : 'You (Candidate)'
    return `${speaker}:\n${line.text}\n`
  })
  const header =
    `CareerMind Interview Transcript\n` +
    `Role: ${role} · ${level}\n` +
    `Date: ${new Date().toLocaleDateString('en-GB')}\n` +
    `${'─'.repeat(40)}\n\n`

  const blob = new Blob([header + lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `careermind-transcript-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DownloadTranscriptButton({
  transcript, role, level,
}: { transcript: TranscriptLine[]; role: string; level: string }) {
  const empty = transcript.length === 0
  return (
    <button
      className="btn-secondary flex items-center gap-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={empty}
      title={empty ? 'No transcript was recorded for this interview' : undefined}
      onClick={() => downloadTranscript(transcript, role, level)}>
      <FileText className="w-4 h-4" /> Transcript
    </button>
  )
}
