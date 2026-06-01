'use client'

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface PendingMember {
  id: string
  email: string
  full_name: string
  membership_number: string
  graduation_year: number
  graduation_set: string
  phone_number: string
  occupation: string
  created_at: string
}

export default function VerifyMembersPage() {
  const { member } = useMembershipAuth()
  const router = useRouter()
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Redirect non-admins
    if (member && member.membership_number !== 'ADMIN001') {
      router.push('/')
      return
    }
    if (member) fetchPendingMembers()
  }, [member])

  const fetchPendingMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('membership_status', 'pending')
      .order('created_at', { ascending: true })
    if (error) toast.error('Error fetching pending members')
    else setPendingMembers(data || [])
    setLoading(false)
  }

  const verifyMember = async (memberId: string, approve: boolean) => {
    const { error } = await supabase
      .from('members')
      .update({
        membership_status: approve ? 'active' : 'suspended',
        membership_verified_at: new Date().toISOString(),
        verified_by: member?.id
      })
      .eq('id', memberId)

    if (error) {
      toast.error('Error updating member status')
    } else {
      toast.success(`Member ${approve ? 'approved' : 'rejected'}`)
      fetchPendingMembers()
    }
  }

  const filtered = pendingMembers.filter(m =>
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.membership_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verify New Members</h1>
          <p className="text-sm text-gray-500 mt-1">{pendingMembers.length} pending requests</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {pendingMembers.length === 0 ? 'No pending membership requests.' : 'No results match your search.'}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Membership #', 'Name', 'Email', 'Graduation', 'Occupation', 'Applied', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.membership_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{m.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.graduation_year} {m.graduation_set && `(${m.graduation_set})`}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.occupation}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => verifyMember(m.id, true)} title="Approve" className="text-green-600 hover:text-green-800">
                        <CheckCircleIcon className="h-6 w-6" />
                      </button>
                      <button onClick={() => verifyMember(m.id, false)} title="Reject" className="text-red-600 hover:text-red-800">
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
