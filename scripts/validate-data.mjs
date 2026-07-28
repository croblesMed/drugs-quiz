#!/usr/bin/env node
/**
 * Validates every topic file in src/data/topics/.
 *
 *   npm run validate
 *
 * Checks structure, required fields, unique ids and emoji, and flags
 * quality issues (very short fields, overlong tooltips, singleton classes
 * that make a "By Class" quiz impossible).
 * Exits with code 1 if any ERROR is found. WARNs do not fail the build.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname }             from 'node:path'
import { fileURLToPath }             from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'topics')

const REQUIRED_STRINGS = [
  'id', 'name', 'emoji', 'drugClass', 'primaryEffect', 'treatmentUsage',
  'mechanismOfAction', 'sideEffects', 'contraindications', 'tooltip',
]

// Fields the quiz can ask about — each needs enough distinct values to
// build six answer choices.
const QUIZ_FIELDS = [
  'name', 'drugClass', 'primaryEffect', 'treatmentUsage',
  'mechanismOfAction', 'sideEffects', 'contraindications',
]

let errors = 0
let warns  = 0

const err  = (m) => { errors++; console.log(`  \x1b[31mERROR\x1b[0m  ${m}`) }
const warn = (m) => { warns++;  console.log(`  \x1b[33mWARN \x1b[0m  ${m}`) }

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort()

if (files.length === 0) {
  console.log('No topic files found in src/data/topics/')
  process.exit(1)
}

console.log(`\nValidating ${files.length} topic file(s) in src/data/topics/\n`)

const globalIds = new Map()
let grandTotal  = 0

for (const file of files) {
  console.log(`\x1b[1m${file}\x1b[0m`)

  let raw
  try {
    raw = JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch (e) {
    err(`invalid JSON — ${e.message}`)
    console.log('')
    continue
  }

  // --- Topic-level structure ---
  if (Array.isArray(raw)) {
    warn('file is a bare array; wrap it in { id, label, icon, blurb, drugs: [...] }')
  }
  const drugs = Array.isArray(raw) ? raw : raw.drugs
  if (!Array.isArray(drugs)) { err('missing "drugs" array'); console.log(''); continue }

  if (!Array.isArray(raw)) {
    for (const k of ['id', 'label', 'icon']) {
      if (!raw[k]) err(`topic is missing "${k}"`)
    }
    const expectedId = file.replace('.json', '')
    if (raw.id && raw.id !== expectedId)
      warn(`topic id "${raw.id}" does not match filename "${expectedId}"`)
  }

  // --- Per-drug checks ---
  const ids     = new Map()
  const emojis  = new Map()
  const names   = new Map()

  drugs.forEach((d, i) => {
    const where = d?.name || d?.id || `index ${i}`

    if (typeof d !== 'object' || d === null) { err(`${where}: not an object`); return }

    for (const f of REQUIRED_STRINGS) {
      if (!d[f] || typeof d[f] !== 'string' || d[f].trim() === '')
        err(`${where}: missing or empty "${f}"`)
    }

    if (!Array.isArray(d.topicTags) || d.topicTags.length === 0)
      warn(`${where}: no topicTags — it will not appear in any "By Topic" filter`)

    // duplicates within the file
    if (d.id) {
      if (ids.has(d.id)) err(`duplicate id "${d.id}" (also used by ${ids.get(d.id)})`)
      else ids.set(d.id, where)

      // ids repeating across topics are fine — quizzes never mix topics
      if (!globalIds.has(d.id)) globalIds.set(d.id, file)
    }
    if (d.name) {
      if (names.has(d.name)) err(`duplicate name "${d.name}"`)
      else names.set(d.name, where)
    }
    if (d.emoji) {
      if (emojis.has(d.emoji)) warn(`duplicate emoji "${d.emoji}" shared by ${emojis.get(d.emoji)} and ${where}`)
      else emojis.set(d.emoji, where)
    }

    // quality heuristics
    if (d.tooltip && d.tooltip.split(/\s+/).length > 70)
      warn(`${where}: tooltip is ${d.tooltip.split(/\s+/).length} words (aim for under 60)`)
    if (d.mechanismOfAction && d.mechanismOfAction.split(/\s+/).length < 8)
      warn(`${where}: mechanismOfAction looks too short to be a good answer choice`)
  })

  // --- Quiz playability ---
  for (const field of QUIZ_FIELDS) {
    const distinct = new Set(drugs.map(d => d?.[field]).filter(Boolean)).size
    if (distinct < 6)
      err(`only ${distinct} distinct value(s) for "${field}" — need at least 6 to build answer choices`)
  }

  const classCounts = {}
  drugs.forEach(d => { if (d?.drugClass) classCounts[d.drugClass] = (classCounts[d.drugClass] || 0) + 1 })
  const tagCounts = {}
  drugs.forEach(d => (d?.topicTags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
  // Tags used by fewer than 3 drugs are hidden from the filter UI automatically
  // (see listTags in src/utils/classColors.js), so they are not an error.
  const usableTags = Object.values(tagCounts).filter(n => n >= 3).length
  if (usableTags < 3)
    warn(`only ${usableTags} tag(s) are used by 3+ drugs — the "By Topic" filter will be nearly empty`)

  grandTotal += drugs.length
  console.log(`  ${drugs.length} drugs · ${Object.keys(classCounts).length} classes · ${usableTags} filterable tags (${Object.keys(tagCounts).length} total)\n`)
}

console.log('─'.repeat(60))
console.log(`${grandTotal} drugs across ${files.length} topics`)
console.log(`${errors} error(s), ${warns} warning(s)`)

if (errors > 0) {
  console.log('\n\x1b[31mValidation failed.\x1b[0m Fix the errors above before building.\n')
  process.exit(1)
}
console.log('\n\x1b[32mAll topic files are valid.\x1b[0m\n')
