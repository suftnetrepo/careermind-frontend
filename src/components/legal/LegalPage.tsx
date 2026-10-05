import Link from 'next/link'
import Header from '@/components/layout/Header'

export interface LegalSection {
  title:   string
  content: string
}

// Shared layout for /privacy and /terms
export default function LegalPage({ title, updated, sections }: {
  title:    string
  updated:  string
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>
        {sections.map(section => (
          <section key={section.title} className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </section>
        ))}
        <p className="text-sm text-gray-400 border-t border-gray-100 pt-6">
          Questions? Email <a href="mailto:info@suftnet.com" className="text-indigo-500 hover:underline">info@suftnet.com</a>
          {' · '}<Link href="/" className="text-indigo-500 hover:underline">Back to CareerMind</Link>
        </p>
      </main>
    </div>
  )
}
