import { describe, it, expect } from 'vitest';
import {
  shuffle,
  buildRounds,
  buildDiverseRounds,
  getPropertyValue,
  calcPercent,
  gradeFromPercent,
  MODE_LABELS,
} from '../utils/quizUtils';

// ── shuffle ───────────────────────────────────────────────────────────────
describe('shuffle', () => {
  it('returns the same array reference', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toBe(arr);
  });

  it('preserves all elements', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(copy);
    expect(copy.sort()).toEqual(original.sort());
  });

  it('handles empty array without error', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ── buildRounds ───────────────────────────────────────────────────────────
describe('buildRounds', () => {
  const makeDrug = (id, cls) => ({ id, name: `Drug ${id}`, class: cls, uses: `Use ${id}`, sideEffects: `SE ${id}`, contraindications: `CI ${id}` });

  const drugs = [
    makeDrug('d1', 'SSRI'),
    makeDrug('d2', 'MAOI'),
    makeDrug('d3', 'TCA'),
    makeDrug('d4', 'SSRI'),
    makeDrug('d5', 'MAOI'),
    makeDrug('d6', 'Antipsychotic'),
    makeDrug('d7', 'TCA'),
  ];

  it('puts all drugs into rounds (no drug lost)', () => {
    const rounds = buildRounds(drugs, 'uses', 3);
    const flat = rounds.flat();
    expect(flat.length).toBe(drugs.length);
  });

  it('uses round size correctly for non-class mode', () => {
    const rounds = buildRounds(drugs, 'uses', 3);
    rounds.slice(0, -1).forEach((r) => expect(r.length).toBe(3));
  });

  it('includes all drugs for class mode too', () => {
    const rounds = buildRounds(drugs, 'class', 3);
    const flat = rounds.flat();
    expect(flat.length).toBe(drugs.length);
  });
});

// ── buildDiverseRounds ────────────────────────────────────────────────────
describe('buildDiverseRounds', () => {
  const makeDrug = (id, cls) => ({ id, name: `Drug ${id}`, class: cls });

  it('produces rounds with maximally diverse classes', () => {
    const drugs = [
      makeDrug('a', 'SSRI'), makeDrug('b', 'MAOI'), makeDrug('c', 'TCA'),
      makeDrug('d', 'SSRI'), makeDrug('e', 'MAOI'), makeDrug('f', 'TCA'),
    ];
    const rounds = buildDiverseRounds(drugs, 3);
    for (const round of rounds) {
      const classes = round.map((d) => d.class);
      const unique = new Set(classes);
      expect(unique.size).toBe(round.length); // each drug in round has different class
    }
  });

  it('contains all original drugs', () => {
    const drugs = [
      makeDrug('a', 'A'), makeDrug('b', 'B'), makeDrug('c', 'C'),
      makeDrug('d', 'A'), makeDrug('e', 'B'),
    ];
    const rounds = buildDiverseRounds(drugs, 3);
    expect(rounds.flat().length).toBe(drugs.length);
  });
});

// ── getPropertyValue ──────────────────────────────────────────────────────
describe('getPropertyValue', () => {
  const drug = {
    class: 'SSRI',
    uses: 'Depression, OCD, panic disorder',
    sideEffects: 'Sexual dysfunction, insomnia',
    contraindications: 'MAOIs; pregnancy',
  };

  it('returns class directly', () => {
    expect(getPropertyValue(drug, 'class')).toBe('SSRI');
  });

  it('returns first use for uses mode', () => {
    expect(getPropertyValue(drug, 'uses')).toBe('Depression');
  });

  it('returns first side effect', () => {
    expect(getPropertyValue(drug, 'sideEffects')).toBe('Sexual dysfunction');
  });

  it('returns first contraindication', () => {
    expect(getPropertyValue(drug, 'contraindications')).toBe('MAOIs');
  });

  it('returns empty string for unknown mode', () => {
    expect(getPropertyValue(drug, 'nonexistent')).toBe('');
  });
});

// ── calcPercent ───────────────────────────────────────────────────────────
describe('calcPercent', () => {
  it('returns 0 for 0/0', () => {
    expect(calcPercent(0, 0)).toBe(0);
  });

  it('returns 100 for perfect score', () => {
    expect(calcPercent(10, 10)).toBe(100);
  });

  it('rounds correctly', () => {
    expect(calcPercent(1, 3)).toBe(33); // 33.33... → 33
    expect(calcPercent(2, 3)).toBe(67); // 66.66... → 67
  });
});

// ── gradeFromPercent ──────────────────────────────────────────────────────
describe('gradeFromPercent', () => {
  it('gives A for 90+', () => {
    expect(gradeFromPercent(90)).toBe('A');
    expect(gradeFromPercent(100)).toBe('A');
  });

  it('gives B for 80-89', () => {
    expect(gradeFromPercent(80)).toBe('B');
    expect(gradeFromPercent(89)).toBe('B');
  });

  it('gives C for 70-79', () => {
    expect(gradeFromPercent(70)).toBe('C');
  });

  it('gives D for 60-69', () => {
    expect(gradeFromPercent(60)).toBe('D');
  });

  it('gives F below 60', () => {
    expect(gradeFromPercent(59)).toBe('F');
    expect(gradeFromPercent(0)).toBe('F');
  });
});

// ── MODE_LABELS ───────────────────────────────────────────────────────────
describe('MODE_LABELS', () => {
  it('has all four expected modes', () => {
    expect(MODE_LABELS).toHaveProperty('class');
    expect(MODE_LABELS).toHaveProperty('uses');
    expect(MODE_LABELS).toHaveProperty('sideEffects');
    expect(MODE_LABELS).toHaveProperty('contraindications');
  });
});
