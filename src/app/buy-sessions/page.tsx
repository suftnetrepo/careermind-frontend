import { redirect } from 'next/navigation'

// Session packs were replaced by per-session billing at interview setup
export default function BuySessionsPage() {
  redirect('/setup')
}
