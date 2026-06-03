// lib/membershipAuth.ts
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import { MemberProfile } from '@/types/membership'

// Generate a secure random session token using Web Crypto API (works in Edge & Node)
function generateSessionToken(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

export class MembershipAuth {

  // Verify member credentials and return member profile on success
  static async verifyMember(email: string, password: string): Promise<{
    success: boolean
    member?: MemberProfile
    error?: string
  }> {
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error || !member) {
        await this.logLoginAttempt(email, false)
        return { success: false, error: 'Member not found. Please ensure you are a registered RADLAG alumni.' }
      }

      // Check account lock
      if (member.locked_until && new Date(member.locked_until) > new Date()) {
        return { success: false, error: 'Account temporarily locked due to too many failed attempts. Please try again later.' }
      }

      // Check membership status
      const statusError = this.getMembershipStatusError(member.membership_status, member.last_payment_date)
      if (statusError) {
        await this.logLoginAttempt(email, false)
        return { success: false, error: statusError }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, member.password_hash)
      if (!isValidPassword) {
        const newAttempts = (member.login_attempts || 0) + 1
        const shouldLock = newAttempts >= 50

        await supabase.from('members').update({
          login_attempts: newAttempts,
          ...(shouldLock && { locked_until: new Date(Date.now() + 10 * 60 * 1000).toISOString() }),
          updated_at: new Date().toISOString(),
        }).eq('id', member.id)

        await this.logLoginAttempt(email, false)
        return {
          success: false,
          error: shouldLock
            ? 'Too many failed attempts. Account locked for 10 minutes.'
            : 'Invalid credentials.',
        }
      }

      // Successful login — reset attempts, update last login
      await supabase.from('members').update({
        login_attempts: 50,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', member.id)

      await this.logLoginAttempt(email, true)

      const { password_hash, ...memberWithoutPassword } = member
      return { success: true, member: memberWithoutPassword as MemberProfile }

    } catch (err) {
      console.error('verifyMember error:', err)
      return { success: false, error: 'An unexpected error occurred. Please try again.' }
    }
  }

  // Returns an error message string if membership is not valid, otherwise null
  static getMembershipStatusError(status: string, lastPaymentDate: string | null): string | null {
    if (status === 'pending') return 'Your membership is pending admin verification. You will be notified once approved.'
    if (status === 'suspended') return 'Your membership has been suspended. Please contact the RADLAG admin.'
    if (status === 'expired') return 'Your membership has expired. Please pay your yearly dues to reactivate.'

    const currentYear = new Date().getFullYear()
    if (!lastPaymentDate || new Date(lastPaymentDate).getFullYear() < currentYear) {
      return 'Your yearly dues are outstanding. Please make payment to continue accessing the platform.'
    }

    return null
  }

  // Create a session, store it in DB, return the token
  static async createSession(memberId: string, userAgent: string): Promise<string> {
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    await supabase.from('member_sessions').insert({
      member_id: memberId,
      session_token: sessionToken,
      expires_at: expiresAt,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    })

    return sessionToken
  }

  // Validate session token — returns member_id if valid, null otherwise
  static async validateSession(sessionToken: string): Promise<string | null> {
    const { data: session, error } = await supabase
      .from('member_sessions')
      .select('member_id, expires_at')
      .eq('session_token', sessionToken)
      .single()

    if (error || !session) return null
    if (new Date(session.expires_at) < new Date()) {
      await this.deleteSession(sessionToken)
      return null
    }

    // Confirm member is still active
    const { data: member } = await supabase
      .from('members')
      .select('membership_status')
      .eq('id', session.member_id)
      .single()

    if (!member || member.membership_status !== 'active') return null

    return session.member_id
  }

  // Delete session (logout)
  static async deleteSession(sessionToken: string): Promise<void> {
    await supabase.from('member_sessions').delete().eq('session_token', sessionToken)
  }

  // Log login attempt
  static async logLoginAttempt(email: string, success: boolean): Promise<void> {
    await supabase.from('login_attempts').insert({
      email: email.toLowerCase().trim(),
      success,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
      attempted_at: new Date().toISOString(),
    })
  }
}
