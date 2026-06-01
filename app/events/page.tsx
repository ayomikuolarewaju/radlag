'use client'

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { CalendarIcon, MapPinIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  max_attendees: number
  current_attendees: number
  organizer_name: string
  event_type: 'meeting' | 'workshop' | 'social' | 'training'
}

const eventTypeColors = {
  meeting: 'bg-blue-100 text-blue-700',
  workshop: 'bg-purple-100 text-purple-700',
  social: 'bg-green-100 text-green-700',
  training: 'bg-orange-100 text-orange-700',
}

export default function EventsPage() {
  const { member } = useMembershipAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [attendingEvents, setAttendingEvents] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', start_date: '', end_date: '',
    location: '', max_attendees: 50, event_type: 'meeting'
  })

  useEffect(() => {
    fetchEvents()
    if (member) fetchUserAttendance()
  }, [member])

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: true })
    if (error) toast.error('Error fetching events')
    else setEvents(data || [])
    setLoading(false)
  }

  const fetchUserAttendance = async () => {
    if (!member) return
    const { data } = await supabase.from('event_attendees').select('event_id').eq('member_id', member.id)
    if (data) setAttendingEvents(data.map(a => a.event_id))
  }

  const handleRSVP = async (eventId: string) => {
    if (!member) { toast.error('Please login to RSVP'); return }
    const isAttending = attendingEvents.includes(eventId)
    if (isAttending) {
      const { error } = await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('member_id', member.id)
      if (!error) { toast.success('RSVP cancelled'); setAttendingEvents(attendingEvents.filter(id => id !== eventId)); fetchEvents() }
    } else {
      const { error } = await supabase.from('event_attendees').insert([{ event_id: eventId, member_id: member.id }])
      if (!error) { toast.success('RSVP confirmed!'); setAttendingEvents([...attendingEvents, eventId]); fetchEvents() }
      else toast.error('Error with RSVP')
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('events').insert([{
      ...form, organizer_id: member?.id, organizer_name: member?.full_name, current_attendees: 0
    }])
    if (error) toast.error('Error creating event')
    else {
      toast.success('Event created!')
      setShowForm(false)
      setForm({ title: '', description: '', start_date: '', end_date: '', location: '', max_attendees: 50, event_type: 'meeting' })
      fetchEvents()
    }
  }

  const upcoming = events.filter(e => new Date(e.start_date) >= new Date())
  const past = events.filter(e => new Date(e.start_date) < new Date())

  if (loading) return <div className="text-center py-12">Loading events...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Events Calendar"
          titleYoruba="Kàlẹ́ńdà Ìṣẹ̀lẹ̀"
          description="Join meetings, workshops, social gatherings, and training sessions"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
          {member && (
            <button onClick={() => setShowForm(!showForm)} className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm">
              {showForm ? 'Cancel' : '+ Create Event'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="meeting">Meeting</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Social</option>
                    <option value="training">Training</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                  <input type="datetime-local" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                  <input type="datetime-local" required value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                  <input type="number" min="1" value={form.max_attendees} onChange={e => setForm({...form, max_attendees: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 text-sm">
                Create Event
              </button>
            </form>
          </div>
        )}

        {/* Upcoming events */}
        <div className="space-y-4 mb-12">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-gray-500">No upcoming events</p>
            </div>
          ) : upcoming.map((event) => (
            <div key={event.id} className="bg-white shadow rounded-lg p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${eventTypeColors[event.event_type]}`}>
                      {event.event_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />{event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-4 w-4" />
                      {event.current_attendees} / {event.max_attendees} attending
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRSVP(event.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium ${
                    attendingEvents.includes(event.id)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {attendingEvents.includes(event.id) ? 'Cancel RSVP' : 'RSVP'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Past events - collapsed list */}
        {past.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Past Events ({past.length})</h2>
            <div className="space-y-2">
              {past.slice(0, 5).map(event => (
                <div key={event.id} className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{event.title}</span>
                  <span>{new Date(event.start_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
