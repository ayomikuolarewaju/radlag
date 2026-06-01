'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PlayIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import PageHero from '@/components/PageHero'
import toast from 'react-hot-toast'

interface Tutorial {
  id: string
  title: string
  description: string
  type: 'video' | 'article'
  content_url: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  created_at: string
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

const CATEGORIES = ['all', 'Audio Production', 'Radio Scripting', 'Voice Training', 'Podcasting', 'Broadcast Equipment']
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced']

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) toast.error('Error fetching tutorials')
      else setTutorials(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = tutorials.filter(t =>
    (category === 'all' || t.category === category) &&
    (difficulty === 'all' || t.difficulty === difficulty)
  )

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <>
      <div className="relative">
        <PageHero
          title="Tutorials"
          titleYoruba="Àwọn Ẹ̀kọ́"
          description="Master radio production techniques, from basics to advanced" subtitle={''} subtitleYoruba={''} descriptionYoruba={''} imageType={'tutorials'}        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500"
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <p className="text-sm text-gray-500 py-2">{filtered.length} tutorials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {t.type === 'video'
                      ? <VideoCameraIcon className="h-5 w-5 text-red-500" />
                      : <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                    }
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${difficultyColors[t.difficulty]}`}>
                      {t.difficulty}
                    </span>
                  </div>
                  {t.duration && <span className="text-xs text-gray-500">{t.duration}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{t.category}</p>
                <p className="text-sm text-gray-600 mb-4">{t.description}</p>
                <a
                  href={t.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  <PlayIcon className="h-4 w-4" />
                  Start Learning
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">No tutorials found for this filter.</div>
        )}
      </div>
    </>
  )
}
