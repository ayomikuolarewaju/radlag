'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CakeIcon, GiftIcon } from '@heroicons/react/24/outline'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface BirthdayMember {
  id: string
  full_name: string
  birthday: string
  email: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function BirthdaysPage() {
  const [members, setMembers] = useState<BirthdayMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, birthday, email')
        .not('birthday', 'is', null)
        .eq('membership_status', 'active')
      if (error) toast.error('Error fetching birthdays')
      else setMembers(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = members.filter(m => {
    if (!m.birthday) return false
    return new Date(m.birthday).getMonth() === selectedMonth
  })

  const isToday = (birthday: string) => {
    const today = new Date()
    const bday = new Date(birthday)
    return bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth()
  }

  const sendWish = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Happy Birthday ${name}!&body=Dear ${name},%0A%0AẸ kú ọjọ́ ìbí o! Wishing you a wonderful birthday!%0A%0AFellow RADLAG Alumni`
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Birthday Wishes"
          titleYoruba="Ìkí Ọjọ́ Ìbí"
          description="Celebrate and send wishes to your fellow RADLAG alumni"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} birthdays in {MONTHS[selectedMonth]}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <GiftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-3 text-gray-500">No birthdays in {MONTHS[selectedMonth]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`bg-white rounded-lg p-5 shadow flex items-center gap-4 ${
                  isToday(m.birthday) ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {m.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{m.full_name}</p>
                    {isToday(m.birthday) && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Today! 🎂</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(m.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => sendWish(m.email, m.full_name)}
                  className="flex-shrink-0 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <GiftIcon className="h-4 w-4" />
                  Wish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
