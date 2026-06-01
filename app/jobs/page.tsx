// app/jobs/page.tsx - Job Board
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'
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
  posted_by: string
  poster_name: string
  application_deadline: string
  contact_email: string
  is_active: boolean
  created_at: string
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    job_type: 'all',
    experience_level: 'all',
    location: 'all'
  })
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    job_type: 'full-time' as const,
    experience_level: 'mid' as const,
    application_deadline: '',
    contact_email: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [filters, jobs])

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error fetching jobs')
    } else {
      setJobs(data || [])
      setFilteredJobs(data || [])
    }
    setLoading(false)
  }

  const filterJobs = () => {
    let filtered = jobs
    if (filters.job_type !== 'all') {
      filtered = filtered.filter(j => j.job_type === filters.job_type)
    }
    if (filters.experience_level !== 'all') {
      filtered = filtered.filter(j => j.experience_level === filters.experience_level)
    }
    if (filters.location !== 'all' && filters.location !== '') {
      filtered = filtered.filter(j => j.location.toLowerCase().includes(filters.location.toLowerCase()))
    }
    setFilteredJobs(filtered)
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('jobs')
      .insert([{
        ...newJob,
        posted_by: user?.id,
        poster_name: user?.user_metadata?.full_name,
        is_active: true
      }])

    if (error) {
      toast.error('Error posting job')
    } else {
      toast.success('Job posted successfully!')
      setShowForm(false)
      setNewJob({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        salary_range: '',
        job_type: 'full-time',
        experience_level: 'mid',
        application_deadline: '',
        contact_email: ''
      })
      fetchJobs()
    }
  }

  const getJobTypeColor = (type: string) => {
    switch(type) {
      case 'full-time': return 'bg-green-100 text-green-800'
      case 'part-time': return 'bg-blue-100 text-blue-800'
      case 'contract': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExperienceColor = (level: string) => {
    switch(level) {
      case 'entry': return 'bg-purple-100 text-purple-800'
      case 'mid': return 'bg-orange-100 text-orange-800'
      case 'senior': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="text-center py-12">Loading jobs...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Job Board</h1>
          <p className="mt-1 text-sm text-gray-600">Find and post radio industry opportunities</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Post a Job'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newJob.requirements}
                onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.location}
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., $50,000 - $70,000"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({...newJob, job_type: e.target.value as any})}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.experience_level}
                  onChange={(e) => setNewJob({...newJob, experience_level: e.target.value as any})}
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.application_deadline}
                  onChange={(e) => setNewJob({...newJob, application_deadline: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newJob.contact_email}
                  onChange={(e) => setNewJob({...newJob, contact_email: e.target.value})}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Post Job
            </button>
          </form>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.job_type}
            onChange={(e) => setFilters({...filters, job_type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.experience_level}
            onChange={(e) => setFilters({...filters, experience_level: e.target.value})}
          >
            <option value="all">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="Search location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.location === 'all' ? '' : filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value || 'all'})}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No jobs found matching your criteria</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getJobTypeColor(job.job_type)}`}>
                      {job.job_type}
                    </span>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getExperienceColor(job.experience_level)}`}>
                      {job.experience_level}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{job.company}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {job.location}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center text-sm text-gray-500">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        {job.salary_range}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-700">{job.description}</p>
                    {job.requirements && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Requirements:</p>
                        <p className="text-sm text-gray-600">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <a
                    href={`mailto:${job.contact_email}?subject=Application for ${job.title} at ${job.company}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Posted by {job.poster_name} on {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}