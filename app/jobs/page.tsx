'use client'
// app/jobs/page.tsx

import { useState, useEffect } from 'react'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import { supabase } from '@/lib/supabase'
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string
  location: string
  salary_range: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior'
  poster_name: string
  application_deadline: string
  contact_email: string
  created_at: string
}

const JOB_TYPE_COLORS = {
  'full-time':  'bg-green-100 text-green-800',
  'part-time':  'bg-blue-100 text-blue-800',
  'contract':   'bg-yellow-100 text-yellow-800',
  'internship': 'bg-gray-100 text-gray-800',
}

const EXP_COLORS = {
  entry:  'bg-purple-100 text-purple-800',
  mid:    'bg-orange-100 text-orange-800',
  senior: 'bg-red-100 text-red-800',
}

const EMPTY_FORM = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  location: '',
  salary_range: '',
  job_type: 'full-time' as const,
  experience_level: 'mid' as const,
  application_deadline: '',
  contact_email: '',
}

export default function JobsPage() {
  const { member } = useMembershipAuth()

  const [jobs, setJobs]         = useState<Job[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newJob, setNewJob]     = useState(EMPTY_FORM)
  const [filters, setFilters]   = useState({
    job_type: 'all',
    experience_level: 'all',
    location: '',
  })

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) toast.error('Error fetching jobs')
    else setJobs(data || [])
    setLoading(false)
  }

  // Derived — no separate useEffect needed
  const filteredJobs = jobs.filter(j => {
    if (filters.job_type !== 'all' && j.job_type !== filters.job_type) return false
    if (filters.experience_level !== 'all' && j.experience_level !== filters.experience_level) return false
    if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('jobs').insert([{
      ...newJob,
      posted_by:   member?.id,
      poster_name: member?.full_name,
      is_active:   true,
    }])
    if (error) {
      toast.error('Error posting job')
    } else {
      toast.success('Job posted successfully!')
      setShowForm(false)
      setNewJob(EMPTY_FORM)
      fetchJobs()
    }
  }

  const f = (key: keyof typeof newJob) => ({
    value: newJob[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setNewJob(prev => ({ ...prev, [key]: e.target.value })),
  })

  if (loading) return <div className="text-center py-12">Loading jobs...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Job Board"
          titleYoruba="Ibi Ipinkiri Ise"
          description="Find and post radio industry opportunities, from entry-level to senior positions"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-gray-500">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available</p>
          {member && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm font-medium"
            >
              {showForm ? 'Cancel' : '+ Post a Job'}
            </button>
          )}
        </div>

        {/* Post job form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('title')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('company')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" {...f('description')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none" {...f('requirements')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('location')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input type="text" placeholder="e.g. N200,000 - N350,000" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('salary_range')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <select required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('job_type')}>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
                  <select required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('experience_level')}>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline *</label>
                  <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('application_deadline')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                  <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" {...f('contact_email')} />
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 text-sm font-medium">
                Post Job
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
            <select
              value={filters.job_type}
              onChange={e => setFilters(prev => ({ ...prev, job_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Experience Level</label>
            <select
              value={filters.experience_level}
              onChange={e => setFilters(prev => ({ ...prev, experience_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
            <input
              type="text"
              placeholder="Search location..."
              value={filters.location}
              onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Job listings */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No jobs found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${JOB_TYPE_COLORS[job.job_type]}`}>
                        {job.job_type}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EXP_COLORS[job.experience_level]}`}>
                        {job.experience_level}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-700 mb-3">{job.company}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />{job.location}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-4 w-4" />{job.salary_range}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{job.description}</p>

                    {job.requirements && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{job.requirements}</p>
                      </div>
                    )}
                  </div>

                  <a
                    href={`mailto:${job.contact_email}?subject=Application for ${job.title} at ${job.company}`}
                    className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium"
                  >
                    Apply Now
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Posted by {job.poster_name} · {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
