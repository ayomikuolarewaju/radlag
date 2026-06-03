// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Use service role key here so RLS doesn't block reads of password_hash
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSessionToken(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // 1. Fetch member by email
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found. Please ensure you are a registered RADLAG alumni.' }, { status: 401 })
    }

    // 2. Check account lock
    if (member.locked_until && new Date(member.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account temporarily locked due to too many failed attempts. Try again later.' }, { status: 403 })
    }

    // 3. Check membership status
    const statusError = getMembershipStatusError(member.membership_status, member.last_payment_date)
    if (statusError) {
      return NextResponse.json({ error: statusError }, { status: 403 })
    }

    // 4. Verify password with bcrypt (server-side only)
    const isValidPassword = await bcrypt.compare(password, member.password_hash)

    if (!isValidPassword) {
      const newAttempts = (member.login_attempts || 0) + 1
      const shouldLock  = newAttempts >= 5

      await supabase.from('members').update({
        login_attempts: newAttempts,
        ...(shouldLock && { locked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString() }),
        updated_at: new Date().toISOString(),
      }).eq('id', member.id)

      return NextResponse.json({
        error: shouldLock
          ? 'Too many failed attempts. Account locked for 30 minutes.'
          : 'Invalid credentials. Please check your email and password.',
      }, { status: 401 })
    }

    // 5. Create session
    const sessionToken = generateSessionToken()
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase.from('member_sessions').insert({
      member_id:     member.id,
      session_token: sessionToken,
      expires_at:    expiresAt,
      user_agent:    request.headers.get('user-agent') || '',
      created_at:    new Date().toISOString(),
    })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json({ error: 'Failed to create session. Please try again.' }, { status: 500 })
    }

    // 6. Reset login attempts + update last login
    await supabase.from('members').update({
      login_attempts: 0,
      locked_until:   null,
      last_login_at:  new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    }).eq('id', member.id)

    // 7. Return member (without password_hash) + token
    const { password_hash, ...memberWithoutPassword } = member

    return NextResponse.json({
      member: memberWithoutPassword,
      sessionToken,
    })

  } catch (err) {
    console.error('Login route error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}

function getMembershipStatusError(status: string, lastPaymentDate: string | null): string | null {
  if (status === 'pending')   return 'Your membership is pending admin verification. You will be notified once approved.'
  if (status === 'suspended') return 'Your membership has been suspended. Please contact the RADLAG admin.'
  if (status === 'expired')   return 'Your membership has expired. Please pay your yearly dues to reactivate.'

  const currentYear = new Date().getFullYear()
  if (!lastPaymentDate || new Date(lastPaymentDate).getFullYear() < currentYear) {
    return 'Your yearly dues are outstanding. Please make payment to continue accessing the platform.'
  }

  return null
}
