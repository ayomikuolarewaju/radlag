'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  email: string
  full_name: string
  membership_number: string
  graduation_year: number
  graduation_set: string
  phone_number: string
  occupation: string
  location: string
  birthday: string
  avatar_url: string
  membership_status: 'active' | 'pending' | 'suspended'
}

interface MembershipAuthContextType {
  member: Member | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const MembershipAuthContext = createContext<MembershipAuthContextType | undefined>(undefined)

export function MembershipAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchMemberProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchMemberProfile(session.user.id)
      } else {
        setMember(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchMemberProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      await supabase.auth.signOut()
      setMember(null)
    } else if (data.membership_status !== 'active') {
      await supabase.auth.signOut()
      setMember(null)
      throw new Error('Your membership is pending verification. Please contact RADLAG admin.')
    } else {
      setMember(data)
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Verify member exists and is active
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (memberError || !memberData) {
      await supabase.auth.signOut()
      throw new Error('You are not a registered RADLAG member.')
    }

    if (memberData.membership_status !== 'active') {
      await supabase.auth.signOut()
      throw new Error('Your membership is pending verification. Contact RADLAG admin.')
    }

    setMember(memberData)
    router.push('/')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setMember(null)
    router.push('/login')
  }

  return (
    <MembershipAuthContext.Provider value={{ member, loading, login, logout }}>
      {children}
    </MembershipAuthContext.Provider>
  )
}

export function useMembershipAuth() {
  const context = useContext(MembershipAuthContext)
  if (!context) throw new Error('useMembershipAuth must be used within MembershipAuthProvider')
  return context
}
