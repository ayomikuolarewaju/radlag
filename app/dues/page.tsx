'use client'

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Due {
  id: string
  year: number
  amount: number
  paid: boolean
  paid_date: string | null
}

export default function DuesPage() {
  const { member } = useMembershipAuth()
  const [dues, setDues] = useState<Due[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!member) return
    const fetch = async () => {
      const { data, error } = await supabase
        .from('dues')
        .select('*')
        .eq('member_id', member.id)
        .order('year', { ascending: false })
      if (error) toast.error('Error fetching dues')
      else setDues(data || [])
      setLoading(false)
    }
    fetch()
  }, [member])

  const handlePayment = (dueId: string, year: number, amount: number) => {
    // Integrate with payment gateway (Paystack, Flutterwave, etc.)
    toast.success(`Redirecting to payment for ${year} dues — ₦${amount}`)
  }

  const totalDue = dues.filter(d => !d.paid).reduce((sum, d) => sum + d.amount, 0)
  const totalPaid = dues.filter(d => d.paid).reduce((sum, d) => sum + d.amount, 0)

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Yearly Dues"
          titleYoruba="Owó Ẹgbẹ́ Ọdọọdún"
          description="Pay your annual membership dues to maintain your active status"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Outstanding — Ko Ti San</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₦{totalDue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-gray-500">Total Paid — Ti San</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₦{totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* Dues table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Paid</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dues.map((due) => (
                <tr key={due.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{due.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₦{due.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      due.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {due.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {due.paid_date ? new Date(due.paid_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!due.paid && (
                      <button
                        onClick={() => handlePayment(due.id, due.year, due.amount)}
                        className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                      >
                        Pay — San
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {dues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No dues records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
