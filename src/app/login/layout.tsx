import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Interquis to continue practising interviews with your AI interview coach.',
  alternates: { canonical: '/login' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
