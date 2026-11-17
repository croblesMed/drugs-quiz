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
  'from-cyan-100 to-cyan-50 border-cyan-200',
  'from-pink-100 to-pink-50 border-pink-200',
  'from-green-100 to-green-50 border-green-200',
  'from-purple-100 to-purple-50 border-purple-200',
]

const SECTIONS = [
  { kind: 'drug',     title: 'Pharmacology', hint: 'Match a drug to any of its properties' },
  { kind: 'pathogen', title: 'Microbiology', hint: 'Match an organism to its lab findings, disease, or treatment' },
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

function TopicCard({ topic, index, pct, onPick }) {
  const nClasses = listClasses(topic.drugs).length
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onPick(topic)}
      className={`relative text-left rounded-3xl p-4 border-2 bg-gradient-to-br card-shadow
        transition-transform hover:scale-[1.03] active:scale-100
        ${ACCENTS[index % ACCENTS.length]}`}
    >
      {pct !== null && (
        <div className="absolute top-3 right-3 bg-white/80 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-full">
          {pct}%
        </div>
      )}
      <div className="text-4xl mb-2">{topic.icon}</div>
      <p className="text-gray-900 font-black text-base leading-tight">{topic.label}</p>
      <p className="text-gray-500 text-[11px] font-semibold mt-1 leading-snug line-clamp-2">
        {topic.blurb}
      </p>
      <p className="text-gray-400 text-[11px] font-bold mt-2">
        {topic.drugs.length} {topic.noun} &middot; {nClasses} {topic.classKey === 'category' ? 'groups' : 'classes'}
      </p>
    </motion.button>
  )
}

export default function TopicSelect({ topics, personalBests, onPick }) {
  const totals = useMemo(() => {
    const drugs     = topics.filter(t => t.kind !== 'pathogen').reduce((n, t) => n + t.drugs.length, 0)
    const organisms = topics.filter(t => t.kind === 'pathogen').reduce((n, t) => n + t.drugs.length, 0)
    return { drugs, organisms }
  }, [topics])

  let cardIndex = -1

  return (
    <div className="min-h-screen bg-amber-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-10">

        <div className="text-center mb-8">
          <div className="text-6xl mb-2">&#x1F48A;</div>
          <h1 className="text-4xl font-black text-gray-900">Step 1 Quiz</h1>
          <p className="text-amber-600 font-bold mt-1">Pharmacology &middot; Microbiology</p>
          <p className="text-gray-400 text-sm font-semibold mt-1">
            {totals.drugs} drugs &middot; {totals.organisms} organisms &middot; {topics.length} subjects
          </p>
        </div>

        {SECTIONS.map(section => {
          const list = topics.filter(t =>
            section.kind === 'drug' ? t.kind !== 'pathogen' : t.kind === 'pathogen'
          )
          if (list.length === 0) return null
          return (
            <div key={section.kind} className="mb-8">
              <h2 className="text-gray-900 font-black text-lg">{section.title}</h2>
              <p className="text-gray-400 text-xs font-semibold mb-3">{section.hint}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {list.map(t => {
                  cardIndex += 1
                  return (
                    <TopicCard
                      key={t.id}
                      topic={t}
                      index={cardIndex}
                      pct={topicBest(personalBests, t.id)}
                      onPick={onPick}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}

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
