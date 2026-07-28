/**
 * Topic registry — auto-discovers every .json file in this folder.
 *
 * To add a new subject: drop a new .json file in src/data/topics/
 * following the schema in DRUG_DATA_GUIDE.md. It shows up on the home
 * screen automatically. No other file needs to change.
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
]

function normalize(raw, fallbackId) {
  const drugs = Array.isArray(raw) ? raw : (raw.drugs || [])
  return {
    id:    raw.id    || fallbackId,
    label: raw.label || fallbackId,
    icon:  raw.icon  || '\u{1F48A}',
    blurb: raw.blurb || '',
    drugs,
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

/** Every drug across every topic, tagged with its source topic. */
export function allDrugsEverywhere() {
  return topics.flatMap(t => t.drugs.map(d => ({ ...d, _topic: t.id })))
}
