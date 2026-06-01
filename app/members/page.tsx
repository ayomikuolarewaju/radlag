'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Member {
  id: string
  email: string
  full_name: string
  graduation_year: number
  graduation_set: string
  occupation: string
  location: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, graduation_year, graduation_set, occupation, location, email')
        .eq('membership_status', 'active')
        .order('full_name')
      if (error) toast.error('Error fetching members')
      else setMembers(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.graduation_set?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Member Directory"
          titleYoruba="Ìwé Àkọsílẹ̀ Ọmọ Ẹgbẹ́"
          description="Connect with fellow RADLAG alumni across the world"  />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <p className="text-sm text-gray-500">{members.length} active members</p>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, occupation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-72 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <div key={member.id} className="bg-white shadow rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{member.full_name}</p>
                  <p className="text-sm text-gray-500 truncate">{member.occupation || 'Radio Professional'}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {member.graduation_year && (
                  <p>🎓 Class of {member.graduation_year}{member.graduation_set ? ` (${member.graduation_set})` : ''}</p>
                )}
                {member.location && <p>📍 {member.location}</p>}
              </div>
              <button
                onClick={() => window.location.href = `mailto:${member.email}`}
                className="mt-4 w-full bg-gray-100 text-gray-700 py-1.5 rounded-md text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                Contact
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No members found.</div>
        )}
      </div>
    </>
  )
}
