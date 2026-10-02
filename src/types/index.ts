export type Level  = 'junior' | 'mid' | 'senior'
export type Focus  = 'technical' | 'behavioural' | 'mixed'
export type InterviewStatus = 'setup' | 'active' | 'completed' | 'abandoned'

export interface Question {
  question:      string
  type:          'technical' | 'behavioural' | 'system_design'
  difficulty:    'easy' | 'medium' | 'hard'
  topic:         string
  follow_up:     string
  ideal_keywords: string[]
}

export interface InterviewSession {
  id:               string
  role:             string
  level:            Level
  focus:            Focus
  duration_minutes: number
  job_description?: string
  questions:        Question[]
  status:           InterviewStatus
  overall_score?:   number
  feedback?:        FeedbackReport
  transcript?:      TranscriptEntry[]
  duration_seconds?: number
  started_at?:      string
  ended_at?:        string
  created_at:       string
}

export interface TranscriptEntry {
  role:      'ai' | 'user'
  content:   string
  timestamp: number
}

export interface QuestionFeedback {
  question:    string
  topic:       string
  score:       number
  feedback:    string
  improvement: string
}

export interface FeedbackReport {
  overall_score:        number
  technical_score:      number
  communication_score:  number
  examples_score:       number
  structure_score:      number
  strengths:            string[]
  improvements:         string[]
  questions:            QuestionFeedback[]
  recommended_focus:    string
}

export interface SetupState {
  role:             string
  level:            Level
  focus:            Focus
  duration_minutes: number
  job_description:  string
  interview_id?:    string
  questions?:       Question[]
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    accessToken:       string
    sessionsRemaining: number
    user: {
      id:    string
      name:  string
      email: string
    }
  }
}
