export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://interquis.com').replace(/\/$/, '')
export const SITE_NAME = 'Interquis'
export const SITE_TITLE = 'Interquis — AI Interview Coach & Mock Interview Practice'
export const SITE_DESCRIPTION =
  'Practise job interviews with a realistic voice AI. Interquis creates tailored mock interview questions for any role or job description, coaches you live and scores your answers. First interview free.'

// Rendered on the landing page and mirrored into FAQPage JSON-LD (Google requires the markup to match visible content)
export const FAQS = [
  {
    q: 'What is Interquis?',
    a: 'Interquis is an AI interview coach. It generates interview questions tailored to your role or a job description you paste in, then runs a live voice interview with follow-up questions and gives you feedback and scoring afterwards.',
  },
  {
    q: 'Is Interquis free to try?',
    a: 'Yes. Your first interview is free: 10 minutes, no card needed.',
  },
  {
    q: 'How much does an interview cost?',
    a: 'You pay once per session, with no subscription and no expiry. Sessions are 15 minutes (£4.99), 30 minutes (£8.99), 45 minutes (£13.99) or 60 minutes (£19.99).',
  },
  {
    q: 'Can I practise for a specific job?',
    a: 'Yes. Paste the job description and Interquis turns its requirements into realistic, relevant questions. You can also simply pick a role.',
  },
  {
    q: 'What kinds of interview questions will I get?',
    a: 'Behavioural, leadership and role-specific questions based on your role, experience and seniority, rather than generic scripts.',
  },
  {
    q: 'What feedback do I get?',
    a: 'Live coaching during the interview, then scores and practical next steps you can use before the real thing.',
  },
]

export function landingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: 'Suftnet Ltd',
        url: SITE_URL,
        logo: `${SITE_URL}/interquis-logo.png`,
        email: 'info@suftnet.com',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-GB',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'GBP',
          lowPrice: '4.99',
          highPrice: '19.99',
          offerCount: 4,
        },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }
}
