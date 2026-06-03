'use client'
// app/members/[id]/page.tsx

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'

interface MemberDetail {
  id: string
  full_name: string
  email: string
  phone_number: string
  occupation: string
  location: string
  address: string
  graduation_year: number
  graduation_set: string
  birthday: string
  membership_number: string
  membership_status: string
  membership_verified_at: string | null
  last_payment_date: string | null
  created_at: string
}

export default function MemberProfilePage() {
  const { member: currentMember } = useMembershipAuth()
  const params   = useParams()
  const router   = useRouter()
  const memberId = params.id as string

  const [profile, setProfile]   = useState<MemberDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const isOwnProfile = currentMember?.id === memberId
  const isAdmin      = currentMember?.membership_number === 'ADMIN001'

  useEffect(() => {
    fetchProfile()
  }, [memberId])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('id, full_name, email, phone_number, occupation, location, address, graduation_year, graduation_set, birthday, membership_number, membership_status, membership_verified_at, last_payment_date, created_at')
      .eq('id', memberId)
      .eq('membership_status', 'active') // only show active members
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🎙️</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Member not found</h2>
        <p className="text-gray-500 mb-6">This member may not exist or is not currently active.</p>
        <Link href="/members" className="text-amber-600 hover:text-amber-700 font-medium">
          ← Back to Member Directory
        </Link>
      </div>
    )
  }

  const initials = profile!.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const joinYear  = new Date(profile!.created_at).getFullYear()
  const isBirthday = profile!.birthday && (() => {
    const today = new Date()
    const bday  = new Date(profile!.birthday)
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth()
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 h-40" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16">
        {/* Back link */}
        <Link
          href="/members"
          className="inline-flex items-center gap-1 text-amber-100 hover:text-white text-sm mb-6"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Member Directory
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Avatar + name row */}
          <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{profile!.full_name}</h1>
                {isBirthday && (
                  <span className="text-sm bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                    🎂 Birthday today!
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{profile!.occupation || 'Radio Professional'}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {profile!.membership_number} · Member since {joinYear}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit Profile
                </Link>
              )}
              {!isOwnProfile && (
                <a
                  href={`mailto:${profile!.email}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  Send Message
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Details grid */}
          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${profile!.email}`} className="hover:text-amber-600 truncate">
                    {profile!.email}
                  </a>
                </div>
                {profile!.phone_number && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${profile!.phone_number}`} className="hover:text-amber-600">
                      {profile!.phone_number}
                    </a>
                  </div>
                )}
                {profile!.location && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span>{profile!.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RADLAG Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">RADLAG Info</h3>
              <div className="space-y-3">
                {profile!.occupation && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span>{profile!.occupation}</span>
                  </div>
                )}
                {profile!.graduation_year && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span>
                      Class of {profile!.graduation_year}
                      {profile!.graduation_set && <span className="text-gray-400"> · {profile!.graduation_set}</span>}
                    </span>
                  </div>
                )}
                {profile!.birthday && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span>
                      {new Date(profile!.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <div className="border-t border-gray-100" />
              <div className="px-6 py-4 bg-amber-50">
                <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Admin View</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      profile!.membership_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {profile!.membership_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Payment</p>
                    <p className="text-gray-700 mt-1">
                      {profile!.last_payment_date
                        ? new Date(profile!.last_payment_date).getFullYear()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Verified</p>
                    <p className="text-gray-700 mt-1">
                      {profile!.membership_verified_at
                        ? new Date(profile!.membership_verified_at).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/admin/members`}
                    className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                  >
                    Manage this member in Admin →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
