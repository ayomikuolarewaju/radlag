'use client'

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  author_name: string
  priority: 'high' | 'medium' | 'low'
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
}

export default function AnnouncementsPage() {
  const { member } = useMembershipAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' })

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Error fetching announcements')
    else setAnnouncements(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('announcements').insert([{
      ...form,
      author_id: member?.id,
      author_name: member?.full_name,
    }])
    if (error) toast.error('Error posting announcement')
    else {
      toast.success('Announcement published!')
      setShowForm(false)
      setForm({ title: '', content: '', priority: 'medium' })
      fetchAnnouncements()
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Announcements"
          titleYoruba="Àwọn Ìròyìn"
          description="Latest news and important updates from RADLAG leadership"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">All Announcements</h2>
          {member && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm"
            >
              {showForm ? 'Cancel' : '+ Post Announcement'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text" required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  required rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 text-sm">
                Publish
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {a.author_name} · {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColors[a.priority]}`}>
                  {a.priority}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{a.content}</p>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-500">No announcements yet.</div>
          )}
        </div>
      </div>
    </>
  )
}
