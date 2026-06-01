'use client'

interface PageHeroProps {
  title: string
  titleYoruba: string
  description: string
}

export default function PageHero({ title, titleYoruba, description }: PageHeroProps) {
  return (
    <div className="bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-1 bg-amber-500 rounded-full" />
          <div className="w-3 h-3 bg-amber-500 rounded-full mx-2 -mt-1" />
          <div className="w-16 h-1 bg-amber-500 rounded-full" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-lg text-amber-200 mb-3">{titleYoruba}</p>
        <p className="text-base text-gray-200 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full">
          <path fill="#f9fafb" fillOpacity="1" d="M0,40L360,60L720,30L1080,60L1440,40L1440,80L0,80Z" />
        </svg>
      </div>
    </div>
  )
}
