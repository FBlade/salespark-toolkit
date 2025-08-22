/******************************************************
 * ##: Unique by Key
 * Returns unique items in an array based on a computed key
 * @param {Array<T>} arr - The array to process
 * @param {Function} key - Function to compute the key for uniqueness
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function uniqBy<T, K>(arr: T[], key: (v: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

/******************************************************
 * ##: Array Chunk
 * Splits an array into equally sized pieces
 * @param {Array<T>} arr - The array to chunk
 * @param {Number} size - Size of each chunk
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr.slice()];
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

/******************************************************
 * ##: Deep Array Equality
 * Deeply compares two arrays for equality, ignoring element order and property order in nested objects
 *
 * Notes:
 * - Uses JSON.stringify as the final canonical representation.
 * - Will return false on non-serializable inputs (e.g., circular structures).
 * - For primitives like NaN/Infinity, JSON.stringify follows JS semantics (NaN -> null).
 * @param {Array<T>} arr1 - First array to compare
 * @param {Array<T>} arr2 - Second array to compare
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function areArraysEqual<T = unknown>(arr1: T[], arr2: T[]): boolean {
  try {
    // Quick length check
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;

    // Canonicalize: sort object keys recursively
    const normalize = (value: unknown): unknown => {
      if (Array.isArray(value)) {
        // Normalize each element; order is handled later by sorting the stringified list
        return value.map(normalize);
      }
      if (value && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
          .map(([k, v]) => [k, normalize(v)] as const)
          .sort(([k1], [k2]) => (k1 < k2 ? -1 : k1 > k2 ? 1 : 0));
        return Object.fromEntries(entries);
      }
      return value;
    };

    // Stringify each normalized element and sort → order-independent comparison
    const a = arr1.map((el) => JSON.stringify(normalize(el))).sort();
    const b = arr2.map((el) => JSON.stringify(normalize(el))).sort();

    // Compare element-wise
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  } catch {
    // Any unexpected error → treat as not equal
    return false;
  }
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `areArraysEqual` instead.
 */
export const areArraysDeepEqualUnordered = areArraysEqual;

/******************************************************
 * ##: Unique Values
 * Removes duplicate values from an array
 * @param {Array<T>} arr - The array to process
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/******************************************************
 * ##: Flatten Array
 * Flattens nested arrays into a single array (1 level deep)
 * @param {Array<any>} arr - The array to flatten
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function flatten<T>(arr: any[]): T[] {
  return arr.flat ? arr.flat() : [].concat(...arr);
}

/******************************************************
 * ##: Group By
 * Groups array items by a key or function
 * @param {Array<T>} arr - The array to group
 * @param {Function|String} key - Key or function to group by
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function groupBy<T, K extends keyof any>(
  arr: T[],
  key: ((item: T) => K) | K
): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const group = typeof key === "function" ? key(item) : (item as any)[key];
    (acc[group] = acc[group] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/******************************************************
 * ##: Sort By
 * Sorts array by a key or function
 * @param {Array<T>} arr - The array to sort
 * @param {Function|String} key - Key or function to sort by
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function sortBy<T>(arr: T[], key: ((item: T) => any) | keyof T): T[] {
  return [...arr].sort((a, b) => {
    const aKey = typeof key === "function" ? key(a) : a[key];
    const bKey = typeof key === "function" ? key(b) : b[key];
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}

/******************************************************
 * ##: Array Difference
 * Returns elements in arr1 not present in arr2
 * @param {Array<T>} arr1 - First array
 * @param {Array<T>} arr2 - Second array
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((x) => !set2.has(x));
}

/******************************************************
 * ##: Array Intersection
 * Returns elements common to both arrays
 * @param {Array<T>} arr1 - First array
 * @param {Array<T>} arr2 - Second array
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((x) => set2.has(x));
}

/******************************************************
 * ##: Compact Array
 * Removes falsy values from array
 * @param {Array<T>} arr - The array to compact
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function compact<T>(arr: T[]): T[] {
  return arr.filter(Boolean);
}

/******************************************************
 * ##: Pluck Property
 * Extracts a property from each object in array
 * @param {Array<T>} arr - The array of objects
 * @param {String} key - Property name to extract
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function pluck<T, K extends keyof T>(arr: T[], key: K): Array<T[K]> {
  return arr.map((item) => item[key]);
}

/******************************************************
 * ##: Shuffle Array
 * Shuffles array elements randomly
 * @param {Array<T>} arr - The array to shuffle
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 ****************************************************
 * ##: Flattenable Value Checker
 * Checks if a value can be flattened (array, arguments, or marked spreadable)
 *
 * Notes:
 * Mirrors lodash's behavior: checks Array.isArray, arguments object, and Symbol.isConcatSpreadable.
 * @param {unknown} value - Value to check for flattenability
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function isFlattenable(value: unknown): value is readonly unknown[] {
  // Quick path: arrays
  if (Array.isArray(value)) return true;

  // Check for arguments object
  const isArgs = Object.prototype.toString.call(value) === "[object Arguments]";

  if (isArgs) return true;

  // Respect Symbol.isConcatSpreadable when present
  // (some iterables/array-likes may opt-in)
  const spreadable = (Symbol as any).isConcatSpreadable as symbol | undefined;
  // Using bracket access to avoid TS downlevel issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return spreadable ? !!(value as any)?.[spreadable] : false;
}

/**
 ****************************************************
 * ##: Array Push All
 * Appends all values into array in-place (similar to lodash arrayPush)
 * @param {Array<T>} array - Target array
 * @param {Array<T>} values - Values to append
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function pushAll<T>(array: T[], values: readonly T[]): T[] {
  let index = -1;
  const length = values.length;
  const offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index] as T;
  }
  return array;
}

/**
 ****************************************************
 * ##: Base Array Flatten
 * Base flatten routine with configurable depth and predicate
 *
 * Notes:
 * Allows control of depth, predicate, and strict mode. Used internally for flattening.
 * @param {Array} array - Input array
 * @param {Number} depth - Maximum recursion depth
 * @param {Function} predicate - Function to determine if value is flattenable
 * @param {Boolean} isStrict - If true, only flattenable values are kept
 * @param {Array} result - Optional accumulator (internal)
 * @returns {Array} New flattened array
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function flattenDepthBase<T>(
  array: readonly unknown[],
  depth: number,
  predicate: (v: unknown) => boolean = isFlattenable,
  isStrict = false,
  result: T[] = []
): T[] {
  let index = -1;
  const length = array.length;

  while (++index < length) {
    const value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten (susceptible to call stack limits on huge nests).
        flattenDepthBase<T>(
          value as readonly unknown[],
          depth - 1,
          predicate,
          isStrict,
          result
        );
      } else {
        pushAll(result, value as T[]);
      }
    } else if (!isStrict) {
      // Keep non-flattenables when not strict
      (result as unknown[])[result.length] = value as unknown as T;
    }
  }
  return result;
}

/**
 ****************************************************
 * ##: Flatten Array Once
 * Flattens array a single level deep (equivalent to lodash _.flatten)
 *
 * Notes:
 * Example: flattenOnce([1, [2, [3, [4]], 5]]) => [1, 2, [3, [4]], 5]
 * @param {Array} array - Array to flatten
 * @returns {Array} Flattened array (1 level)
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function flattenOnce<T>(
  array: ReadonlyArray<T | ReadonlyArray<T>>
): T[] {
  // Type note: `flattenDepthBase` returns `unknown[]` at compile-time,
  // but we constrain inputs so a cast to `T[]` is safe here.
  return flattenDepthBase<T>(array as readonly unknown[], 1) as T[];
}

/******************************************************
 * ##: Flatten Array to Depth
 * Flattens array up to the specified depth (friendly wrapper, default 1)
 *
 * Notes:
 * Example: flattenDepth([1, [2, [3, [4]], 5]], 2) => [1, 2, 3, [4], 5]
 * @param {Array} array - Array to flatten
 * @param {Number} depth - Maximum depth
 * @param {Object} options - Options: predicate, isStrict
 * @returns {Array} Flattened array up to depth
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function flattenDepth<T = unknown>(
  array: readonly unknown[],
  depth = 1,
  options?: {
    predicate?: (v: unknown) => boolean;
    isStrict?: boolean;
  }
): T[] {
  const { predicate = isFlattenable, isStrict = false } = options ?? {};
  return flattenDepthBase<T>(array, depth, predicate, isStrict);
}
