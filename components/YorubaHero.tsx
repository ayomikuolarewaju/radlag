'use client'
// components/YorubaHero.tsx

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface YorubaHeroProps {
  onExploreClick?: () => void
}

const YORUBA_PHRASES = [
  'Ẹ káàbọ̀ sí RADLAG',
  'Ile-iṣẹ́ Radio Alumni',
  'Gbohun ni Radio, Gbohun ni Ìmọ̀',
  'Ajumọṣe Radio School',
  'Ìmọ̀ Radio ni kíkọ́ wa',
  'Gbohùn-ṣe ni a kọ́',
]

const HERO_IMAGES = [
  { url: '/images/yoruba-radio-studio.jpg',  alt: 'Traditional Yoruba radio studio' },
  { url: '/images/yoruba-microphone.jpg',    alt: 'Microphone with Yoruba patterns' },
  { url: '/images/talking-drum-radio.jpg',   alt: 'Talking drum in radio studio' },
  { url: '/images/yoruba-broadcasters.jpg',     alt: 'Yoruba radio broadcast session' },
]

export default function YorubaHero({ onExploreClick }: YorubaHeroProps) {
  const [imageIndex, setImageIndex]   = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting]   = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)

  // Rotate background images every 5 s
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Typewriter effect — arrays are module-level constants so no stale closure
  useEffect(() => {
    const currentPhrase = YORUBA_PHRASES[phraseIndex]
    const delay = isDeleting ? 60 : 100

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentPhrase) {
        // Pause at full phrase before deleting
        setTimeout(() => setIsDeleting(true), 1500)
        return
      }
      if (isDeleting && displayText === '') {
        setIsDeleting(false)
        setPhraseIndex(prev => (prev + 1) % YORUBA_PHRASES.length)
        return
      }
      setDisplayText(prev =>
        isDeleting
          ? prev.slice(0, -1)
          : currentPhrase.slice(0, prev.length + 1)
      )
    }, delay)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, phraseIndex])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900">

      {/* Rotating background images */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === imageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${image.url})` }}
              role="img"
              aria-label={image.alt}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20 w-full">

          {/* Left — main CTA */}
          <div className="text-white space-y-8">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-amber-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-500/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <span className="text-amber-200 text-sm font-medium">RADLAG Alumni Association</span>
            </div>

            {/* Wordmark + typewriter */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  RADLAG
                </span>
              </h1>
              <div className="h-20 md:h-24">
                <p className="text-2xl md:text-4xl font-semibold text-amber-100">
                  {displayText}
                  <span className="animate-pulse ml-0.5">|</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Member Login
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              {onExploreClick && (
                <button
                  onClick={onExploreClick}
                  className="px-6 py-3 rounded-lg border-2 border-amber-500 text-amber-100 hover:bg-amber-500/20 transition-all duration-300 font-semibold backdrop-blur-sm"
                >
                  Ṣàwárí (Explore)
                </button>
              )}
            </div>
          </div>

          {/* Right — Yoruba radio terms card (desktop only) */}
          <div className="hidden lg:block">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-amber-500/30 shadow-2xl">
              <h3 className="text-xl font-bold text-amber-400 mb-6 text-center">
                Àwọn Ọ̀rọ̀ Radio Yorùbá
              </h3>
              <div className="space-y-3">
                {[
                  { word: 'Gbohun',           desc: 'Microphone — Ohun elo akọkọ fun gbigba ohun' },
                  { word: 'Ìgbohunsáfẹ́fẹ́', desc: 'Broadcasting — Ìtẹ̀kàde ohun si gbogbo ibi' },
                  { word: 'Ohun Ède Yorùbá',  desc: 'Yoruba Voice — Tonal language mastery' },
                ].map(item => (
                  <div key={item.word} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <p className="font-bold text-white">{item.word}</p>
                    <p className="text-sm text-gray-300 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-amber-500/30 text-center">
                <p className="text-amber-300 text-sm font-medium italic">
                  "Ohun tí a kọ́ nílé Radio kì í parun, ó ń dún lọ́kàn wa títí"
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave transition to page body */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path fill="#f9fafb" fillOpacity="1" d="M0,40L360,80L720,30L1080,80L1440,40L1440,120L0,120Z" />
        </svg>
      </div>
    </div>
  )
}
