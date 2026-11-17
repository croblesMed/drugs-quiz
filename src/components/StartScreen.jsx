import { useState, useMemo } from 'react'
import { buildClassColorMap, listClasses, listTags } from '../utils/classColors'

function filterModes(noun, classKey) {
  return [
    { id: 'all',   label: noun === 'organisms' ? 'All Organisms' : 'All Drugs' },
    { id: 'class', label: classKey === 'category' ? 'By Category' : 'By Class' },
    { id: 'tag',   label: 'By Topic' },
  ]
}

export default function StartScreen({ topic, personalBests, onStart, onBack }) {
  const allDrugs  = topic.drugs
  const ATTRS     = topic.quizAttrs
  const NOUN      = topic.noun                 // "drugs" | "organisms"
  const IDENTITY  = ATTRS[0].key               // always 'name'
  const IDLABEL   = ATTRS[0].label             // "Drug Name" | "Organism"
  const CLASS_KEY = topic.classKey             // 'drugClass' | 'category'

  const [filterMode,      setFilterMode]      = useState('all')
  const [selectedClasses, setSelectedClasses] = useState(new Set())
  const [selectedTags,    setSelectedTags]    = useState(new Set())
  const [questionAttr,    setQuestionAttr]    = useState('name')
  const [answerAttr,      setAnswerAttr]      = useState(CLASS_KEY)
  const [startError,      setStartError]      = useState('')

  const colorMap         = useMemo(() => buildClassColorMap(allDrugs), [allDrugs])
  const availableClasses = useMemo(() => listClasses(allDrugs), [allDrugs])
  const availableTags    = useMemo(() => listTags(allDrugs),    [allDrugs])

  const classCounts = useMemo(() => {
    const c = {}
    allDrugs.forEach(d => { if (d._class) c[d._class] = (c[d._class] || 0) + 1 })
    return c
  }, [allDrugs])

  const tagCounts = useMemo(() => {
    const c = {}
    allDrugs.forEach(d => (d.topicTags || []).forEach(t => { c[t] = (c[t] || 0) + 1 }))
    return c
  }, [allDrugs])

  const filteredDrugs = useMemo(() => {
    if (filterMode === 'class' && selectedClasses.size > 0)
      return allDrugs.filter(d => selectedClasses.has(d._class))
    if (filterMode === 'tag' && selectedTags.size > 0)
      return allDrugs.filter(d => d.topicTags?.some(t => selectedTags.has(t)))
    return allDrugs
  }, [allDrugs, filterMode, selectedClasses, selectedTags])

  function toggleClass(name) {
    setSelectedClasses(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })
  }
  function toggleTag(tag) {
    setSelectedTags(prev => { const n = new Set(prev); n.has(tag) ? n.delete(tag) : n.add(tag); return n })
  }
  function clearSelections() { setSelectedClasses(new Set()); setSelectedTags(new Set()) }

  const topScores = useMemo(() => {
    if (!personalBests) return []
    return Object.entries(personalBests)
      .filter(([key]) => key.startsWith(topic.id + '_'))
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => (b.bestScore / b.totalDrugs) - (a.bestScore / a.totalDrugs))
      .slice(0, 5)
  }, [personalBests, topic.id])

  function formatKey(key) {
    try {
      const after = key.includes('__') ? key.split(/__(.+)/)[1] : key
      const parts = after.split('__to__')
      const q = ATTRS.find(a => a.key === parts[0])?.label || parts[0]
      const a = ATTRS.find(a => a.key === parts[1])?.label || parts[1]
      return `${q} -> ${a}`
    } catch { return key }
  }

  function handleStart() {
    setStartError('')
    if (questionAttr !== IDENTITY && answerAttr !== IDENTITY) {
      setStartError(`One of Question or Answer must be "${IDLABEL}" to start.`)
      return
    }
    if (questionAttr === answerAttr) {
      setStartError('Question and Answer types must differ.')
      return
    }
    if (filteredDrugs.length < 3) {
      setStartError(`Select at least 3 ${NOUN} to start.`)
      return
    }
    const filterKey =
      filterMode === 'class' ? [...selectedClasses].sort().join('+') || 'all'
      : filterMode === 'tag' ? [...selectedTags].sort().join('+') || 'all'
      : 'all'
    onStart(filteredDrugs, {
      questionAttr, answerAttr, topicId: topic.id, filter: filterKey,
      quizAttrs: ATTRS, noun: NOUN, identityKey: IDENTITY,
    })
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-16">
      <div className="max-w-xl mx-auto px-4 pt-6">

        <button onClick={onBack}
          className="text-gray-400 hover:text-gray-700 text-sm font-bold mb-4 transition-colors">
          &larr; All subjects
        </button>

        <div className="text-center mb-7">
          <div className="text-6xl mb-2">{topic.icon}</div>
          <h1 className="text-4xl font-black text-gray-900">{topic.label}</h1>
          <p className="text-amber-600 font-bold mt-1">{allDrugs.length} {NOUN} &middot; USMLE Step 1</p>
        </div>

        {topScores.length > 0 && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 mb-5 card-shadow">
            <h2 className="text-amber-600 text-xs font-black uppercase tracking-wider mb-3">&#x1F3C6; Personal Bests</h2>
            <div className="space-y-2">
              {topScores.map(s => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-semibold">{formatKey(s.key)}</span>
                  <span className="text-gray-900 font-black text-sm">
                    {s.bestScore}/{s.totalDrugs}
                    <span className="text-gray-400 font-semibold text-xs ml-1">
                      ({Math.round((s.bestScore / s.totalDrugs) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 mb-4 card-shadow">
          <h2 className="text-gray-900 font-black text-lg mb-3">{NOUN === 'organisms' ? 'Organism Set' : 'Drug Set'}</h2>
          <div className="flex gap-2 mb-4">
            {filterModes(NOUN, CLASS_KEY).map(m => (
              <button key={m.id} onClick={() => { setFilterMode(m.id); clearSelections() }}
                className={`flex-1 py-2 rounded-xl text-sm font-black transition-colors ${
                  filterMode === m.id ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'}`}>
                {m.label}
              </button>
            ))}
          </div>

          {(filterMode === 'class' || filterMode === 'tag') && (
            <p className="text-gray-400 text-xs font-semibold mb-2">
              Tap to select as many as you like &middot; need 3+ {NOUN} to play
            </p>
          )}

          {filterMode === 'class' && (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {availableClasses.map(name => {
                const sel = selectedClasses.has(name)
                return (
                  <button key={name} onClick={() => toggleClass(name)}
                    className={`text-xs px-3 py-1.5 rounded-full font-black transition-all border-2 ${
                      sel ? `${colorMap[name]} text-white border-transparent scale-105`
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                    {name}
                    <span className={sel ? 'text-white/70 ml-1' : 'text-gray-400 ml-1'}>{classCounts[name]}</span>
                  </button>
                )
              })}
            </div>
          )}

          {filterMode === 'tag' && (
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {availableTags.map(tag => {
                const sel = selectedTags.has(tag)
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-black capitalize transition-all border-2 ${
                      sel ? 'bg-amber-400 text-white border-transparent scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                    {tag}
                    <span className={sel ? 'text-white/70 ml-1' : 'text-gray-400 ml-1'}>{tagCounts[tag]}</span>
                  </button>
                )
              })}
            </div>
          )}

          <p className="text-gray-500 text-sm mt-3 font-semibold">
            <span className="text-gray-900 font-black">{filteredDrugs.length}</span> {NOUN} selected
          </p>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 mb-4 card-shadow">
          <h2 className="text-gray-900 font-black text-lg mb-1">Quiz Mode</h2>
          <p className="text-gray-400 text-xs font-semibold mb-4">
            Pick any combination. One side must be {IDLABEL} to play.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-600 text-xs font-black uppercase tracking-wider mb-2">Question (shown)</label>
              <div className="space-y-1.5">
                {ATTRS.map(attr => (
                  <button key={attr.key} onClick={() => setQuestionAttr(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-colors border-2 ${
                      questionAttr === attr.key ? 'bg-amber-400 text-white border-transparent'
                        : 'bg-amber-50 text-gray-600 border-amber-100 hover:border-amber-300'}`}>
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-green-600 text-xs font-black uppercase tracking-wider mb-2">Answer (pick 1 of 6)</label>
              <div className="space-y-1.5">
                {ATTRS.map(attr => (
                  <button key={attr.key} onClick={() => setAnswerAttr(attr.key)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-colors border-2 ${
                      answerAttr === attr.key ? 'bg-green-500 text-white border-transparent'
                        : 'bg-green-50 text-gray-600 border-green-100 hover:border-green-300'}`}>
                    {attr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center bg-amber-50 rounded-2xl py-2 px-3 border border-amber-200">
            <span className="text-amber-700 font-black text-sm">{ATTRS.find(a => a.key === questionAttr)?.label}</span>
            <span className="text-gray-400 font-bold text-sm"> &rarr; </span>
            <span className="text-green-700 font-black text-sm">{ATTRS.find(a => a.key === answerAttr)?.label}</span>
          </div>
        </div>

        {startError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mb-3 text-center">
            <p className="text-red-600 text-sm font-black">{startError}</p>
          </div>
        )}

        <button onClick={handleStart}
          className="w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white font-black text-xl py-5 rounded-3xl transition-colors card-shadow-lg">
          Play &rarr;
        </button>
      </div>
    </div>
  )
}
