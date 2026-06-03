'use client'

import Link from 'next/link'
import { useMembershipAuth } from '@/contexts/MembershipAuthContext'
import {
  MicrophoneIcon, UserGroupIcon, CurrencyDollarIcon,
  MegaphoneIcon, CakeIcon, AcademicCapIcon,
  CalendarIcon, BriefcaseIcon, PhotoIcon
} from '@heroicons/react/24/outline'
import YorubaHero from '@/components/YorubaHero'


const features = [
  { name: 'Yearly Dues', href: '/dues', icon: CurrencyDollarIcon, description: 'Pay and track your annual membership dues', yoruba: 'San àwọn owó ẹgbẹ́', color: 'bg-green-500' },
  { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon, description: 'Latest news and updates from RADLAG', yoruba: 'Àwọn Ìròyìn', color: 'bg-blue-500' },
  { name: 'Member Directory', href: '/members', icon: UserGroupIcon, description: 'Connect with fellow RADLAG alumni', yoruba: 'Ìwé Àkọsílẹ̀ Ọmọ Ẹgbẹ́', color: 'bg-purple-500' },
  { name: 'Events Calendar', href: '/events', icon: CalendarIcon, description: 'Association events and activities', yoruba: 'Kàlẹ́ńdà Ìṣẹ̀lẹ̀', color: 'bg-indigo-500' },
  { name: 'Job Board', href: '/jobs', icon: BriefcaseIcon, description: 'Radio industry opportunities for alumni', yoruba: 'Àwọn Iṣẹ́', color: 'bg-teal-500' },
  { name: 'Photo Gallery', href: '/gallery', icon: PhotoIcon, description: 'Share and relive memories together', yoruba: 'Ibi Àwòrán Wa', color: 'bg-pink-500' },
  { name: 'Birthday Wishes', href: '/birthdays', icon: CakeIcon, description: 'Celebrate birthdays with fellow alumni', yoruba: 'Ìkí Ọjọ́ Ìbí', color: 'bg-rose-500' },
  { name: 'Tutorials', href: '/tutorials', icon: AcademicCapIcon, description: 'Radio production learning resources', yoruba: 'Àwọn Ẹ̀kọ́', color: 'bg-yellow-500' },
  { name: 'Radio Programs', href: '/programs', icon: MicrophoneIcon, description: 'Share and discover radio programs', yoruba: 'Àwọn Ètò Redio', color: 'bg-red-500' },
]

export default function Home() {
  const { member, loading } = useMembershipAuth()
    const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="bg-gray-50 max-w-7xl mx-auto">
         <YorubaHero onExploreClick={scrollToFeatures} />
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
        <YorubaHero onExploreClick={scrollToFeatures} />
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold">
            Ẹ káàbọ̀, {member.full_name}!
          </h2>
          <p className="text-amber-200 mt-1">
            Welcome back to RADLAG — your alumni portal
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">Member Portal</h3>
            <p className="text-gray-500 mt-2">Ohun gbogbo ní ibì kan — Everything in one place</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.name} href={feature.href}>
                <div className="flex flex-col bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all h-full cursor-pointer">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                  <p className="text-sm text-amber-600 mt-0.5">{feature.yoruba}</p>
                  <p className="text-sm text-gray-500 mt-2 flex-1">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
