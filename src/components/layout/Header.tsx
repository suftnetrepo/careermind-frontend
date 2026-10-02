'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

interface HeaderProps {
  rightContent?: React.ReactNode
}

// Client-side so server pages (dashboard, feedback) can render a sign-out control
export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm text-gray-400 hover:text-gray-600">
      Sign out
    </button>
  )
}

export default function Header({ rightContent }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="border-b border-gray-100 bg-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/"
              className="text-base font-medium text-gray-900">
          Career
          <span className="text-indigo-500">
            Mind
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {rightContent ?? (
            session ? (
              <>
                <span className="text-sm text-gray-400">
                  {session.user.name?.split(' ')[0]}
                </span>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login"
                      className="text-sm text-gray-500 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/register"
                      className="btn-primary text-sm py-2 px-4">
                  Get started free
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
