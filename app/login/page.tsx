'use client'
// app/login/page.tsx

import { useState } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useMembershipAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [isAdmin, setIsAdmin]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isAdmin
              ? 'bg-gradient-to-r from-gray-700 to-gray-900'
              : 'bg-gradient-to-r from-amber-600 to-orange-600'
          }`}>
            {isAdmin
              ? <ShieldCheckIcon className="h-10 w-10 text-amber-400" />
              : <span className="text-3xl text-white font-bold">R</span>
            }
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isAdmin ? 'Admin Login' : 'RADLAG Member Login'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          {isAdmin
            ? 'Restricted to RADLAG administrators only'
            : 'Wọlé — Only verified RADLAG alumni can access this portal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Toggle tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => { setIsAdmin(false); setEmail(''); setPassword('') }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              !isAdmin
                ? 'bg-amber-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Member Login
          </button>
          <button
            type="button"
            onClick={() => { setIsAdmin(true); setEmail('admin@radlag.org'); setPassword('') }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              isAdmin
                ? 'bg-gray-800 text-amber-400'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Admin Login
          </button>
        </div>

        <div className={`bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          isAdmin ? 'border-t-4 border-gray-800' : 'border-t-4 border-amber-500'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAdmin ? 'admin@radlag.org' : 'member@radlag.org'}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-600 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password — Ọ̀rọ̀ Àṣírí
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-amber-600 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded-md px-3 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-colors ${
                isAdmin
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Verifying...
                </span>
              ) : (
                isAdmin ? 'Sign in as Admin' : 'Sign in — Wọlé'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isAdmin ? (
              <>
                Not an admin?{' '}
                <button
                  onClick={() => { setIsAdmin(false); setEmail(''); setPassword('') }}
                  className="font-semibold text-amber-600 hover:text-amber-500"
                >
                  Member login
                </button>
              </>
            ) : (
              <>
                Not registered?{' '}
                <a href="mailto:admin@radlag.org" className="font-semibold text-amber-600 hover:text-amber-500">
                  Contact RADLAG Admin
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
