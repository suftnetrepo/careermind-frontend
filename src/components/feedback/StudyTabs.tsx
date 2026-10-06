'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Mic, Sparkles } from 'lucide-react'
import DownloadTranscriptButton from '@/components/feedback/DownloadTranscriptButton'
import QuizTab from '@/components/interview/QuizTab'
import FlashcardTab from '@/components/interview/FlashcardTab'
import { api } from '@/lib/api'
import type { StudyMaterials, StudyModel } from '@/types'

type Tab = 'feedback' | 'flashcards' | 'quiz'

const MODEL_OPTIONS: { value: StudyModel; label: string; desc: string; badge: string }[] = [
  { value: 'gpt-4o-mini', label: 'Standard', desc: 'Lower cost · ~40 seconds', badge: '' },
  { value: 'gpt-4o',      label: 'Premium',  desc: 'Faster · ~20 seconds',    badge: 'GPT-4o' },
]
const MODEL_NAMES: Record<StudyModel, string> = { 'gpt-4o': 'Premium (GPT-4o)', 'gpt-4o-mini': 'Standard (GPT-4o-mini)' }

interface Props {
  interviewId:      string | null
  initialMaterials: StudyMaterials | null
  // The feedback tab's content, rendered on the server by the feedback page
  children:         React.ReactNode
  transcript:       { role: 'alex' | 'user'; text: string }[]
  role:             string
  level:            string
  createdAt:        string | null
  durationSeconds:  number | null
}

export default function StudyTabs({
  interviewId, initialMaterials, children, transcript, role, level, createdAt, durationSeconds,
}: Props) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('feedback')
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterials | null>(initialMaterials)
  const [generating, setGenerating] = useState(false)
  const [studyError, setStudyError] = useState('')
  // Premium by default — in testing it was faster and as good or better
  const [studyModel, setStudyModel] = useState<StudyModel>('gpt-4o')

  async function handleGenerateStudy() {
    if (!session?.accessToken || !interviewId) return
    setGenerating(true)
    setStudyError('')
    try {
      const data = await api.interviews.generateStudyMaterials(session.accessToken, interviewId, studyModel)
      setStudyMaterials(data)
      setActiveTab('flashcards')
    } catch (err: any) {
      setStudyError(err.message || 'Failed to generate study materials')
    } finally {
      setGenerating(false)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'feedback',   label: 'Feedback' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'quiz',       label: `Quiz (${studyMaterials?.quiz.length ?? 25})` },
  ]

  const generateButton = (label: string) => (
    <>
      {studyError && <p className="text-sm text-red-500 mb-3">{studyError}</p>}
      <button
        onClick={handleGenerateStudy}
        disabled={generating || !interviewId}
        className="btn-primary disabled:opacity-50">
        {generating ? 'Generating...' : label}
      </button>
    </>
  )

  return (
    <>
      {/* Tab bar — aligned with the header content */}
      <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4">
          <Link href="/dashboard" className="mr-2 inline-flex shrink-0 items-center gap-2.5 text-xl font-extrabold tracking-[-.04em] text-slate-950"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200"><Mic className="h-5 w-5" /></span><span className="hidden sm:inline">Career<span className="text-indigo-600">Mind</span></span></Link>
          <div className="flex min-w-0 flex-1 self-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 text-sm font-bold transition-colors sm:px-6
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
            </button>
          ))}
          </div>
          <Link href="/dashboard" className="hidden shrink-0 items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600 md:inline-flex"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        </div>
      </div>

      {activeTab === 'feedback' && (
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          {children}

          {/* Generate study materials CTA */}
          {!studyMaterials && (
            <div className="mb-6 flex flex-col items-center justify-between gap-6 rounded-[28px] border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-7 text-center shadow-sm sm:flex-row sm:text-left">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm"><BookOpen className="h-7 w-7" /></span><div className="flex-1"><p className="mb-2 text-lg font-extrabold text-slate-900">
                Turn this interview into a study session
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Generate 25 quiz questions and flashcards based on the topics
                covered in your interview.
              </p>

              {/* Model selector */}
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Generation quality</p>
                <div className="flex justify-center gap-2 sm:justify-start">
                  {MODEL_OPTIONS.map(opt => {
                    const active = studyModel === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStudyModel(opt.value)}
                        disabled={generating}
                        aria-pressed={active}
                        className={`max-w-40 flex-1 rounded-xl border-2 p-3 text-left transition-all disabled:opacity-60
                          ${active ? 'border-indigo-500 bg-white' : 'border-white/60 bg-white/60 hover:border-indigo-200'}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={`text-sm font-bold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{opt.label}</span>
                          {opt.badge && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{opt.badge}</span>}
                        </div>
                        <p className={`text-xs ${active ? 'text-indigo-400' : 'text-slate-400'}`}>{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
              {studyError && <p className="mt-2 text-sm text-red-500">{studyError}</p>}</div>
              <div className="flex shrink-0 flex-col items-center gap-2">
                <button
                  onClick={handleGenerateStudy}
                  disabled={generating || !interviewId}
                  className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 disabled:opacity-50">
                  {generating
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                    : <><Sparkles className="h-4 w-4" />Generate quiz and flashcards<ArrowRight className="h-4 w-4" /></>}
                </button>
                <p className="text-xs text-slate-400">
                  {studyModel === 'gpt-4o-mini' ? 'Standard quality · ~40 seconds' : 'Premium quality · ~20 seconds'}
                </p>
              </div>
            </div>
          )}

          {studyMaterials && (
            <div className="mb-6 rounded-[22px] border border-green-100 bg-green-50 p-5 text-center">
              <p className="text-sm text-green-700 font-medium mb-1">
                Study materials ready
              </p>
              {studyMaterials.model && (
                <p className="mb-3 text-xs text-gray-400">Generated with {MODEL_NAMES[studyMaterials.model]}</p>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={() => setActiveTab('flashcards')} className="btn-primary text-sm py-2">
                  Study flashcards
                </button>
                <button onClick={() => setActiveTab('quiz')} className="btn-secondary text-sm py-2">
                  Take quiz
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/setup" className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-extrabold text-white">
              Practice again <ArrowRight className="w-4 h-4" />
            </Link>
            <DownloadTranscriptButton
              interviewId={interviewId}
              transcript={transcript}
              role={role}
              level={level}
              createdAt={createdAt}
              durationSeconds={durationSeconds}
            />
          </div>
        </main>
      )}

      {activeTab === 'flashcards' && (
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          {studyMaterials?.flashcards ? (
            <FlashcardTab cards={studyMaterials.flashcards} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No flashcards yet</p>
              {generateButton('Generate flashcards')}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          {studyMaterials?.quiz ? (
            <QuizTab questions={studyMaterials.quiz} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No quiz yet</p>
              {generateButton('Generate quiz')}
            </div>
          )}
        </div>
      )}
    </>
  )
}
