import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import AdminPanel from '@/components/admin/AdminPanel'

// Checked on the server so non-admins never see the panel, not even briefly.
// The admin API enforces the same rule on every request.
export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const me = await api.auth.me(session.accessToken).catch(() => null)
  if (!me?.is_admin) redirect('/dashboard')
  return <AdminPanel />
}
