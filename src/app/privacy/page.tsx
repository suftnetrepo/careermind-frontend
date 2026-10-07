import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 2026"
      sections={[
        {
          title: 'Who we are',
          content:
            'Interquis is operated by Suftnet Ltd, a company registered in England and Wales. ' +
            'Suftnet Ltd is the controller of your personal data. Contact: info@suftnet.com',
        },
        {
          title: 'What data we collect',
          content:
            'We collect your name, email address and password (stored only as a secure hash) when you register. ' +
            'During interviews, your voice audio is processed to run the interview and a transcript is created. ' +
            'If you upload a CV, we extract and store its text. We also store your interview setup, transcripts, ' +
            'scores, feedback reports and study materials. If you pay for an interview, Stripe processes your ' +
            'payment — we never see or store your card details.',
        },
        {
          title: 'How we use your data',
          content:
            'Your data is used solely to provide the Interquis service — generating interview questions, ' +
            'conducting voice interviews, producing feedback and study materials, sending account emails such as ' +
            'email confirmation, and keeping the service secure and working. We do not sell your data or use it ' +
            'to train AI models. Authorised Suftnet staff may review interview scores and feedback summaries for ' +
            'quality assurance and product improvement. Staff cannot access interview transcripts, voice ' +
            'recordings or CV content.',
        },
        {
          title: 'Voice and CV data',
          content:
            'Voice audio is processed in real time by OpenAI and is not stored by Interquis. ' +
            'OpenAI may retain data sent through its API for a limited period for abuse monitoring and ' +
            'does not use it to train its models. Interview transcripts are stored securely and deleted ' +
            'after 12 months. CV text is stored with the interview it was uploaded for and cleared after ' +
            '12 months.',
        },
        {
          title: 'Data retention',
          content:
            'Transcripts, CV text and study materials (quiz and flashcards) are deleted after 12 months. ' +
            'Interview scores and feedback summaries are kept for the lifetime of your account so you can ' +
            'track your progress over time. To delete your account and all data immediately, use the ' +
            'Delete account option in your dashboard or email info@suftnet.com.',
        },
        {
          title: 'Third parties',
          content:
            'We share data only with the providers needed to run Interquis, and only what each one needs: ' +
            'OpenAI (interview questions, voice interviews, feedback), Stripe (payments), Neon (database hosting), ' +
            'Render (application hosting), Brevo (account emails) and Sentry (error monitoring, with interview ' +
            'content removed from error reports).',
        },
        {
          title: 'International transfers',
          content:
            'Some of these providers process data outside the UK, including in the United States. Where they do, ' +
            'the transfer is protected by safeguards recognised under UK GDPR, such as the UK International Data ' +
            'Transfer Addendum or the UK-US data bridge.',
        },
        {
          title: 'Your rights',
          content:
            'Under UK GDPR you have the right to access, correct or delete your personal data, to object to or ' +
            'restrict how it is used, and to receive a copy of it. To exercise these rights, contact ' +
            'info@suftnet.com. You can also complain to the Information Commissioner’s Office (ico.org.uk).',
        },
        {
          title: 'Cookies',
          content:
            'We use only essential cookies required for signing in. We do not use tracking or advertising cookies.',
        },
      ]}
    />
  )
}
