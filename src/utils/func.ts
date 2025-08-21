/******************************************************
 * ##: Debounce Function
 * Returns a debounced version of a function that delays execution until after wait ms
 * @param {Function} fn - Function to debounce
 * @param {Number} wait - Delay in milliseconds
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function debounce<T extends (...args: any[]) => any>(fn: T, wait = 250) {
  let t: any;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  } as T;
}

/******************************************************
 * ##: Throttle Function
 * Returns a throttled version of a function that only executes once per wait ms
 * @param {Function} fn - Function to throttle
 * @param {Number} wait - Delay in milliseconds
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function throttle<T extends (...args: any[]) => any>(fn: T, wait = 250) {
  let last = 0;
  let timer: any;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as T;
}

/******************************************************
 * ##: Nil Value Check
 * Checks if a value is null or undefined (Type Guard)
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

/******************************************************
 * ##: Nil or Nil Text Check
 * Checks if value is null/undefined or the text "null"/"undefined"
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNilText = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "null" || v === "undefined";
  }
  return false;
};

/******************************************************
 * ##: Nil or Empty String Check
 * Checks if value is null/undefined or an empty string ""
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNilOrEmpty = (value: unknown): boolean => {
  try {
    return isNil(value) || value === "";
  } catch {
    return true;
  }
};

/******************************************************
 * ##: Array Nil or Empty Element Check
 * Checks if any element in array is nil or empty (""). Returns true if input is not an array.
 * @param {unknown} array - Array to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const hasNilOrEmpty = (array: unknown): boolean => {
  try {
    if (!Array.isArray(array)) return true;
    for (const item of array) {
      if (isNilOrEmpty(item)) return true;
    }
    return false;
  } catch {
    return true;
  }
};

/******************************************************
 * ##: Nil, Empty, or Zero Length Check
 * Checks if value is nil, empty string, or has zero length (applies to arrays, strings, typed arrays, buffers)
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNilEmptyOrZeroLen = (value: unknown): boolean => {
  try {
    if (isNil(value) || value === "") return true;

    // has length === 0 (string/array/typed-array/buffer-like)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeLen = (value as any)?.length;
    return typeof maybeLen === "number" && maybeLen === 0;
  } catch {
    return true;
  }
};

/******************************************************
 * ##: Nil or Zero Length Check
 * Checks if value is nil or has zero length (.length === 0). Does NOT treat "" specially.
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNilOrZeroLen = (value: unknown): boolean => {
  try {
    if (isNil(value)) return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeLen = (value as any)?.length;
    return typeof maybeLen === "number" && maybeLen === 0;
  } catch {
    return true;
  }
};

/******************************************************
 * ##: Nil or NaN Check
 * Checks if value is nil OR NaN (coercive, matches global isNaN)
 *
 * Notes:
 * Uses global isNaN for parity with JS behavior (coerces strings). Example: isNaN("foo") === true.
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const isNilOrNaN = (value: unknown): boolean => {
  try {
    return isNil(value) || isNaN(value as number);
  } catch {
    return true;
  }
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/

/**
 * @deprecated Use `isNil` instead.
 */
export const isNullOrUndefined = isNil;

/**
 * @deprecated Use `isNilText` instead.
 */
export const isNullOrUndefinedTextInc = isNilText;

/**
 * @deprecated Use `isNilOrEmpty` instead.
 */
export const isNullUndefinedOrEmpty = isNilOrEmpty;

/**
 * @deprecated Use `hasNilOrEmpty` instead.
 */
export const isNullOrUndefinedInArray = hasNilOrEmpty;

/**
 * @deprecated Use `isNilEmptyOrZeroLen` instead.
 */
export const isNullOrUndefinedEmptyOrZero = isNilEmptyOrZeroLen;

/**
 * @deprecated Use `isNilOrZeroLen` instead.
 */
export const isNullUndefinedOrZero = isNilOrZeroLen;

/**
 * @deprecated Use `isNilOrNaN` instead.
 */
export const isNullOrUndefinedOrNaN = isNilOrNaN;

/******************************************************
 * ##: Human-Readable Byte Formatter
 * Formats bytes as human-readable text (e.g., kB, MB, KiB, MiB)
 *
 * Notes:
 * SI (kB, MB, ...) uses 1000; IEC (KiB, MiB, ...) uses 1024. Negative values supported.
 * @param {Number} bytes - Number of bytes to format
 * @param {Boolean} si - True for metric (SI, base 1000), false for binary (IEC, base 1024)
 * @param {Number} dp - Decimal places
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const formatBytes = (
  bytes: number,
  si: boolean = false,
  dp: number = 1
): string => {
  // Guard invalid numbers
  if (!Number.isFinite(bytes)) return "NaN";

  const thresh = si ? 1000 : 1024;
  const abs = Math.abs(bytes);

  // Bytes (no unit scaling)
  if (abs < thresh) return `${bytes} B`;

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  let u = -1;
  const r = 10 ** dp;
  let value = bytes;

  do {
    value /= thresh;
    ++u;
    // keep dividing while rounded value still reaches next threshold
  } while (
    Math.round(Math.abs(value) * r) / r >= thresh &&
    u < units.length - 1
  );

  return `${value.toFixed(dp)} ${units[u]}`;
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `formatBytes` instead.
 */
export const humanFileSize = formatBytes;

/******************************************************
 * ##: Levenshtein Distance
 * Calculates the Levenshtein distance between two strings (O(n*m), O(min(n,m)) space)
 * @param {String} a - First string
 * @param {String} b - Second string
 * History:
 * 21-08-2025: Created
 ****************************************************/
const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  // Ensure `a` is the shorter to minimize memory
  if (al > bl) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  const n = a.length;
  const m = b.length;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);

  for (let i = 0; i <= n; i++) prev[i] = i;

  for (let j = 1; j <= m; j++) {
    curr[0] = j;
    const bj = b.charCodeAt(j - 1);
    for (let i = 1; i <= n; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      const del = prev[i] + 1;
      const ins = curr[i - 1] + 1;
      const sub = prev[i - 1] + cost;
      curr[i] = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub;
    }
    // swap
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[n];
};

/******************************************************
 * ##: String Similarity
 * Returns the similarity between two strings (0..1)
 *
 * Notes:
 * Similarity = (|longer|-levenshtein(longer, shorter)) / |longer|  ∈ [0, 1]. Safe for empty strings; if both empty => 1.0
 * @param {String} s1 - First string
 * @param {String} s2 - Second string
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const stringSimilarity = (s1: string, s2: string): number => {
  const a = s1 ?? "";
  const b = s2 ?? "";

  let longer = a;
  let shorter = b;
  if (a.length < b.length) {
    longer = b;
    shorter = a;
  }

  const L = longer.length;
  if (L === 0) return 1.0;

  const dist = levenshtein(longer, shorter);
  return (L - dist) / L;
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `stringSimilarity` instead.
 */
export const getStringSimilarity = stringSimilarity;

/******************************************************
 * ##: Thousand Separator Formatter
 * Adds spaces between thousands in a number (e.g., 1234567 -> "1 234 567")
 * @param {Number|String} value - Number or string to format
 * @returns {String} Formatted string with spaces as thousand separators
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const addThousandsSpace = (value: number | string): string => {
  try {
    const str = value.toString();
    const [intPart, decimalPart] = str.split(".");

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt;
  } catch {
    return value as string;
  }
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `addThousandsSpace` instead.
 */
export const addSpaceBetweenNumbers = addThousandsSpace;
