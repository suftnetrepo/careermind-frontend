'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight } from 'lucide-react'
import DownloadTranscriptButton from '@/components/feedback/DownloadTranscriptButton'
import QuizTab from '@/components/interview/QuizTab'
import FlashcardTab from '@/components/interview/FlashcardTab'
import { api } from '@/lib/api'
import type { StudyMaterials } from '@/types'

type Tab = 'feedback' | 'flashcards' | 'quiz'

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

  async function handleGenerateStudy() {
    if (!session?.accessToken || !interviewId) return
    setGenerating(true)
    setStudyError('')
    try {
      const data = await api.interviews.generateStudyMaterials(session.accessToken, interviewId)
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
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="max-w-5xl mx-auto flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'feedback' && (
        <main className="max-w-2xl mx-auto px-6 py-10">
          {children}

          {/* Generate study materials CTA */}
          {!studyMaterials && (
            <div className="card text-center py-8 mb-6">
              <p className="text-gray-900 font-medium mb-2">
                Turn this interview into a study session
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Generate 25 quiz questions and flashcards based on the topics
                covered in your interview.
              </p>
              {studyError && <p className="text-sm text-red-500 mb-3">{studyError}</p>}
              <button
                onClick={handleGenerateStudy}
                disabled={generating || !interviewId}
                className="btn-primary disabled:opacity-50">
                {generating
                  ? 'Generating study materials...'
                  : 'Generate quiz and flashcards →'}
              </button>
              <p className="text-xs text-gray-400 mt-3">Takes about 15–20 seconds</p>
            </div>
          )}

          {studyMaterials && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-green-700 font-medium mb-2">
                Study materials ready
              </p>
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

          <div className="flex gap-3">
            <Link href="/setup" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
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
        <div className="max-w-5xl mx-auto px-6">
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
        <div className="max-w-5xl mx-auto px-6">
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
