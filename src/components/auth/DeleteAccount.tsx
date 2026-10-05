'use client'
import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { api } from '@/lib/api'

const CONFIRM_WORD = 'DELETE'

// "Delete account" link + confirmation modal for the bottom of the dashboard
export default function DeleteAccount() {
  const { data: session } = useSession()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function closeModal() {
    if (deleting) return
    setShowDeleteModal(false)
    setDeleteConfirm('')
    setDeleteError('')
  }

  useEffect(() => {
    if (!showDeleteModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showDeleteModal, deleting])

  async function handleDeleteAccount() {
    if (deleteConfirm !== CONFIRM_WORD || !session?.accessToken) return
    setDeleting(true)
    setDeleteError('')
    try {
      // Throws on any non-2xx, so a failed delete never signs the user out
      await api.auth.deleteAccount(session.accessToken)
      await signOut({ callbackUrl: '/' })
    } catch {
      setDeleteError('Failed to delete account. Please try again or contact info@suftnet.com')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="mt-8 border-t border-gray-100 py-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-gray-300 transition-colors hover:text-red-400">
          Delete account
        </button>
      </div>

      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title"
               className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8">
            <h2 id="delete-account-title" className="mb-2 text-base font-medium text-gray-900">
              Delete your account
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              This permanently deletes your account, all interviews, transcripts and study
              materials. This cannot be undone.
            </p>
            <label htmlFor="delete-confirm" className="mb-2 block text-xs text-gray-400">
              Type {CONFIRM_WORD} to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              autoFocus
              className="input mb-4 w-full"
            />
            {deleteError && <p className="mb-3 text-xs text-red-500">{deleteError}</p>}
            <div className="flex gap-3">
              <button onClick={closeModal} disabled={deleting} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== CONFIRM_WORD || deleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40">
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
