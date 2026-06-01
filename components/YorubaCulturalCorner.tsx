'use client'

import { useState } from 'react'

interface YorubaTerm {
  word: string
  meaning: string
  radioContext: string
}

const yorubaRadioTerms: YorubaTerm[] = [
  { word: 'Ìgbohunsáfẹ́fẹ́', meaning: 'Radio Broadcasting', radioContext: 'Ìtẹ̀kàde ohun si gbogbo ibi — Transmission of sound everywhere' },
  { word: 'Akọ́ṣẹ́mọ́ṣẹ́', meaning: 'Radio Producer', radioContext: 'Ẹni tó ń ṣe àkóso ètò redio — Person who manages radio programs' },
  { word: 'Agbohùn', meaning: 'Announcer / Presenter', radioContext: 'Ẹni tí ń gbohùn lórí redio — Voice on radio' },
  { word: 'Ìfọ̀rọ̀wérọ̀', meaning: 'Discussion / Interview', radioContext: 'Ìjíròrò lórí redio — Radio discussion' },
  { word: 'Alága Ìgbìmọ̀', meaning: 'Board Chair', radioContext: 'Aṣáájú àjọ wa — Our association leader' },
]

export default function YorubaCulturalCorner() {
  const [selectedTerm, setSelectedTerm] = useState<YorubaTerm | null>(null)

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-900">Igun Àṣà Yorùbá</h2>
        <p className="text-amber-700 text-sm mt-1">Yoruba Cultural Corner — Radio Terminology</p>
        <div className="w-16 h-1 bg-amber-500 mx-auto mt-3 rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {yorubaRadioTerms.map((term, i) => (
            <button
              key={i}
              onClick={() => setSelectedTerm(term)}
              className={`w-full text-left p-4 rounded-lg shadow-sm transition-all ${
                selectedTerm?.word === term.word ? 'bg-amber-100 border-2 border-amber-400' : 'bg-white hover:bg-amber-50 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-amber-800">{term.word}</p>
                  <p className="text-sm text-gray-500">{term.meaning}</p>
                </div>
                <span className="text-amber-400">›</span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {selectedTerm ? (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl">📻</span>
                <h3 className="text-xl font-bold text-amber-800 mt-2">{selectedTerm.word}</h3>
                <p className="text-amber-600 font-medium">{selectedTerm.meaning}</p>
              </div>
              <div className="border-t border-amber-100 pt-4">
                <p className="text-sm text-gray-700"><span className="font-semibold text-amber-700">Radio context: </span>{selectedTerm.radioContext}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <span className="text-5xl">🎙️</span>
              <p className="mt-3 text-sm">Select a term to learn its radio context</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-amber-100/70 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-amber-800">Òwe Yorùbá — Today's Proverb</p>
        <p className="text-amber-900 italic mt-1 text-sm">"Ilé ìgbohunsáfẹ́fẹ́ ló ti ń kọ́ni lẹ́kọ̀ọ́ tí a fi ń di ògbóni."</p>
        <p className="text-xs text-amber-700 mt-1">It's from radio school that we learn the skills that make us experts.</p>
      </div>
    </div>
  )
}
