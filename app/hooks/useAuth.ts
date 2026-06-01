// app/hooks/useAuth.ts - Create a wrapper that uses MembershipAuthContext
// This file will help transition from old AuthContext to new MembershipAuthContext
'use client'

import { useMembershipAuth } from '@/contexts/MembershipAuthContext'

// Re-export useMembershipAuth as useAuth for backward compatibility
export const useAuth = useMembershipAuth