/**
 * CSV parser utility for loading custom drug data from CSV files.
 *
 * Expected CSV headers (case-insensitive):
 *   name, brandName, class, uses, sideEffects, contraindications, mechanism
 *
 * Only `name` and `class` are required; all other fields default to empty string.
 */

const REQUIRED_HEADERS = ['name', 'class'];
const ALL_HEADERS = ['name', 'brandName', 'class', 'uses', 'sideEffects', 'contraindications', 'mechanism'];

/**
 * Parse a CSV string into an array of drug objects.
 *
 * @param {string} csvText  Raw CSV content.
 * @returns {{ drugs: Array, errors: string[] }}
 */
export function parseCSV(csvText) {
  const errors = [];
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { drugs: [], errors: ['CSV must have a header row and at least one data row.'] };
  }

  // Parse header
  const rawHeaders = splitCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Check required headers
  for (const req of REQUIRED_HEADERS) {
    if (!rawHeaders.includes(req)) {
      errors.push(`CSV is missing required column: "${req}"`);
    }
  }
  if (errors.length > 0) return { drugs: [], errors };

  // Parse rows
  const drugs = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const entry = {};
    for (const header of ALL_HEADERS) {
      const idx = rawHeaders.indexOf(header.toLowerCase());
      entry[header] = idx !== -1 && values[idx] !== undefined ? values[idx].trim() : '';
    }
    entry.id = `csv_${i}`;

    if (!entry.name) {
      errors.push(`Row ${i + 1}: missing "name" value – row skipped.`);
      continue;
    }
    if (!entry.class) {
      errors.push(`Row ${i + 1}: missing "class" value – row skipped.`);
      continue;
    }

    drugs.push(entry);
  }

  return { drugs, errors };
}

/**
 * Split a single CSV line into fields, respecting double-quoted fields.
 * @param {string} line
 * @returns {string[]}
 */
function splitCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped double-quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Generate a sample CSV template string that users can download.
 * @returns {string}
 */
export function generateCSVTemplate() {
  const header = ALL_HEADERS.join(',');
  const example = [
    'ExampleDrug',
    'BrandName',
    'Drug Class',
    'Primary use / indication',
    'Key side effect',
    'Main contraindication',
    'Mechanism of action',
  ]
    .map((v) => `"${v}"`)
    .join(',');
  return `${header}\n${example}\n`;
}
