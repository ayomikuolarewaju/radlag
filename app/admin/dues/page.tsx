'use client'
// app/admin/dues/page.tsx

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MagnifyingGlassIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface DueRow {
  id: string
  member_id: string
  year: number
  amount: number
  paid: boolean
  paid_date: string | null
  member_name: string
  member_email: string
  membership_number: string
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export default function AdminDuesPage() {
  const { member, loading } = useMembershipAuth()
  const router = useRouter()

  const [dues, setDues]           = useState<DueRow[]>([])
  const [fetching, setFetching]   = useState(true)
  const [search, setSearch]       = useState('')
  const [yearFilter, setYear]     = useState(CURRENT_YEAR)
  const [paidFilter, setPaid]     = useState<'all' | 'paid' | 'unpaid'>('all')
  const [updating, setUpdating]   = useState<string | null>(null)

  const isAdmin = member?.membership_number === 'ADMIN001'

  useEffect(() => {
    if (!loading && (!member || !isAdmin)) router.replace('/')
  }, [member, loading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) fetchDues()
  }, [isAdmin, yearFilter])

  const fetchDues = async () => {
    setFetching(true)

    // Fetch dues joined with member info
    const { data: duesData, error: duesError } = await supabase
      .from('dues')
      .select('*, members(full_name, email, membership_number)')
      .eq('year', yearFilter)
      .order('paid', { ascending: true }) // unpaid first

    if (duesError) {
      toast.error('Error fetching dues')
      setFetching(false)
      return
    }

    const rows: DueRow[] = (duesData || []).map((d: any) => ({
      id:                d.id,
      member_id:         d.member_id,
      year:              d.year,
      amount:            d.amount,
      paid:              d.paid,
      paid_date:         d.paid_date,
      member_name:       d.members?.full_name || '—',
      member_email:      d.members?.email || '—',
      membership_number: d.members?.membership_number || '—',
    }))

    setDues(rows)
    setFetching(false)
  }

  const markAsPaid = async (dueId: string) => {
    setUpdating(dueId)
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('dues')
      .update({
        paid: true,
        paid_date: today,
      })
      .eq('id', dueId)

    if (error) {
      toast.error('Failed to mark as paid')
    } else {
      toast.success('Dues marked as paid')
      setDues(prev => prev.map(d =>
        d.id === dueId ? { ...d, paid: true, paid_date: today } : d
      ))

      // Also update last_payment_date on the member
      const due = dues.find(d => d.id === dueId)
      if (due) {
        await supabase
          .from('members')
          .update({ last_payment_date: today, updated_at: new Date().toISOString() })
          .eq('id', due.member_id)
      }
    }
    setUpdating(null)
  }

  const markAsUnpaid = async (dueId: string) => {
    setUpdating(dueId)
    const { error } = await supabase
      .from('dues')
      .update({ paid: false, paid_date: null })
      .eq('id', dueId)

    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success('Dues marked as unpaid')
      setDues(prev => prev.map(d =>
        d.id === dueId ? { ...d, paid: false, paid_date: null } : d
      ))
    }
    setUpdating(null)
  }

  const filtered = dues.filter(d => {
    const matchesSearch =
      d.member_name.toLowerCase().includes(search.toLowerCase()) ||
      d.member_email.toLowerCase().includes(search.toLowerCase()) ||
      d.membership_number.toLowerCase().includes(search.toLowerCase())
    const matchesPaid =
      paidFilter === 'all' ||
      (paidFilter === 'paid' && d.paid) ||
      (paidFilter === 'unpaid' && !d.paid)
    return matchesSearch && matchesPaid
  })

  const totalPaid   = dues.filter(d => d.paid).length
  const totalUnpaid = dues.filter(d => !d.paid).length
  const totalAmount = dues.filter(d => d.paid).reduce((s, d) => s + d.amount, 0)

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
          <h1 className="text-2xl font-bold">Dues Management</h1>
          <p className="text-amber-200 text-sm mt-1">Track and confirm member payments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Paid ({yearFilter})</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalPaid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Unpaid ({yearFilter})</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{totalUnpaid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Amount Collected</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">₦{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
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
          <select
            value={yearFilter}
            onChange={e => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
          >
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex gap-2">
            {(['all', 'paid', 'unpaid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setPaid(f)}
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  paidFilter === f
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-amber-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {fetching ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No dues records found.</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Member</th>
                    <th className="px-4 py-3 text-left">Membership #</th>
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date Paid</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{d.member_name}</p>
                        <p className="text-xs text-gray-400">{d.member_email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.membership_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">₦{d.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          d.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {d.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {d.paid_date ? new Date(d.paid_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {d.paid ? (
                          <button
                            onClick={() => markAsUnpaid(d.id)}
                            disabled={updating === d.id}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsPaid(d.id)}
                            disabled={updating === d.id}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 font-medium"
                          >
                            Mark Paid
                          </button>
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
