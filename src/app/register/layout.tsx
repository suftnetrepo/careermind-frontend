import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your free account',
  description: 'Sign up for Interquis and practise your first interview free: tailored questions, live voice AI coaching and feedback. No card needed.',
  alternates: { canonical: '/register' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
