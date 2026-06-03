'use client'
// app/admin/page.tsx

import { useEffect, useState } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Stats {
  totalMembers: number
  activeMembers: number
  pendingMembers: number
  suspendedMembers: number
  paidDuesThisYear: number
  unpaidDuesThisYear: number
  upcomingEvents: number
  activeJobs: number
}

const EMPTY_STATS: Stats = {
  totalMembers: 0,
  activeMembers: 0,
  pendingMembers: 0,
  suspendedMembers: 0,
  paidDuesThisYear: 0,
  unpaidDuesThisYear: 0,
  upcomingEvents: 0,
  activeJobs: 0,
}

export default function AdminPage() {
  const { member, loading } = useMembershipAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)

  const isAdmin = member?.membership_number === 'ADMIN001'

  // Redirect non-admins
  useEffect(() => {
    if (!loading && (!member || !isAdmin)) {
      router.replace('/')
    }
  }, [member, loading, isAdmin, router])

  useEffect(() => {
    if (!isAdmin) return
    fetchStats()
  }, [isAdmin])

  const fetchStats = async () => {
    try {
      const currentYear = new Date().getFullYear()

      const [members, dues, events, jobs] = await Promise.all([
        supabase.from('members').select('membership_status'),
        supabase.from('dues').select('paid, year').eq('year', currentYear),
        supabase.from('events').select('start_date').gte('start_date', new Date().toISOString()),
        supabase.from('jobs').select('id').eq('is_active', true),
      ])

      const memberRows = members.data || []
      const dueRows    = dues.data    || []
      const eventRows  = events.data  || []
      const jobRows    = jobs.data    || []

      setStats({
        totalMembers:      memberRows.length,
        activeMembers:     memberRows.filter(m => m.membership_status === 'active').length,
        pendingMembers:    memberRows.filter(m => m.membership_status === 'pending').length,
        suspendedMembers:  memberRows.filter(m => m.membership_status === 'suspended').length,
        paidDuesThisYear:  dueRows.filter(d => d.paid).length,
        unpaidDuesThisYear: dueRows.filter(d => !d.paid).length,
        upcomingEvents:    eventRows.length,
        activeJobs:        jobRows.length,
      })
    } catch (err) {
      toast.error('Error loading stats')
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Members',   value: stats.totalMembers,      icon: UserGroupIcon,    color: 'bg-blue-500' },
    { label: 'Active Members',  value: stats.activeMembers,     icon: CheckCircleIcon,  color: 'bg-green-500' },
    { label: 'Pending Approval',value: stats.pendingMembers,    icon: ClockIcon,        color: 'bg-amber-500', href: '/admin/verify-members' },
    { label: 'Suspended',       value: stats.suspendedMembers,  icon: XCircleIcon,      color: 'bg-red-500' },
    { label: 'Dues Paid (this year)',  value: stats.paidDuesThisYear,   icon: CurrencyDollarIcon, color: 'bg-teal-500' },
    { label: 'Dues Unpaid (this year)', value: stats.unpaidDuesThisYear, icon: CurrencyDollarIcon, color: 'bg-orange-500' },
    { label: 'Upcoming Events', value: stats.upcomingEvents,    icon: CalendarIcon,     color: 'bg-purple-500' },
    { label: 'Active Job Posts',value: stats.activeJobs,        icon: BriefcaseIcon,    color: 'bg-indigo-500' },
  ]

  const adminActions = [
    {
      title: 'Verify Members',
      description: 'Review and approve pending membership requests',
      href: '/admin/verify-members',
      icon: CheckCircleIcon,
      badge: stats.pendingMembers > 0 ? stats.pendingMembers : null,
      color: 'border-amber-200 hover:border-amber-400',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Manage Members',
      description: 'View, suspend, or reactivate member accounts',
      href: '/admin/members',
      icon: UserGroupIcon,
      badge: null,
      color: 'border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Dues Management',
      description: 'Track payments and mark dues as paid',
      href: '/admin/dues',
      icon: CurrencyDollarIcon,
      badge: stats.unpaidDuesThisYear > 0 ? stats.unpaidDuesThisYear : null,
      color: 'border-green-200 hover:border-green-400',
      iconColor: 'text-green-600',
    },
    {
      title: 'Post Announcement',
      description: 'Publish news and updates to all members',
      href: '/announcements',
      icon: MegaphoneIcon,
      badge: null,
      color: 'border-purple-200 hover:border-purple-400',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Create Event',
      description: 'Schedule meetings, workshops, and social events',
      href: '/events',
      icon: CalendarIcon,
      badge: null,
      color: 'border-indigo-200 hover:border-indigo-400',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Post Job',
      description: 'Share radio industry opportunities with alumni',
      href: '/jobs',
      icon: BriefcaseIcon,
      badge: null,
      color: 'border-teal-200 hover:border-teal-400',
      iconColor: 'text-teal-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="h-7 w-7 text-amber-300" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-amber-200 text-sm">
            Ẹ káàbọ̀, {member.full_name} — RADLAG Administrator
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Stats grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`bg-white rounded-lg shadow p-4 ${card.href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={() => card.href && router.push(card.href)}
              >
                <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '—' : card.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className={`relative bg-white rounded-lg border-2 p-5 transition-all cursor-pointer h-full ${action.color}`}>
                  {/* Badge for pending counts */}
                  {action.badge !== null && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                  <div className={`mb-3 ${action.iconColor}`}>
                    <action.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back to portal */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-medium"
          >
            ← Back to Member Portal
          </Link>
        </div>

      </div>
    </div>
  )
}
