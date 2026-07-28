import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { listClasses } from '../utils/classColors'

const ACCENTS = [
  'from-rose-100 to-rose-50 border-rose-200',
  'from-sky-100 to-sky-50 border-sky-200',
  'from-amber-100 to-amber-50 border-amber-200',
  'from-violet-100 to-violet-50 border-violet-200',
  'from-emerald-100 to-emerald-50 border-emerald-200',
  'from-orange-100 to-orange-50 border-orange-200',
  'from-teal-100 to-teal-50 border-teal-200',
  'from-indigo-100 to-indigo-50 border-indigo-200',
  'from-red-100 to-red-50 border-red-200',
  'from-lime-100 to-lime-50 border-lime-200',
  'from-fuchsia-100 to-fuchsia-50 border-fuchsia-200',
]

function topicBest(personalBests, topicId) {
  const entries = Object.entries(personalBests || {})
    .filter(([k]) => k.startsWith(topicId + '_'))
    .map(([, v]) => v)
  if (entries.length === 0) return null
  const best = entries.reduce((a, b) =>
    (b.bestScore / b.totalDrugs) > (a.bestScore / a.totalDrugs) ? b : a
  )
  return Math.round((best.bestScore / best.totalDrugs) * 100)
}

export default function TopicSelect({ topics, personalBests, onPick }) {
  const totalDrugs = useMemo(
    () => topics.reduce((n, t) => n + t.drugs.length, 0),
    [topics]
  )

  return (
    <div className="min-h-screen bg-amber-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-10">

        <div className="text-center mb-8">
          <div className="text-6xl mb-2">&#x1F48A;</div>
          <h1 className="text-4xl font-black text-gray-900">Drug Quiz</h1>
          <p className="text-amber-600 font-bold mt-1">USMLE Step 1 Pharmacology</p>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            {topics.length} subjects &middot; {totalDrugs} drugs
          </p>
        </div>

        <h2 className="text-gray-900 font-black text-lg mb-3">Choose a subject</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topics.map((t, i) => {
            const pct = topicBest(personalBests, t.id)
            const nClasses = listClasses(t.drugs).length
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => onPick(t)}
                className={`relative text-left rounded-3xl p-4 border-2 bg-gradient-to-br card-shadow
                  transition-transform hover:scale-[1.03] active:scale-100
                  ${ACCENTS[i % ACCENTS.length]}`}
              >
                {pct !== null && (
                  <div className="absolute top-3 right-3 bg-white/80 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pct}%
                  </div>
                )}
                <div className="text-4xl mb-2">{t.icon}</div>
                <p className="text-gray-900 font-black text-base leading-tight">{t.label}</p>
                <p className="text-gray-500 text-[11px] font-semibold mt-1 leading-snug line-clamp-2">
                  {t.blurb}
                </p>
                <p className="text-gray-400 text-[11px] font-bold mt-2">
                  {t.drugs.length} drugs &middot; {nClasses} classes
                </p>
              </motion.button>
            )
          })}
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 font-semibold">
          Inspired by{' '}
          <a href="https://apps.apple.com/us/app/amino-acid-quiz/id1301129866"
            target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
            Amino Acid Quiz
          </a>
        </p>
      </div>
    </div>
  )
}
