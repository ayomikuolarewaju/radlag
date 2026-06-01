// app/events/page.tsx - Events Calendar
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { CalendarIcon, MapPinIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  max_attendees: number
  current_attendees: number
  organizer_id: string
  organizer_name: string
  event_type: 'meeting' | 'workshop' | 'social' | 'training'
  created_at: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attendingEvents, setAttendingEvents] = useState<string[]>([])
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    max_attendees: 50,
    event_type: 'meeting'
  })

  useEffect(() => {
    fetchEvents()
    fetchUserAttendance()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      toast.error('Error fetching events')
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const fetchUserAttendance = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('member_id', user.id)

    if (!error && data) {
      setAttendingEvents(data.map(a => a.event_id))
    }
  }

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to RSVP')
      return
    }

    const isAttending = attendingEvents.includes(eventId)
    
    if (isAttending) {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('member_id', user.id)

      if (error) {
        toast.error('Error canceling RSVP')
      } else {
        toast.success('RSVP cancelled')
        setAttendingEvents(attendingEvents.filter(id => id !== eventId))
        fetchEvents() // Refresh to update counts
      }
    } else {
      const { error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, member_id: user.id }])

      if (error) {
        toast.error('Error with RSVP')
      } else {
        toast.success('Successfully RSVPed!')
        setAttendingEvents([...attendingEvents, eventId])
        fetchEvents()
      }
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('events')
      .insert([{
        ...newEvent,
        organizer_id: user?.id,
        organizer_name: user?.user_metadata?.full_name,
        current_attendees: 0
      }])

    if (error) {
      toast.error('Error creating event')
    } else {
      toast.success('Event created successfully!')
      setShowForm(false)
      setNewEvent({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        max_attendees: 50,
        event_type: 'meeting'
      })
      fetchEvents()
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const tileContent = ({ date, view }: any) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date)
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center items-center mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )
      }
    }
    return null
  }

  if (loading) return <div className="text-center py-12">Loading events...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events Calendar</h1>
          <p className="mt-1 text-sm text-gray-600">Stay connected with RADLAG events and activities</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvent.end_date}
                  onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value as any})}
                >
                  <option value="meeting">Meeting</option>
                  <option value="workshop">Workshop</option>
                  <option value="social">Social</option>
                  <option value="training">Training</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Attendees</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newEvent.max_attendees}
                onChange={(e) => setNewEvent({...newEvent, max_attendees: parseInt(e.target.value)})}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full border-0"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Events on {selectedDate.toLocaleDateString()}
          </h2>
          <div className="space-y-4">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No events scheduled for this day</p>
              </div>
            ) : (
              getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-5 w-5 mr-2" />
                          {new Date(event.start_date).toLocaleString()} - {new Date(event.end_date).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-5 w-5 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-5 w-5 mr-2" />
                          {event.current_attendees} / {event.max_attendees} attendees
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRSVP(event.id)}
                      className={`ml-4 px-4 py-2 rounded-md ${
                        attendingEvents.includes(event.id)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {attendingEvents.includes(event.id) ? 'Cancel RSVP' : 'RSVP'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.filter(e => new Date(e.start_date) > new Date()).slice(0, 5).map((event) => (
              <div key={event.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(event.start_date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      attendingEvents.includes(event.id)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {attendingEvents.includes(event.id) ? 'Going' : 'RSVP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}