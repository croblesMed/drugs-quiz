/**
 * Topic registry — auto-discovers every .json file in this folder.
 *
 * To add a new subject: drop a new .json file in src/data/topics/
 * following the schema in DRUG_DATA_GUIDE.md. It shows up on the home
 * screen automatically. No other file needs to change.
 *
 * Two entity kinds are supported:
 *   kind: "drug"     items live in `drugs`,     class field is `drugClass`
 *   kind: "pathogen" items live in `organisms`, class field is `category`
 *
 * Every item is normalized with a `_class` field so the rest of the app
 * never needs to know which kind it is dealing with.
 */

const modules = import.meta.glob('./*.json', { eager: true })

// Display order on the home screen. Any topic not listed here is
// appended alphabetically after these.
const ORDER = [
  'cardiology',
  'pulmonology',
  'neurology',
  'psychiatry',
  'infectious-disease',
  'endocrine',
  'gastrointestinal',
  'renal',
  'heme-onc',
  'rheum-immuno',
  'toxicology',
  'bacteriology',
  'virology',
  'mycology',
  'parasitology',
]

export const DRUG_ATTRS = [
  { key: 'name',              label: 'Drug Name' },
  { key: 'drugClass',         label: 'Drug Class' },
  { key: 'primaryEffect',     label: 'Primary Effect' },
  { key: 'treatmentUsage',    label: 'Treatment Usage' },
  { key: 'mechanismOfAction', label: 'Mechanism of Action' },
  { key: 'sideEffects',       label: 'Side Effects' },
  { key: 'contraindications', label: 'Contraindications' },
]

export const PATHOGEN_ATTRS = [
  { key: 'name',            label: 'Organism' },
  { key: 'category',        label: 'Category' },
  { key: 'labFeatures',     label: 'Lab & Morphology' },
  { key: 'manifestations',  label: 'Manifestations' },
  { key: 'treatment',       label: 'Treatment' },
  { key: 'transmission',    label: 'Transmission' },
  { key: 'virulenceFactor', label: 'Virulence Factor' },
]

const CLASS_KEY = { drug: 'drugClass', pathogen: 'category' }

function normalize(raw, fallbackId) {
  const kind     = raw.kind || 'drug'
  const classKey = raw.classKey || CLASS_KEY[kind] || 'drugClass'
  const items    = Array.isArray(raw) ? raw : (raw.drugs || raw.organisms || raw.entries || [])

  return {
    id:        raw.id    || fallbackId,
    label:     raw.label || fallbackId,
    icon:      raw.icon  || '\u{1F48A}',
    blurb:     raw.blurb || '',
    kind,
    classKey,
    // `quizAttrs` can be overridden per topic; otherwise it follows the kind
    quizAttrs: raw.quizAttrs || (kind === 'pathogen' ? PATHOGEN_ATTRS : DRUG_ATTRS),
    // noun used in UI copy ("12 drugs" vs "12 organisms")
    noun:      raw.noun || (kind === 'pathogen' ? 'organisms' : 'drugs'),
    drugs:     items.map(d => ({ ...d, _class: d[classKey] })),
  }
}

const topics = Object.entries(modules).map(([path, mod]) => {
  const fallbackId = path.replace('./', '').replace('.json', '')
  return normalize(mod.default ?? mod, fallbackId)
})

topics.sort((a, b) => {
  const ia = ORDER.indexOf(a.id)
  const ib = ORDER.indexOf(b.id)
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.label.localeCompare(b.label)
})

export default topics

export function getTopic(id) {
  return topics.find(t => t.id === id) || null
}
