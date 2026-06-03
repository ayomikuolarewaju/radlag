// types/membership.ts

export interface MemberProfile {
  id: string
  email: string
  full_name: string
  membership_number: string
  graduation_year: number
  graduation_set: string
  phone_number: string
  address: string
  occupation: string
  birthday: string
  location: string
  membership_status: 'pending' | 'active' | 'suspended' | 'expired'
  membership_verified_at: string | null
  verified_by: string | null
  last_payment_date: string | null
  created_at: string
  updated_at: string
}

export interface MembershipVerification {
  id: string
  member_id: string
  verified_by: string
  verification_method: 'manual' | 'automatic' | 'admin'
  notes: string
  verified_at: string
}

export interface LoginAttempt {
  id: string
  email: string
  success: boolean
  ip_address: string
  user_agent: string
  attempted_at: string
}
