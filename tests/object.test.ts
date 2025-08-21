import { describe, it, expect } from 'vitest';
import { pick, omit, objectToString, cleanObject } from '../src/utils/object';

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });
});

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });
});

describe('objectToString', () => {
  it('should stringify object as custom string', () => {
    expect(objectToString({ a: 1, b: 2 })).toBe('a=1_b=2');
    expect(objectToString('test')).toBe('test');
    expect(objectToString(null)).toBe('');
    expect(objectToString(undefined)).toBe('');
    expect(objectToString(123)).toBe('123');
  });
});

describe('cleanObject', () => {
  it('should remove null, undefined, "null", "undefined" from objects', () => {
    const obj = { a: 1, b: null, c: undefined, d: "null", e: "undefined", f: 2 };
    expect(cleanObject(obj)).toEqual({ a: 1, f: 2 });
  });
  it('should recursively clean nested objects and arrays', () => {
    const obj = { a: [null, 1, undefined, "null", 2], b: { x: null, y: 3 } };
    expect(cleanObject(obj)).toEqual({ a: [1, 2], b: { y: 3 } });
  });
  it('should prune empty objects and arrays', () => {
    const obj = { a: { b: null }, c: [], d: [null, undefined] };
    expect(cleanObject(obj)).toEqual({});
  });
  it('should keep falsy values like 0, false, ""', () => {
    const obj = { a: 0, b: false, c: "" };
    expect(cleanObject(obj)).toEqual({ a: 0, b: false, c: "" });
  });
  it('should handle primitives and return as-is', () => {
    expect(cleanObject(123)).toBe(123);
    expect(cleanObject("abc")).toBe("abc");
    expect(cleanObject(false)).toBe(false);
  });
});
