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
  voice:            string
  questions:        Question[]
  status:           InterviewStatus
  paid:                  boolean
  is_free:               boolean
  amount_pence?:         number
  stripe_session_id?:    string
  overall_score?:   number
  feedback?:        FeedbackReport
  transcript?:      TranscriptEntry[]
  duration_seconds?: number
  coaching_notes?:  CoachingNote[]
  started_at?:      string
  ended_at?:        string
  created_at:       string
}

export interface User {
  id:                 string
  name:               string
  email:              string
  has_free_interview: boolean
  free_minutes:       number
  email_verified:     boolean
  is_admin:           boolean
  created_at:         string | null
}

export interface AdminOverview {
  users: {
    total:      number
    this_month: number
    last_month: number
  }
  interviews: {
    total:      number
    this_month: number
  }
  revenue: {
    this_month: number
    total:      number
  }
  avg_score:    number
  free_count:   number
  paid_count:   number
  popular_roles: {
    role:  string
    count: number
  }[]
}

export interface AdminUser {
  id:          string
  name:        string
  email:       string
  is_admin:    boolean
  created_at:  string
  interviews:  number
  avg_score:   number
  last_active: string | null
}

export interface AdminInterview {
  id:               string
  user_name:        string
  user_email:       string
  role:             string
  level:            string
  status:           string
  is_free:          boolean
  paid:             boolean
  amount_pence:     number | null
  overall_score:    number | null
  duration_seconds: number | null
  created_at:       string
}

export interface AdminRevenue {
  daily: { date: string; revenue: number; payments: number }[]
  tiers: { label: string; count: number }[]
}

export interface Paged {
  total: number
  page:  number
  pages: number
}

export interface CoachingNote {
  id:           string
  tag:          'positive' | 'tip' | 'pitfall'
  observation:  string
  coaching:     string
  try_instead?: string
  question:     string
}

export interface QuizQuestion {
  question:   string
  topic:      string
  difficulty: 'easy' | 'medium' | 'hard'
  options: {
    id:   string
    text: string
  }[]
  correct:     string
  explanation: string
}

export interface QuizAttempt {
  questionIndex: number
  selected:      string
  correct:       boolean
}

export interface Flashcard {
  front:  string
  back:   string
  topic:  string
  tip:    string
}

export interface StudyMaterials {
  quiz:       QuizQuestion[]
  flashcards: Flashcard[]
  cached:     boolean
}

export interface TranscriptEntry {
  role:      'ai' | 'user'
  content:   string
  timestamp: number
}

export interface QuestionFeedback {
  topic:       string
  covered:     boolean   // false when the interview never reached this question
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
  voice:            string
  job_description:  string
  cv_text:          string
  custom_prompt:    string
  preset_prompts:   string[]
  interview_id?:    string
  questions?:       Question[]
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    accessToken:      string
    hasFreeInterview: boolean
    error?:           string   // 'RefreshTokenError' when the backend login can't be renewed
    user: {
      id:    string
      name:  string
      email: string
    }
  }
}
