import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set up your interview',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
