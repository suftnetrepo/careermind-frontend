import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  SITE_TITLE,
    template: '%s | Interquis',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'AI interview coach', 'mock interview', 'interview practice', 'interview preparation',
    'practice job interview online', 'AI mock interview', 'interview questions', 'voice AI interview',
    'behavioural interview practice', 'job interview tips',
  ],
  openGraph: {
    type:        'website',
    url:         SITE_URL,
    siteName:    SITE_NAME,
    locale:      'en_GB',
    title:       SITE_TITLE,
    description: 'Practice interviews with a real voice AI. Personalised questions, live coaching, instant feedback.',
  },
  twitter: {
    card:        'summary_large_image',
    title:       SITE_TITLE,
    description: 'Practice interviews with a real voice AI. Personalised questions, live coaching, instant feedback.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon:  '/favicon.png',
    apple: '/interquis-logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
