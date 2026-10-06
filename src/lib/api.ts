import type {
  AdminInterview, AdminInterviewDetail, AdminOverview, AdminRevenue, AdminUser, CheckReady, CoachingNote, FeedbackReport,
  InterviewSession, Paged, StudyMaterials, StudyModel, User,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers })
  // A rejected login token in the browser (account suspended, secret changed,
  // refresh failed) — sign out rather than leave a page where every call fails
  if (res.status === 401 && token && typeof window !== 'undefined') {
    import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/login' }))
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Plain reachability check — no auth, never throws
  health: () =>
    fetch(`${API_URL}/health`, { cache: 'no-store' }).then(r => r.ok).catch(() => false),

  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    me: (token: string) =>
      request<User>('/api/v1/auth/me', { token }),

    // No login needed — the link from the email may be opened on another device
    verifyEmail: (verificationToken: string) =>
      request<{ verified: boolean; email: string }>('/api/v1/auth/verify-email', {
        method: 'POST', body: JSON.stringify({ token: verificationToken }),
      }),

    // Permanently deletes the account and all its interviews
    deleteAccount: (token: string) =>
      request<{ deleted: boolean }>('/api/v1/auth/account', { method: 'DELETE', token }),

    resendVerification: (token: string) =>
      request<{ sent: boolean; already_verified: boolean }>('/api/v1/auth/resend-verification', {
        method: 'POST', token,
      }),
  },

  admin: {
    overview: (token: string) =>
      request<AdminOverview>('/api/v1/admin/overview', { token }),

    users: (token: string, page = 1) =>
      request<Paged & { users: AdminUser[] }>(`/api/v1/admin/users?page=${page}`, { token }),

    interviews: (token: string, page = 1) =>
      request<Paged & { interviews: AdminInterview[] }>(`/api/v1/admin/interviews?page=${page}`, { token }),

    revenue: (token: string) =>
      request<AdminRevenue>('/api/v1/admin/revenue', { token }),

    interviewDetail: (token: string, interview_id: string) =>
      request<AdminInterviewDetail>(`/api/v1/admin/interviews/${interview_id}`, { token }),
  },

  sessions: {
    checkout: (token: string, data: {
      interview_id: string;
      duration_minutes: number;
      consent: boolean      // agreed to immediate start / no 14-day cancellation
    }) =>
      request<{ checkout_url: string; amount_pence: number; amount_display: string }>(
        '/api/v1/sessions/checkout',
        { method: 'POST', token, body: JSON.stringify(data) }
      ),

    pricing: () =>
      request('/api/v1/sessions/pricing'),
  },

  interviews: {
    setup: (token: string, data: {
      role: string; level: string; focus: string;
      duration_minutes?: number; job_description?: string; voice?: string
      cv_text?: string; custom_prompt?: string; preset_prompts?: string[]
    }) =>
      request('/api/v1/interviews/setup', {
        method: 'POST', token, body: JSON.stringify(data)
      }),

    checkReady: (token: string, interview_id: string) =>
      request<CheckReady>(`/api/v1/interviews/${interview_id}/check-ready`, { token }),

    start: (token: string, interview_id: string) =>
      request('/api/v1/interviews/start', {
        method: 'POST', token, body: JSON.stringify({ interview_id })
      }),

    end: (token: string, data: {
      interview_id: string; transcript_json?: string; duration_seconds?: number
    }) =>
      request('/api/v1/interviews/end', {
        method: 'POST', token, body: JSON.stringify(data)
      }),

    realtimeToken: (token: string, interview_id: string) =>
      request<{ client_secret: string; session_id: string }>(
        `/api/v1/interviews/realtime-token?interview_id=${interview_id}`,
        { method: 'POST', token }
      ),

    coaching: (
      token: string,
      interview_id: string,
      question: string,
      answer: string,
      role: string,
      last_tag?: string,
    ) =>
      request<Omit<CoachingNote, 'id' | 'question'>>(
        `/api/v1/interviews/coaching?interview_id=${interview_id}`,
        {
          method: 'POST',
          token,
          body: JSON.stringify({ question, answer, role, last_tag }),
        }
      ),

    // Multipart upload — request() forces a JSON content type, so this uses fetch directly
    uploadCv: async (token: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/api/v1/interviews/upload-cv`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(error.detail || 'Upload failed')
      }
      return res.json() as Promise<{ cv_text: string; pages: number; words: number }>
    },

    generateStudyMaterials: (token: string, interview_id: string, model: StudyModel = 'gpt-4o') =>
      request<StudyMaterials>(
        `/api/v1/interviews/${interview_id}/study-materials`,
        { method: 'POST', token, body: JSON.stringify({ model }) }
      ),

    // quiz/flashcards are null until generated
    getStudyMaterials: (token: string, interview_id: string) =>
      request<{ quiz: StudyMaterials['quiz'] | null; flashcards: StudyMaterials['flashcards'] | null; cached: boolean; model?: StudyModel | null }>(
        `/api/v1/interviews/${interview_id}/study-materials`,
        { token }
      ),

    getFeedbackStatus: (token: string, interview_id: string) =>
      // retrying: the backend lost the first job (e.g. a deploy) and started another
      request<{ ready: boolean; score: number | null; feedback: FeedbackReport | null; retrying: boolean }>(
        `/api/v1/interviews/${interview_id}/feedback-status`,
        { token }
      ),

    get: (token: string, id: string) =>
      request<InterviewSession>(`/api/v1/interviews/${id}`, { token }),

    history: (token: string) =>
      request('/api/v1/interviews/history', { token }),
  },
}
