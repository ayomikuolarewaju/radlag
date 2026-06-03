'use client'
// contexts/MembershipAuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MemberProfile } from '@/types/membership'
import toast from 'react-hot-toast'

interface MembershipAuthContextType {
  member: MemberProfile | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const MembershipAuthContext = createContext<MembershipAuthContextType | undefined>(undefined)

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

export function MembershipAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember]   = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Restore session on mount from cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = getCookie('radlag_session_token')
        if (!token) return

        const { data: session } = await supabase
          .from('member_sessions')
          .select('member_id, expires_at')
          .eq('session_token', token)
          .single()

        if (!session || new Date(session.expires_at) < new Date()) {
          deleteCookie('radlag_session_token')
          return
        }

        const { data, error } = await supabase
          .from('members')
          .select('id, email, full_name, membership_number, graduation_year, graduation_set, phone_number, address, occupation, birthday, location, membership_status, membership_verified_at, verified_by, last_payment_date, created_at, updated_at')
          .eq('id', session.member_id)
          .eq('membership_status', 'active')
          .single()

        if (error || !data) {
          deleteCookie('radlag_session_token')
          return
        }

        setMember(data as MemberProfile)
      } catch (err) {
        console.error('Session restore error:', err)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      // Guard: if response is HTML, the route is missing or crashed
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        toast.error(
          'Server error. Check that app/api/auth/login/route.ts exists and SUPABASE_SERVICE_ROLE_KEY is set in .env.local'
        )
        return
      }

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      setCookie('radlag_session_token', data.sessionToken, 7)
      setMember(data.member as MemberProfile)
      toast.success(`E kaabo, ${data.member.full_name}!`)

      // Admin lands on /admin, members land on /
      const destination = data.member.membership_number === 'ADMIN001' ? '/admin' : '/'
      router.push(destination)
      router.refresh()

    } catch (err) {
      console.error('Login error:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = getCookie('radlag_session_token')
      if (token) {
        await supabase.from('member_sessions').delete().eq('session_token', token)
      }
      deleteCookie('radlag_session_token')
      setMember(null)
      toast.success('O dabo! Logged out successfully.')
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <MembershipAuthContext.Provider value={{
      member,
      loading,
      isAuthenticated: !!member,
      login,
      logout,
    }}>
      {children}
    </MembershipAuthContext.Provider>
  )
}

export function useMembershipAuth() {
  const context = useContext(MembershipAuthContext)
  if (!context) throw new Error('useMembershipAuth must be used within MembershipAuthProvider')
  return context
}
