/**
 * Distractor selection algorithm.
 *
 * Returns an array of 6 answer objects: { value, drugIds, isCorrect, label }
 * Multiple items can share the same value → all are marked isCorrect.
 *
 * Works for any entity kind. Items carry a normalized `_class` field
 * (drugClass for drugs, category for pathogens) assigned in
 * src/data/topics/index.js, so this file needs no knowledge of the kind.
 */

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildAnswerChoices(currentDrug, allDrugs, answerAttr) {
  const correctValue = currentDrug[answerAttr]
  if (!correctValue) return []

  // --- Step 1: find everything sharing this exact value (collisions = also correct) ---
  const sharedCorrect = allDrugs.filter(
    d => d.id !== currentDrug.id && d[answerAttr] === correctValue
  )
  const correctIds = new Set([currentDrug.id, ...sharedCorrect.map(d => d.id)])

  const correctEntry = {
    value: correctValue,
    drugIds: [...correctIds],
    isCorrect: true,
    label: answerAttr === 'name'
      ? `${currentDrug.emoji} ${correctValue}`
      : correctValue
  }

  // --- Step 2: build a pool of distractor candidates (wrong answers only) ---
  const wrongDrugs = allDrugs.filter(d => !correctIds.has(d.id))

  // Same class first (hardest), then shared tag, then anything else
  const sameClass = wrongDrugs.filter(d => d._class === currentDrug._class)
  const sameTags  = wrongDrugs.filter(d =>
    !sameClass.includes(d) &&
    d.topicTags?.some(t => currentDrug.topicTags?.includes(t))
  )
  const rest = wrongDrugs.filter(d => !sameClass.includes(d) && !sameTags.includes(d))

  const prioritized = [...shuffle(sameClass), ...shuffle(sameTags), ...shuffle(rest)]

  // Deduplicate by answer value (each unique value appears once)
  const seenValues  = new Set([correctValue])
  const distractors = []

  for (const drug of prioritized) {
    if (distractors.length >= 5) break
    const val = drug[answerAttr]
    if (!val || seenValues.has(val)) continue
    seenValues.add(val)
    distractors.push({
      value: val,
      drugIds: [drug.id],
      isCorrect: false,
      label: answerAttr === 'name' ? `${drug.emoji} ${drug.name}` : val
    })
  }

  // --- Step 3: shuffle the final 6 ---
  return shuffle([correctEntry, ...distractors])
}

// Re-exported for convenience. Prefer `topic.quizAttrs`, which is
// per-subject; these are the defaults used when a topic omits it.
export { DRUG_ATTRS, PATHOGEN_ATTRS } from '../data/topics'

/** @deprecated use topic.quizAttrs — kept so older imports keep working */
export const QUIZ_ATTRS = [
  { key: 'name',              label: 'Drug Name' },
  { key: 'drugClass',         label: 'Drug Class' },
  { key: 'primaryEffect',     label: 'Primary Effect' },
  { key: 'treatmentUsage',    label: 'Treatment Usage' },
  { key: 'mechanismOfAction', label: 'Mechanism of Action' },
  { key: 'sideEffects',       label: 'Side Effects' },
  { key: 'contraindications', label: 'Contraindications' },
]
