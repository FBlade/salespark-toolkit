import { describe, it, expect } from 'vitest';
import {
  uniq,
  uniqBy,
  chunk,
  areArraysEqual,
  areArraysDeepEqualUnordered,
  flatten,
  groupBy,
  sortBy,
  difference,
  intersection,
  compact,
  pluck,
  shuffle
} from '../src/utils/array';

describe('array utils', () => {
  // Helper for deep object arrays
  type Obj = { id: number; name: string; group?: string };

  describe('uniq', () => {
    it('removes duplicates from primitives', () => {
      expect(uniq([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
      expect(uniq(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
    it('works with objects by reference', () => {
      const a = { x: 1 };
      expect(uniq([a, a])).toEqual([a]);
    });
  });

  describe('uniqBy', () => {
    it('removes duplicates by key', () => {
      const arr = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
        { id: 1, name: 'c' }
      ];
      expect(uniqBy(arr, x => x.id)).toEqual([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' }
      ]);
    });
  });

  describe('chunk', () => {
    it('splits array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3], 0)).toEqual([[1, 2, 3]]);
    });
  });

  describe('areArraysEqual', () => {
    it('compares arrays deeply, ignoring order', () => {
      expect(areArraysEqual([1, 2, 3], [3, 2, 1])).toBe(true);
      expect(areArraysEqual([{ a: 1, b: 2 }], [{ b: 2, a: 1 }])).toBe(true);
      expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(areArraysEqual([NaN], [null])).toBe(true); // JSON.stringify(NaN) -> null
    });
    it('alias works', () => {
      expect(areArraysDeepEqualUnordered([1, 2], [2, 1])).toBe(true);
    });
  });

  describe('flatten', () => {
    it('flattens nested arrays', () => {
      expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
      expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    it('groups by property name', () => {
      const arr: Obj[] = [
        { id: 1, name: 'a', group: 'x' },
        { id: 2, name: 'b', group: 'y' },
        { id: 3, name: 'c', group: 'x' }
      ];
      expect(groupBy(arr, 'group')).toEqual({
        x: [
          { id: 1, name: 'a', group: 'x' },
          { id: 3, name: 'c', group: 'x' }
        ],
        y: [
          { id: 2, name: 'b', group: 'y' }
        ]
      });
    });
    it('groups by function', () => {
      const arr = [1, 2, 3, 4];
      expect(groupBy(arr, x => x % 2 === 0 ? 'even' : 'odd')).toEqual({
        odd: [1, 3],
        even: [2, 4]
      });
    });
  });

  describe('sortBy', () => {
    it('sorts by property', () => {
      const arr = [
        { id: 2 },
        { id: 1 },
        { id: 3 }
      ];
      expect(sortBy(arr, 'id')).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]);
    });
    it('sorts by function', () => {
      expect(sortBy([3, 1, 2], x => x)).toEqual([1, 2, 3]);
    });
  });

  describe('difference', () => {
    it('returns elements in arr1 not in arr2', () => {
      expect(difference([1, 2, 3], [2, 4])).toEqual([1, 3]);
      expect(difference(['a', 'b'], ['b'])).toEqual(['a']);
    });
  });

  describe('intersection', () => {
    it('returns common elements', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
      expect(intersection(['a', 'b'], ['b', 'c'])).toEqual(['b']);
    });
  });

  describe('compact', () => {
    it('removes falsy values', () => {
      expect(compact([0, 1, false, 2, '', 3, null, undefined])).toEqual([1, 2, 3]);
    });
  });

  describe('pluck', () => {
    it('extracts property from objects', () => {
      const arr = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' }
      ];
      expect(pluck(arr, 'id')).toEqual([1, 2]);
      expect(pluck(arr, 'name')).toEqual(['a', 'b']);
    });
  });

  describe('shuffle', () => {
    it('shuffles array elements (robust to randomness)', () => {
      const arr = [1, 2, 3, 4, 5];
      let changed = false;
      for (let i = 0; i < 10; i++) {
        const result = shuffle(arr);
        expect(result.slice().sort()).toEqual(arr.slice().sort()); // Same elements
        if (result.join(',') !== arr.join(',')) changed = true;
      }
      expect(changed).toBe(true); // At least one shuffle should change order
    });
  });
});
