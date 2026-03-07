/**
 * Quiz utility functions for generating and managing quiz rounds.
 */

/**
 * Shuffle an array in-place using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array} the same array, shuffled
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build rounds for a quiz.
 *
 * For the 'class' mode each round tries to contain drugs from distinct classes
 * so the right-hand column has unique values.  For all other modes the drugs
 * are simply shuffled and chunked.
 *
 * @param {Array}  drugs     Full drug list for the category.
 * @param {string} mode      One of: 'class' | 'uses' | 'sideEffects' | 'contraindications'
 * @param {number} roundSize Number of drug pairs per round (default 5).
 * @returns {Array<Array>}   Array of rounds, each round being an array of drug objects.
 */
export function buildRounds(drugs, mode, roundSize = 5) {
  if (mode === 'class') {
    return buildDiverseRounds(drugs, roundSize);
  }
  // For other modes just shuffle and chunk
  const copy = shuffle([...drugs]);
  const rounds = [];
  for (let i = 0; i < copy.length; i += roundSize) {
    rounds.push(copy.slice(i, i + roundSize));
  }
  return rounds;
}

/**
 * Build rounds where each round has maximally diverse drug classes.
 * Groups drugs by class then interleaves one from each class per round.
 *
 * @param {Array}  drugs
 * @param {number} roundSize
 * @returns {Array<Array>}
 */
export function buildDiverseRounds(drugs, roundSize = 5) {
  // Group by class
  const byClass = {};
  for (const drug of drugs) {
    if (!byClass[drug.class]) byClass[drug.class] = [];
    byClass[drug.class].push(drug);
  }

  // Shuffle within each class bucket
  for (const cls of Object.keys(byClass)) {
    shuffle(byClass[cls]);
  }

  // Interleave: take one from each class bucket in turn
  const buckets = Object.values(byClass);
  const interleaved = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const bucket of buckets) {
      if (bucket.length > 0) {
        interleaved.push(bucket.shift());
        changed = true;
      }
    }
  }

  // Chunk into rounds
  const rounds = [];
  for (let i = 0; i < interleaved.length; i += roundSize) {
    rounds.push(interleaved.slice(i, i + roundSize));
  }
  return rounds;
}

/**
 * Given a drug and a quiz mode, return the display text for the right-column tile.
 *
 * @param {Object} drug
 * @param {string} mode
 * @returns {string}
 */
export function getPropertyValue(drug, mode) {
  switch (mode) {
    case 'class':
      return drug.class;
    case 'uses':
      // Return only the first part (before the first comma) for brevity on tiles
      return drug.uses.split(',')[0].trim();
    case 'sideEffects':
      // Return only the first listed side effect
      return drug.sideEffects.split(',')[0].trim();
    case 'contraindications':
      // Return the most important contraindication
      return drug.contraindications.split(';')[0].split(',')[0].trim();
    default:
      return drug[mode] || '';
  }
}

/**
 * Human-readable labels for each quiz mode.
 */
export const MODE_LABELS = {
  class: 'Drug Class',
  uses: 'Primary Use',
  sideEffects: 'Key Side Effect',
  contraindications: 'Main Contraindication',
};

/**
 * Return the instruction text shown above the board for each mode.
 */
export const MODE_INSTRUCTIONS = {
  class: 'Match each drug to its pharmacological class',
  uses: 'Match each drug to its primary clinical use',
  sideEffects: 'Match each drug to its key side effect',
  contraindications: 'Match each drug to its main contraindication',
};

/**
 * Calculate score as a percentage (0–100), rounded to the nearest integer.
 * @param {number} correct
 * @param {number} total
 * @returns {number}
 */
export function calcPercent(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Return a grade letter based on percentage.
 * @param {number} percent
 * @returns {string}
 */
export function gradeFromPercent(percent) {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}
