'use client'
// app/profile/edit/page.tsx

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const { member, loading } = useMembershipAuth()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    phone_number: '',
    occupation:   '',
    location:     '',
    address:      '',
    birthday:     '',
  })

  useEffect(() => {
    if (!loading && !member) router.replace('/login')
  }, [member, loading, router])

  useEffect(() => {
    if (member) {
      setForm({
        phone_number: member.phone_number || '',
        occupation:   member.occupation   || '',
        location:     member.location     || '',
        address:      member.address      || '',
        birthday:     member.birthday     || '',
      })
    }
  }, [member])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member) return
    setSaving(true)

    const { error } = await supabase
      .from('members')
      .update({
        phone_number: form.phone_number.trim(),
        occupation:   form.occupation.trim(),
        location:     form.location.trim(),
        address:      form.address.trim(),
        birthday:     form.birthday || null,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', member.id)

    if (error) {
      toast.error('Failed to save changes')
    } else {
      toast.success('Profile updated!')
      router.push(`/members/${member.id}`)
    }
    setSaving(false)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  if (loading || !member) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/members/${member.id}`} className="inline-flex items-center gap-1 text-amber-200 hover:text-white text-sm mb-4">
            <ChevronLeftIcon className="h-4 w-4" /> My Profile
          </Link>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-amber-200 text-sm mt-1">Update your contact and personal information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow p-6 sm:p-8">

          {/* Read-only fields */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Account Info (read-only)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Full Name</p>
                <p className="text-gray-700 font-medium">{member.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-gray-700">{member.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Membership Number</p>
                <p className="text-gray-700">{member.membership_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Graduation Year</p>
                <p className="text-gray-700">
                  {member.graduation_year
                    ? `${member.graduation_year}${member.graduation_set ? ` (${member.graduation_set})` : ''}`
                    : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              To update your name, email, or graduation details, contact the RADLAG admin.
            </p>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Personal Info</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  {...field('phone_number')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthday
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  {...field('birthday')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                placeholder="e.g. Radio Producer, Broadcaster, Sound Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                {...field('occupation')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location — Ibùgbé
              </label>
              <input
                type="text"
                placeholder="e.g. Lagos, Nigeria"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                {...field('location')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                rows={3}
                placeholder="Your full address (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/members/${member.id}`}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
