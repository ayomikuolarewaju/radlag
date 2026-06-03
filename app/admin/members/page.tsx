'use client'
// app/admin/members/page.tsx

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MagnifyingGlassIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Member {
  id: string
  membership_number: string
  full_name: string
  email: string
  graduation_year: number
  graduation_set: string
  occupation: string
  location: string
  membership_status: 'pending' | 'active' | 'suspended' | 'expired'
  last_login_at: string | null
  last_payment_date: string | null
  created_at: string
}

const STATUS_STYLES = {
  active:    'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
  expired:   'bg-gray-100 text-gray-600',
}

const STATUS_FILTERS = ['all', 'active', 'pending', 'suspended', 'expired']

export default function AdminMembersPage() {
  const { member, loading } = useMembershipAuth()
  const router = useRouter()

  const [members, setMembers]     = useState<Member[]>([])
  const [fetching, setFetching]   = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [updating, setUpdating]   = useState<string | null>(null) // member id being updated

  const isAdmin = member?.membership_number === 'ADMIN001'

  useEffect(() => {
    if (!loading && (!member || !isAdmin)) router.replace('/')
  }, [member, loading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) fetchMembers()
  }, [isAdmin])

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('id, membership_number, full_name, email, graduation_year, graduation_set, occupation, location, membership_status, last_login_at, last_payment_date, created_at')
      .order('created_at', { ascending: false })

    if (error) toast.error('Error fetching members')
    else setMembers(data || [])
    setFetching(false)
  }

  const updateStatus = async (memberId: string, newStatus: Member['membership_status']) => {
    setUpdating(memberId)
    const { error } = await supabase
      .from('members')
      .update({
        membership_status: newStatus,
        ...(newStatus === 'active' && { membership_verified_at: new Date().toISOString(), verified_by: member?.id }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Member status updated to ${newStatus}`)
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, membership_status: newStatus } : m))
    }
    setUpdating(null)
  }

  const filtered = members.filter(m => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.membership_number.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || m.membership_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-1 text-amber-200 hover:text-white text-sm mb-4">
            <ChevronLeftIcon className="h-4 w-4" /> Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Manage Members</h1>
          <p className="text-amber-200 text-sm mt-1">{members.length} total members</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or membership number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>

        {/* Table */}
        {fetching ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No members match your filters.</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Member</th>
                    <th className="px-4 py-3 text-left">Membership #</th>
                    <th className="px-4 py-3 text-left">Graduation</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Last Login</th>
                    <th className="px-4 py-3 text-left">Dues Paid</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                            {m.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.full_name}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.membership_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {m.graduation_year || '—'}
                        {m.graduation_set && <span className="text-gray-400"> ({m.graduation_set})</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[m.membership_status]}`}>
                          {m.membership_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {m.last_payment_date ? new Date(m.last_payment_date).getFullYear() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {/* Don't show actions for the admin themselves */}
                        {m.membership_number === 'ADMIN001' ? (
                          <span className="text-xs text-gray-400 italic">Admin</span>
                        ) : (
                          <div className="flex gap-2">
                            {m.membership_status !== 'active' && (
                              <button
                                onClick={() => updateStatus(m.id, 'active')}
                                disabled={updating === m.id}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}
                            {m.membership_status !== 'suspended' && (
                              <button
                                onClick={() => updateStatus(m.id, 'suspended')}
                                disabled={updating === m.id}
                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
