// app/members/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Member {
  id: string
  email: string
  full_name: string
  graduation_year: number
  occupation: string
  avatar_url: string
  location: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    if (error) {
      console.error('Error fetching members:', error)
    } else {
      setMembers(data || [])
    }
    setLoading(false)
  }

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Member Directory</h1>
          <p className="mt-2 text-sm text-gray-700">
            Connect with fellow RADLAG alumni ({members.length} members)
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {member.full_name?.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member.full_name}</p>
                <p className="text-sm text-gray-500 truncate">{member.occupation || 'Radio Professional'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {member.graduation_year && (
                <p className="text-sm text-gray-600">🎓 Class of {member.graduation_year}</p>
              )}
              {member.location && (
                <p className="text-sm text-gray-600">📍 {member.location}</p>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.href = `mailto:${member.email}`}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}