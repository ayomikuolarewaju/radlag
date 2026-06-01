// app/lib/membershipAuth.ts
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import { MemberProfile } from '@/types/membership'

export class MembershipAuth {
  
  // Verify member credentials and status
  static async verifyMember(email: string, password: string): Promise<{
    success: boolean
    member?: MemberProfile
    error?: string
    status?: string
  }> {
    try {
      // First, check if member exists in our members table
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (memberError || !member) {
        await this.logLoginAttempt(email, false, 'Member not found')
        return { success: false, error: 'Member not found. Please ensure you are a registered RADLAG alumni.' }
      }

      // Check membership status
      const statusCheck = await this.checkMembershipStatus(member)
      if (!statusCheck.isValid) {
        await this.logLoginAttempt(email, false, statusCheck.message)
        return { 
          success: false, 
          error: statusCheck.message,
          status: member.membership_status
        }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, member.password_hash)
      
      if (!isValidPassword) {
        // Increment failed login attempts
        await this.incrementLoginAttempts(member.id)
        await this.logLoginAttempt(email, false, 'Invalid password')
        
        // Check if account should be locked
        if (member.login_attempts + 1 >= 5) {
          await this.lockAccount(member.id)
          return { success: false, error: 'Too many failed attempts. Account locked for 30 minutes.' }
        }
        
        return { success: false, error: 'Invalid credentials' }
      }

      // Successful login - reset attempts and update last login
      await this.resetLoginAttempts(member.id)
      await this.updateLastLogin(member.id)
      await this.logLoginAttempt(email, true, 'Successful login')
      await this.logActivity(member.id, 'login', 'Member logged in successfully')

      // Remove password hash from returned object
      const { password_hash, ...memberWithoutPassword } = member
      
      return { success: true, member: memberWithoutPassword as MemberProfile }

    } catch (error) {
      console.error('Verification error:', error)
      return { success: false, error: 'An error occurred during verification' }
    }
  }

  // Check membership status
  static async checkMembershipStatus(member: any): Promise<{
    isValid: boolean
    message: string
  }> {
    if (member.membership_status === 'pending') {
      return { 
        isValid: false, 
        message: 'Your membership is pending verification by the admin. You will be notified once verified.' 
      }
    }
    
    if (member.membership_status === 'suspended') {
      return { 
        isValid: false, 
        message: 'Your membership has been suspended. Please contact the association admin for assistance.' 
      }
    }
    
    if (member.membership_status === 'expired') {
      return { 
        isValid: false, 
        message: 'Your membership has expired. Please pay your yearly dues to reactivate your account.' 
      }
    }
    
    // Check if dues are paid for current year
    const currentYear = new Date().getFullYear()
    if (!member.last_payment_date || new Date(member.last_payment_date).getFullYear() < currentYear) {
      return { 
        isValid: false, 
        message: 'Your yearly dues for the current year are pending. Please make your payment to continue accessing the platform.' 
      }
    }
    
    return { isValid: true, message: 'Membership active' }
  }

  // Increment failed login attempts
  static async incrementLoginAttempts(memberId: string) {
    await supabase
      .from('members')
      .update({ 
        login_attempts: supabase.rpc('increment', { row_id: memberId }),
        updated_at: new Date()
      })
      .eq('id', memberId)
  }

  // Reset login attempts
  static async resetLoginAttempts(memberId: string) {
    await supabase
      .from('members')
      .update({ login_attempts: 0, locked_until: null })
      .eq('id', memberId)
  }

  // Lock account after too many attempts
  static async lockAccount(memberId: string) {
    const lockUntil = new Date()
    lockUntil.setMinutes(lockUntil.getMinutes() + 30) // Lock for 30 minutes
    
    await supabase
      .from('members')
      .update({ locked_until: lockUntil })
      .eq('id', memberId)
  }

  // Update last login timestamp
  static async updateLastLogin(memberId: string) {
    await supabase
      .from('members')
      .update({ last_login_at: new Date() })
      .eq('id', memberId)
  }

  // Log login attempts
  static async logLoginAttempt(email: string, success: boolean, reason?: string) {
    const ipAddress = await this.getClientIP()
    
    await supabase
      .from('login_attempts')
      .insert({
        email: email.toLowerCase(),
        success,
        ip_address: ipAddress,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
        attempted_at: new Date()
      })
  }

  // Log member activity
  static async logActivity(memberId: string, type: string, description: string) {
    const ipAddress = await this.getClientIP()
    
    await supabase
      .from('member_activities')
      .insert({
        member_id: memberId,
        activity_type: type,
        description,
        ip_address: ipAddress,
        created_at: new Date()
      })
  }

  // Get client IP (you'll need to implement this based on your hosting)
  static async getClientIP(): Promise<string> {
    // For Next.js, you can get IP from headers
    // This is a placeholder - implement based on your setup
    return '0.0.0.0'
  }

  // Create session token
  static async createSession(memberId: string): Promise<string> {
    const sessionToken = require('crypto').randomBytes(64).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Session expires in 7 days
    
    await supabase
      .from('member_sessions')
      .insert({
        member_id: memberId,
        session_token: sessionToken,
        expires_at: expiresAt,
        ip_address: await this.getClientIP(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server'
      })
    
    return sessionToken
  }

  // Validate session token
  static async validateSession(sessionToken: string): Promise<boolean> {
    const { data: session, error } = await supabase
      .from('member_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single()
    
    if (error || !session) return false
    
    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      await this.deleteSession(sessionToken)
      return false
    }
    
    // Check member status
    const { data: member } = await supabase
      .from('members')
      .select('membership_status')
      .eq('id', session.member_id)
      .single()
    
    if (!member || member.membership_status !== 'active') return false
    
    return true
  }

  // Delete session (logout)
  static async deleteSession(sessionToken: string) {
    await supabase
      .from('member_sessions')
      .delete()
      .eq('session_token', sessionToken)
  }
}