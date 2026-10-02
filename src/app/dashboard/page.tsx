import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Mic, Clock, BarChart3, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">
          Career<span className="text-brand-500">Mind</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {session.sessionsRemaining} session{session.sessionsRemaining !== 1 ? 's' : ''} remaining
          </span>
          <Link href="/buy-sessions" className="btn-secondary text-xs py-1.5 px-3">Buy more</Link>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Good to see you, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Ready to practice?</p>
        </div>

        {/* Sessions banner */}
        <div className={`rounded-xl p-5 mb-8 flex items-center justify-between
          ${session.sessionsRemaining > 0 ? 'bg-brand-50 border border-brand-100' : 'bg-amber-50 border border-amber-100'}`}>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {session.sessionsRemaining > 0
                ? `${session.sessionsRemaining} session${session.sessionsRemaining !== 1 ? 's' : ''} available`
                : 'No sessions remaining'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {session.sessionsRemaining > 0
                ? 'Each session is 15 minutes of live voice AI'
                : 'Buy more sessions to continue practising'}
            </p>
          </div>
          {session.sessionsRemaining > 0 ? (
            <Link href="/setup" className="btn-primary flex items-center gap-2">
              Start interview <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href="/buy-sessions" className="btn-brand flex items-center gap-2">
              Buy sessions <Plus className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Link href="/setup" className="card hover:border-brand-200 transition-colors group">
            <Mic className="w-5 h-5 text-brand-500 mb-3" />
            <div className="text-sm font-medium text-gray-900 mb-1">New interview</div>
            <div className="text-xs text-gray-400">Set up and start practising</div>
          </Link>
          <Link href="/buy-sessions" className="card hover:border-gray-200 transition-colors">
            <Plus className="w-5 h-5 text-gray-400 mb-3" />
            <div className="text-sm font-medium text-gray-900 mb-1">Buy sessions</div>
            <div className="text-xs text-gray-400">From £2.99 per session</div>
          </Link>
          <div className="card opacity-60">
            <BarChart3 className="w-5 h-5 text-gray-400 mb-3" />
            <div className="text-sm font-medium text-gray-900 mb-1">Progress</div>
            <div className="text-xs text-gray-400">Track improvement over time</div>
          </div>
        </div>

        {/* Recent sessions — placeholder until wired */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Recent sessions</h2>
          <div className="card text-center py-10">
            <Clock className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No sessions yet</p>
            <p className="text-xs text-gray-300 mt-1">Your interview history will appear here</p>
            <Link href="/setup" className="btn-primary inline-flex items-center gap-2 mt-4">
              Start your first interview <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
