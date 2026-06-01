// app/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { 
  MicrophoneIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  MegaphoneIcon,
  CakeIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Yearly Dues',
    href: '/dues',
    icon: CurrencyDollarIcon,
    description: 'Pay and track your annual membership dues',
    color: 'bg-green-500'
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: MegaphoneIcon,
    description: 'Stay updated with latest association news',
    color: 'bg-blue-500'
  },
  {
    name: 'Member Directory',
    href: '/members',
    icon: UserGroupIcon,
    description: 'Connect with fellow RADLAG members',
    color: 'bg-purple-500'
  },
  {
    name: 'Birthday Wishes',
    href: '/birthdays',
    icon: CakeIcon,
    description: 'Celebrate birthdays with fellow alumni',
    color: 'bg-pink-500'
  },
  {
    name: 'Tutorials',
    href: '/tutorials',
    icon: AcademicCapIcon,
    description: 'Radio production techniques & resources',
    color: 'bg-yellow-500'
  },
  {
    name: 'Radio Programs',
    href: '/programs',
    icon: MicrophoneIcon,
    description: 'Share and discover radio programs',
    color: 'bg-red-500'
  }
]

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to RADLAG
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Radio School Alumni Association - Connect, Learn, and Grow together
            </p>
            {!user && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Member Login
                </Link>
                <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900">
                  Register as Alumnus <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Member Portal</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need in one place
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <Link key={feature.name} href={feature.href}>
                    <div className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow p-6 rounded-lg border border-gray-200">
                      <dt className="text-base font-semibold leading-7 text-gray-900">
                        <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  </Link>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}