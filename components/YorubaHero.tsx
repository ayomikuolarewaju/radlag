// app/components/YorubaHero.tsx - Remove useAuth dependency
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface YorubaHeroProps {
  onExploreClick?: () => void
}

export default function YorubaHero({ onExploreClick }: YorubaHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [textIndex, setTextIndex] = useState(0)

  // Yoruba radio phrases
  const yorubaPhrases = [
    'Ẹ káàbọ̀ sí RADLAG',
    'Ile-iṣẹ́ Radio Alumni',
    'Gbohun ni Radio, Gbohun ni Ìmọ̀',
    'Ajumọṣe Radio School',
    'Ìmọ̀ Radio ni kíkọ́ wa',
    'Gbohùn-ṣe ni a kọ́'
  ]

  // Hero background images
  const heroImages = [
    {
      url: '/images/yoruba-radio-studio.jpg',
      alt: 'Traditional Yoruba radio studio'
    },
    {
      url: '/images/yoruba-microphone.jpg',
      alt: 'Microphone with Yoruba patterns'
    },
    {
      url: '/images/talking-drum-radio.jpg',
      alt: 'Talking drum in radio studio'
    },
    {
      url: '/images/yoruba-broadcast.jpg',
      alt: 'Yoruba radio broadcast session'
    }
  ]

  // Typing animation effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === yorubaPhrases[textIndex]) {
        setIsDeleting(true)
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false)
        setTextIndex((textIndex + 1) % yorubaPhrases.length)
      } else {
        const delta = isDeleting ? -1 : 1
        setDisplayText(prev => yorubaPhrases[textIndex].slice(0, prev.length + delta))
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, textIndex])

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
              <div className="w-full h-full bg-cover bg-center" style={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }} />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left Column */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-500/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-amber-200 text-sm font-medium">RADLAG Alumni Association</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  RADLAG
                </span>
              </h1>
              <div className="h-20 md:h-24">
                <p className="text-2xl md:text-4xl font-semibold text-amber-100">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-200 leading-relaxed max-w-lg">
              Ile-iṣẹ́ àwọn ọmọ ilé-ìwé Radio tí a kọ́ ní èdè Yorùbá. 
              Ẹ kópa nínú àjọ wa ká lè pàṣẹpọ̀, ká ránni lọ́wọ́, ká sì tún 
              àwọn ìmọ̀ radio wa ṣe.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-lg shadow-2xl"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 to-orange-600"></div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-600 to-orange-700 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Member Login
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-lg border-2 border-amber-500 text-amber-100 hover:bg-amber-500/20 transition-all duration-300 font-semibold backdrop-blur-sm"
              >
                Ṣàwárí (Explore)
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="hidden lg:block">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-amber-500/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-amber-400 mb-6 text-center">
                Àwọn Ọ̀nà Ìbánisọ̀rọ̀ Yorùbá
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                  <h4 className="font-bold text-white">Gbohun</h4>
                  <p className="text-sm text-gray-300">Microphone - Ohun elo akọkọ fun gbigba ohun</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                  <h4 className="font-bold text-white">Ìgbohunsáfẹ́fẹ́</h4>
                  <p className="text-sm text-gray-300">Broadcasting Equipment - Transmission tools</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                  <h4 className="font-bold text-white">Ohun Ède Yorùbá</h4>
                  <p className="text-sm text-gray-300">Yoruba Voice Techniques - Tonal language mastery</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-amber-500/30 text-center">
                <p className="text-amber-300 font-medium italic">
                  "Ohun tí a kọ́ nílé Radio kì í parun, ó ń dún lọ́kàn wa títí"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  )
}