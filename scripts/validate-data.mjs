#!/usr/bin/env node
/**
 * Validates every topic file in src/data/topics/.
 *
 *   npm run validate
 *
 * Handles both entity kinds:
 *   kind: "drug"     items in `drugs`,     class field `drugClass`
 *   kind: "pathogen" items in `organisms`, class field `category`
 *
 * Checks structure, required fields, unique ids, and flags quality issues.
 * Exits 1 if any ERROR is found. WARNs do not fail the build.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname }             from 'node:path'
import { fileURLToPath }             from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'topics')

const SCHEMA = {
  drug: {
    itemsKey: 'drugs',
    classKey: 'drugClass',
    fields: ['id', 'name', 'emoji', 'drugClass', 'primaryEffect', 'treatmentUsage',
             'mechanismOfAction', 'sideEffects', 'contraindications', 'tooltip'],
    quizFields: ['name', 'drugClass', 'primaryEffect', 'treatmentUsage',
                 'mechanismOfAction', 'sideEffects', 'contraindications'],
    longField: 'mechanismOfAction',
  },
  pathogen: {
    itemsKey: 'organisms',
    classKey: 'category',
    fields: ['id', 'name', 'emoji', 'category', 'labFeatures', 'manifestations',
             'treatment', 'transmission', 'virulenceFactor', 'tooltip'],
    quizFields: ['name', 'category', 'labFeatures', 'manifestations',
                 'treatment', 'transmission', 'virulenceFactor'],
    longField: 'labFeatures',
  },
}

let errors = 0
let warns  = 0
const err  = (m) => { errors++; console.log(`  \x1b[31mERROR\x1b[0m  ${m}`) }
const warn = (m) => { warns++;  console.log(`  \x1b[33mWARN \x1b[0m  ${m}`) }

const files = readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
if (files.length === 0) { console.log('No topic files found'); process.exit(1) }

console.log(`\nValidating ${files.length} topic file(s) in src/data/topics/\n`)

let grandTotal = 0
const summary  = []

for (const file of files) {
  console.log(`\x1b[1m${file}\x1b[0m`)

  let raw
  try { raw = JSON.parse(readFileSync(join(DIR, file), 'utf8')) }
  catch (e) { err(`invalid JSON — ${e.message}`); console.log(''); continue }

  if (Array.isArray(raw)) {
    warn('file is a bare array; wrap it in { id, label, icon, blurb, drugs: [...] }')
    raw = { drugs: raw }
  }

  const kind   = raw.kind || 'drug'
  const schema = SCHEMA[kind]
  if (!schema) { err(`unknown kind "${kind}" — must be "drug" or "pathogen"`); console.log(''); continue }

  const items = raw[schema.itemsKey] || raw.drugs || raw.organisms || raw.entries
  if (!Array.isArray(items)) { err(`missing "${schema.itemsKey}" array`); console.log(''); continue }

  for (const k of ['id', 'label', 'icon']) if (!raw[k]) err(`topic is missing "${k}"`)
  const expectedId = file.replace('.json', '')
  if (raw.id && raw.id !== expectedId)
    warn(`topic id "${raw.id}" does not match filename "${expectedId}"`)
  if (raw.quizAttrs && !Array.isArray(raw.quizAttrs))
    err('"quizAttrs" must be an array of { key, label } objects')

  const ids = new Map(), names = new Map(), emojis = new Map()

  items.forEach((d, i) => {
    const where = d?.name || d?.id || `index ${i}`
    if (typeof d !== 'object' || d === null) { err(`${where}: not an object`); return }

    for (const f of schema.fields) {
      if (!d[f] || typeof d[f] !== 'string' || d[f].trim() === '')
        err(`${where}: missing or empty "${f}"`)
    }

    // flag fields belonging to the other schema — usually a copy-paste slip
    const otherKind = kind === 'drug' ? 'pathogen' : 'drug'
    for (const f of SCHEMA[otherKind].fields) {
      if (!schema.fields.includes(f) && d[f] !== undefined)
        warn(`${where}: has "${f}", which belongs to the ${otherKind} schema — is that intended?`)
    }

    if (!Array.isArray(d.topicTags) || d.topicTags.length === 0)
      warn(`${where}: no topicTags — it will not appear in any "By Topic" filter`)

    if (d.id) {
      if (ids.has(d.id)) err(`duplicate id "${d.id}" (also used by ${ids.get(d.id)})`)
      else ids.set(d.id, where)
    }
    if (d.name) {
      if (names.has(d.name)) err(`duplicate name "${d.name}"`)
      else names.set(d.name, where)
    }
    if (d.emoji) {
      if (emojis.has(d.emoji)) warn(`duplicate emoji "${d.emoji}" shared by ${emojis.get(d.emoji)} and ${where}`)
      else emojis.set(d.emoji, where)
    }

    if (d.tooltip && d.tooltip.split(/\s+/).length > 70)
      warn(`${where}: tooltip is ${d.tooltip.split(/\s+/).length} words (aim for under 60)`)
    const lf = d[schema.longField]
    if (lf && lf.split(/\s+/).length < 8)
      warn(`${where}: "${schema.longField}" looks too short to be a good answer choice`)
  })

  // Quiz playability: each quizzable field needs 6+ distinct values
  const attrKeys = raw.quizAttrs ? raw.quizAttrs.map(a => a.key) : schema.quizFields
  for (const field of attrKeys) {
    const distinct = new Set(items.map(d => d?.[field]).filter(Boolean)).size
    if (distinct < 6)
      err(`only ${distinct} distinct value(s) for "${field}" — need at least 6 to build answer choices`)
  }

  const classCounts = {}
  items.forEach(d => { const c = d?.[schema.classKey]; if (c) classCounts[c] = (classCounts[c] || 0) + 1 })

  const tagCounts = {}
  items.forEach(d => (d?.topicTags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
  // Tags used by fewer than 3 items are hidden from the filter UI automatically
  // (see listTags in src/utils/classColors.js), so they are not an error.
  const usableTags = Object.values(tagCounts).filter(n => n >= 3).length
  if (usableTags < 3)
    warn(`only ${usableTags} tag(s) are used by 3+ items — the "By Topic" filter will be nearly empty`)

  grandTotal += items.length
  summary.push({ file, kind, n: items.length, classes: Object.keys(classCounts).length, usableTags, attrs: attrKeys.length })
  console.log(`  ${kind} · ${items.length} items · ${Object.keys(classCounts).length} ${schema.classKey === 'category' ? 'categories' : 'classes'} · ${usableTags} filterable tags · ${attrKeys.length} quiz modes\n`)
}

console.log('─'.repeat(70))
const drugs     = summary.filter(s => s.kind === 'drug').reduce((n, s) => n + s.n, 0)
const pathogens = summary.filter(s => s.kind === 'pathogen').reduce((n, s) => n + s.n, 0)
console.log(`${grandTotal} items across ${files.length} topics  (${drugs} drugs, ${pathogens} organisms)`)
console.log(`${errors} error(s), ${warns} warning(s)`)

if (errors > 0) {
  console.log('\n\x1b[31mValidation failed.\x1b[0m Fix the errors above before building.\n')
  process.exit(1)
}
console.log('\n\x1b[32mAll topic files are valid.\x1b[0m\n')
