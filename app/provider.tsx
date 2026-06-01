'use client'

import { MembershipAuthProvider } from '@/contexts/MembershipAuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MembershipAuthProvider>
      {children}
    </MembershipAuthProvider>
  )
}
