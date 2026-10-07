import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default:  'Interquis — AI Interview Coach',
    template: '%s | Interquis',
  },
  description: 'Interquis generates tailored interview questions for any role, then coaches you live with a real voice AI.',
  openGraph: {
    title:       'Interquis — AI Interview Coach',
    description: 'Practice interviews with a real voice AI. Personalised questions, live coaching, instant feedback.',
    siteName:    'Interquis',
  },
  icons: {
    icon:  '/favicon.png',
    apple: '/interquis-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
