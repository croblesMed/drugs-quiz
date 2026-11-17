/**
 * Deterministic color assignment for drug classes and pathogen categories.
 *
 * You do NOT need to define colors anywhere. Add a drug with any
 * `drugClass` string and it automatically gets a stable, unique color
 * within its topic. Classes are sorted alphabetically then assigned
 * from the palette in order, so colors only shift if you add a class
 * that sorts earlier — which is fine, they are purely decorative.
 */

const PALETTE = [
  ['blue', '500'],    ['teal', '500'],    ['cyan', '600'],    ['amber', '500'],
  ['orange', '500'],  ['sky', '500'],     ['indigo', '500'],  ['violet', '500'],
  ['red', '500'],     ['rose', '500'],    ['pink', '500'],    ['green', '600'],
  ['emerald', '600'], ['lime', '600'],    ['yellow', '600'],  ['fuchsia', '600'],
  ['purple', '500'],  ['slate', '500'],   ['blue', '700'],    ['teal', '700'],
  ['red', '700'],     ['indigo', '700'],  ['orange', '700'],  ['emerald', '800'],
  ['pink', '700'],    ['violet', '700'],  ['cyan', '800'],    ['amber', '700'],
  ['green', '800'],   ['rose', '700'],    ['sky', '700'],     ['lime', '800'],
  ['purple', '700'],  ['fuchsia', '800'], ['slate', '600'],   ['yellow', '800'],
]

/**
 * @param {Array<{_class: string}>} drugs
 * @returns {Record<string, string>} map of class name -> tailwind bg class
 */
export function buildClassColorMap(drugs) {
  const classes = [...new Set(drugs.map(d => d._class ?? d.drugClass).filter(Boolean))].sort()
  const map = {}
  classes.forEach((name, i) => {
    const [color, shade] = PALETTE[i % PALETTE.length]
    map[name] = `bg-${color}-${shade}`
  })
  return map
}

/** Unique, sorted list of classes/categories present in an item array. */
export function listClasses(drugs) {
  return [...new Set(drugs.map(d => d._class ?? d.drugClass).filter(Boolean))].sort()
}

/**
 * Unique, sorted list of topic tags present in a drug array.
 *
 * Tags used by fewer than `min` drugs are hidden from the filter UI,
 * because a quiz needs at least 3 drugs to start. The tags still live in
 * the data — they just are not offered as a standalone filter. Selecting
 * several tags at once unions them, so small tags still work in combination.
 */
export function listTags(drugs, min = 3) {
  const counts = {}
  drugs.forEach(d => (d.topicTags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
  return Object.keys(counts).filter(t => counts[t] >= min).sort()
}
