import { describe, it, expect } from 'vitest';
import { psychDrugs } from '../data/psychDrugs';
import { hemeOncDrugs } from '../data/hemeOncDrugs';

const REQUIRED_FIELDS = ['id', 'name', 'class', 'uses', 'sideEffects', 'contraindications'];

function validateDrugList(drugs, listName) {
  describe(listName, () => {
    it('has at least 10 entries', () => {
      expect(drugs.length).toBeGreaterThanOrEqual(10);
    });

    it('every drug has required fields', () => {
      for (const drug of drugs) {
        for (const field of REQUIRED_FIELDS) {
          expect(drug[field], `${drug.name || drug.id}: missing "${field}"`).toBeTruthy();
        }
      }
    });

    it('all drug ids are unique', () => {
      const ids = drugs.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all drug names are non-empty strings', () => {
      for (const drug of drugs) {
        expect(typeof drug.name).toBe('string');
        expect(drug.name.length).toBeGreaterThan(0);
      }
    });

    it('all class values are non-empty strings', () => {
      for (const drug of drugs) {
        expect(typeof drug.class).toBe('string');
        expect(drug.class.length).toBeGreaterThan(0);
      }
    });
  });
}

validateDrugList(psychDrugs, 'psychDrugs');
validateDrugList(hemeOncDrugs, 'hemeOncDrugs');
