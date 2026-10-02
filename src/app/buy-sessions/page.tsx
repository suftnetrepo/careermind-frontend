import { redirect } from 'next/navigation'

// Session packs were replaced by pay-per-minute billing at interview setup
export default function BuySessionsPage() {
  redirect('/setup')
}
