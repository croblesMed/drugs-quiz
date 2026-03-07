import { describe, it, expect } from 'vitest';
import { parseCSV, generateCSVTemplate } from '../utils/csvParser';

describe('parseCSV', () => {
  it('parses a valid CSV with all fields', () => {
    const csv = [
      'name,brandName,class,uses,sideEffects,contraindications,mechanism',
      '"Fluoxetine","Prozac","SSRI","Depression","Sexual dysfunction","MAOIs","Inhibits 5-HT reuptake"',
    ].join('\n');
    const { drugs, errors } = parseCSV(csv);
    expect(errors).toHaveLength(0);
    expect(drugs).toHaveLength(1);
    expect(drugs[0].name).toBe('Fluoxetine');
    expect(drugs[0].class).toBe('SSRI');
    expect(drugs[0].brandName).toBe('Prozac');
  });

  it('returns error if name column is missing', () => {
    const csv = 'class,uses\nSSRI,Depression';
    const { drugs, errors } = parseCSV(csv);
    expect(errors.length).toBeGreaterThan(0);
    expect(drugs).toHaveLength(0);
  });

  it('returns error if class column is missing', () => {
    const csv = 'name,uses\nFluoxetine,Depression';
    const { drugs, errors } = parseCSV(csv);
    expect(errors.length).toBeGreaterThan(0);
    expect(drugs).toHaveLength(0);
  });

  it('skips rows with missing name and records an error', () => {
    const csv = 'name,class\nFluoxetine,SSRI\n,MAOI\nSertraline,SSRI';
    const { drugs, errors } = parseCSV(csv);
    expect(drugs).toHaveLength(2);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('handles quoted fields with commas inside them', () => {
    const csv = [
      'name,class,uses',
      '"Valproate","Mood Stabilizer","Bipolar, seizures, migraines"',
    ].join('\n');
    const { drugs } = parseCSV(csv);
    expect(drugs[0].uses).toBe('Bipolar, seizures, migraines');
  });

  it('returns error for CSV with fewer than 2 lines', () => {
    const { errors } = parseCSV('name,class');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('is case-insensitive for header names', () => {
    const csv = 'Name,Class\nFluoxetine,SSRI';
    const { drugs, errors } = parseCSV(csv);
    expect(errors).toHaveLength(0);
    expect(drugs[0].name).toBe('Fluoxetine');
  });

  it('assigns unique ids to each parsed drug', () => {
    const csv = 'name,class\nDrug A,ClassA\nDrug B,ClassB';
    const { drugs } = parseCSV(csv);
    const ids = drugs.map((d) => d.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('generateCSVTemplate', () => {
  it('includes all required headers', () => {
    const template = generateCSVTemplate();
    expect(template).toContain('name');
    expect(template).toContain('class');
    expect(template).toContain('uses');
    expect(template).toContain('sideEffects');
    expect(template).toContain('contraindications');
  });

  it('has at least 2 lines (header + example)', () => {
    const lines = generateCSVTemplate().trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});
