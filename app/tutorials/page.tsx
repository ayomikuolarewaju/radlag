// app/tutorials/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PlayIcon, DocumentTextIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
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

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    fetchTutorials()
  }, [])

  useEffect(() => {
    filterTutorials()
  }, [selectedCategory, selectedDifficulty, tutorials])

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error fetching tutorials')
    } else {
      setTutorials(data || [])
      setFilteredTutorials(data || [])
    }
    setLoading(false)
  }

  const filterTutorials = () => {
    let filtered = tutorials
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty)
    }
    setFilteredTutorials(filtered)
  }

  const categories = ['all', 'Audio Production', 'Radio Scripting', 'Voice Training', 'Podcasting', 'Broadcast Equipment']
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Radio Production Tutorials</h1>
        <p className="mt-2 text-gray-600">Learn and master radio production techniques</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTutorials.map((tutorial) => (
          <div key={tutorial.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {tutorial.type === 'video' ? (
                    <VideoCameraIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                  )}
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    tutorial.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    tutorial.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tutorial.difficulty}
                  </span>
                </div>
                {tutorial.duration && (
                  <span className="text-sm text-gray-500">{tutorial.duration}</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
              <p className="text-gray-600 mb-4">{tutorial.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{tutorial.category}</span>
                <a
                  href={tutorial.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <PlayIcon className="h-5 w-5 mr-1" />
                  Start Learning
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}