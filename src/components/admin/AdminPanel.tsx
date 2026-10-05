'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { AdminInterview, AdminOverview, AdminRevenue, AdminUser } from '@/types'

type Tab = 'overview' | 'users' | 'interviews' | 'revenue'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'users',      label: 'Users' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'revenue',    label: 'Revenue' },
]

function scoreColor(s: number | null) {
  if (!s) return 'text-gray-300'
  if (s >= 80) return 'text-green-600'
  if (s >= 60) return 'text-amber-500'
  return 'text-red-500'
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDuration(secs: number | null) {
  if (!secs) return '—'
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Previous</button>
      <span className="text-sm text-gray-400">Page {page} of {pages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
    </div>
  )
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>('overview')
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [interviews, setInterviews] = useState<AdminInterview[]>([])
  const [revenue, setRevenue] = useState<AdminRevenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usersPage, setUsersPage] = useState(1)
  const [usersPages, setUsersPages] = useState(1)
  const [intPage, setIntPage] = useState(1)
  const [intPages, setIntPages] = useState(1)

  // Reload whenever the tab or a page number changes — the page is a
  // dependency, so a click always loads the page it moved to
  useEffect(() => {
    const token = session?.accessToken
    if (!token) return
    let cancelled = false
    setLoading(true)
    setError('')
    const load = async () => {
      if (tab === 'overview') {
        const data = await api.admin.overview(token)
        if (!cancelled) setOverview(data)
      } else if (tab === 'users') {
        const data = await api.admin.users(token, usersPage)
        if (!cancelled) { setUsers(data.users); setUsersPages(data.pages) }
      } else if (tab === 'interviews') {
        const data = await api.admin.interviews(token, intPage)
        if (!cancelled) { setInterviews(data.interviews); setIntPages(data.pages) }
      } else {
        const data = await api.admin.revenue(token)
        if (!cancelled) setRevenue(data)
      }
    }
    load()
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [session?.accessToken, tab, usersPage, intPage])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-base font-medium text-gray-900">
              Career<span className="text-indigo-500">Mind</span>
            </Link>
            <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">Admin</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl gap-0 px-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-colors
                ${tab === t.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}

        {/* ── OVERVIEW ── */}
        {!loading && tab === 'overview' && overview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total users',     value: overview.users.total,
                  sub: `+${overview.users.this_month} this month · ${overview.users.last_month} last month`, color: 'text-indigo-600' },
                { label: 'Interviews done', value: overview.interviews.total,
                  sub: `${overview.interviews.this_month} this month`, color: 'text-green-600' },
                { label: 'Revenue total',   value: `£${overview.revenue.total.toFixed(2)}`,
                  sub: `£${overview.revenue.this_month.toFixed(2)} this month`, color: 'text-amber-600' },
                { label: 'Avg score',       value: `${overview.avg_score}`,
                  sub: '/100 across all interviews', color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="card">
                  <p className="mb-1 text-xs text-gray-400">{s.label}</p>
                  <p className={`mb-1 text-3xl font-medium ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="card">
                <p className="mb-4 text-sm font-medium text-gray-900">Free vs paid</p>
                <div className="space-y-3">
                  {[
                    { label: 'Free interviews', count: overview.free_count, color: 'bg-indigo-200' },
                    { label: 'Paid interviews', count: overview.paid_count, color: 'bg-green-400' },
                  ].map(item => {
                    const total = overview.free_count + overview.paid_count
                    const pct = total > 0 ? Math.round(item.count / total * 100) : 0
                    return (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-gray-400">{item.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="card">
                <p className="mb-4 text-sm font-medium text-gray-900">Top roles</p>
                {overview.popular_roles.length === 0 ? (
                  <p className="text-sm text-gray-400">No completed interviews yet</p>
                ) : (
                  <div className="space-y-2">
                    {overview.popular_roles.map((r, i) => (
                      <div key={r.role} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-xs text-gray-400">{i + 1}</span>
                          <span className="text-gray-700">{r.role}</span>
                        </div>
                        <span className="text-xs text-gray-400">{r.count} interview{r.count === 1 ? '' : 's'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {!loading && tab === 'users' && (
          <div>
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Joined', 'Interviews', 'Avg score', 'Last active'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {u.name}
                        {u.is_admin && (
                          <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-600">Admin</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{u.email}</td>
                      <td className="px-5 py-3 text-gray-400">{fmtDate(u.created_at)}</td>
                      <td className="px-5 py-3 text-gray-600">{u.interviews}</td>
                      <td className={`px-5 py-3 font-medium ${scoreColor(u.avg_score)}`}>
                        {u.avg_score > 0 ? `${u.avg_score}/100` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{fmtDate(u.last_active)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={usersPage} pages={usersPages} onChange={setUsersPage} />
          </div>
        )}

        {/* ── INTERVIEWS ── */}
        {!loading && tab === 'interviews' && (
          <div>
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['User', 'Role', 'Level', 'Score', 'Duration', 'Type', 'Date'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(i => (
                    <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{i.user_name}</p>
                        <p className="text-xs text-gray-400">{i.user_email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{i.role}</td>
                      <td className="px-5 py-3 capitalize text-gray-400">{i.level}</td>
                      <td className={`px-5 py-3 font-medium ${scoreColor(i.overall_score)}`}>
                        {i.overall_score ? `${i.overall_score}/100` : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{fmtDuration(i.duration_seconds)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs
                          ${i.is_free ? 'bg-blue-50 text-blue-600' : i.paid ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {i.is_free ? 'Free' : i.paid ? `£${((i.amount_pence || 0) / 100).toFixed(2)}` : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">{fmtDate(i.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={intPage} pages={intPages} onChange={setIntPage} />
          </div>
        )}

        {/* ── REVENUE ── */}
        {!loading && tab === 'revenue' && revenue && (
          <div className="space-y-6">
            <div className="card">
              <p className="mb-6 text-sm font-medium text-gray-900">Revenue — last 30 days</p>
              <div className="flex h-32 items-end gap-1">
                {revenue.daily.map((d, i) => {
                  const max = Math.max(...revenue.daily.map(x => x.revenue), 1)
                  const h = Math.round((d.revenue / max) * 100)
                  return (
                    <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
                      <div
                        className="relative w-full rounded-t-sm bg-indigo-200 transition-colors group-hover:bg-indigo-400"
                        style={{ height: `${Math.max(h, 2)}%` }}>
                        {d.revenue > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900
                                          px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            £{d.revenue.toFixed(2)} · {d.date}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-300">
                <span>{revenue.daily[0]?.date}</span>
                <span>{revenue.daily[revenue.daily.length - 1]?.date}</span>
              </div>
            </div>

            <div className="card">
              <p className="mb-4 text-sm font-medium text-gray-900">Sessions by duration</p>
              <div className="space-y-3">
                {revenue.tiers.map(t => {
                  const max = Math.max(...revenue.tiers.map(x => x.count), 1)
                  const pct = Math.round(t.count / max * 100)
                  return (
                    <div key={t.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-600">{t.label}</span>
                        <span className="text-gray-400">{t.count} session{t.count === 1 ? '' : 's'}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
