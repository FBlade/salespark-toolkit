/******************************************************
 * ##: Clamp Number
 * Restricts a number to be within the min and max bounds
 * @param {number} n - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

/******************************************************
 * ##: Fixed Decimal Rounding
 * Rounds a number to a fixed number of decimals without floating point surprises
 * @param {number} n - Number to round
 * @param {number} decimals - Number of decimal places
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function round(n: number, decimals = 0) {
  const f = Math.pow(10, decimals);
  return Math.round((n + Number.EPSILON) * f) / f;
}

/******************************************************
 * ##: Safe Integer Conversion
 * Safely converts a value to an integer. Returns defaultValue if parsing fails or results in NaN.
 *
 * Notes:
 * Examples: safeParseInt("42") -> 42, safeParseInt("abc", 10) -> 10, safeParseInt(undefined) -> 0, safeParseInt(3.9) -> 3
 * @param {unknown} value - Value to convert
 * @param {number} defaultValue - Default value if parsing fails
 * History:
 * 21-08-2025: Created
 * 29-10-2025: Renamed from toInteger to safeParseInt
 ****************************************************/
export function safeParseInt(value: unknown, defaultValue = 0): number {
  try {
    const safeValue = parseInt(String(value), 10);
    return isNaN(safeValue) ? defaultValue : safeValue;
  } catch {
    return defaultValue;
  }
}

/******************************************************
 * ##: Decimal Precision Normalization
 * Ensures decimal precision values are finite, clamped to a safe integer range (0-100).
 *
 * Notes:
 * Used internally by safe arithmetic helpers to avoid invalid toFixed ranges.
 * @param {number} decimals - Requested decimal precision
 * @returns {number} Clamped integer precision between 0 and 100
 * History:
 * 01-12-2025: Created
 ****************************************************/
function normalizeDecimals(decimals: number): number {
  if (!Number.isFinite(decimals)) return 0;
  const int = Math.floor(decimals);
  if (int < 0) return 0;
  if (int > 100) return 100;
  return int;
}

/******************************************************
 * ##: Operand Sanitization
 * Confirms operands are finite numbers before performing arithmetic.
 *
 * Notes:
 * Returns false if any operand is NaN or infinite.
 * @param {number[]} values - Numbers to validate
 * @returns {boolean} True when all operands are finite
 * History:
 * 01-12-2025: Created
 ****************************************************/
function sanitizeOperands(...values: number[]): boolean {
  return values.every((value) => Number.isFinite(value));
}

/******************************************************
 * ##: Safe Addition
 * Adds two numbers with precision normalization and operand validation.
 *
 * Notes:
 * Returns 0 when operands are invalid or if toFixed throws.
 * Examples: safeAdd(0.1, 0.2, 2) -> 0.3, safeAdd(NaN, 5) -> 0
 * @param {number} a - Augend
 * @param {number} b - Addend
 * @param {number} decimals - Decimal places for rounding (default 2)
 * History:
 * 01-12-2025: Created
 ****************************************************/
export function safeAdd(a: number, b: number, decimals = 2): number {
  try {
    if (!sanitizeOperands(a, b)) return 0;
    const precision = normalizeDecimals(decimals);
    return Number((a + b).toFixed(precision));
  } catch {
    return 0;
  }
}

/******************************************************
 * ##: Safe Multiplication
 * Multiplies two numbers with precision normalization and operand validation.
 *
 * Notes:
 * Returns 0 when operands are invalid or on computation errors.
 * Examples: safeMultiply(0.1, 0.2, 4) -> 0.02, safeMultiply(Infinity, 2) -> 0
 * @param {number} a - First factor
 * @param {number} b - Second factor
 * @param {number} decimals - Decimal places for rounding (default 2)
 * History:
 * 01-12-2025: Created
 ****************************************************/
export function safeMultiply(a: number, b: number, decimals = 2): number {
  try {
    if (!sanitizeOperands(a, b)) return 0;
    const precision = normalizeDecimals(decimals);
    return Number((a * b).toFixed(precision));
  } catch {
    return 0;
  }
}

/******************************************************
 * ##: Safe Subtraction
 * Subtracts two numbers with precision normalization and operand validation.
 *
 * Notes:
 * Returns 0 when operands are invalid or on computation errors.
 * Examples: safeSubtract(10, 3.3333, 2) -> 6.67, safeSubtract(5, NaN) -> 0
 * @param {number} a - Minuend
 * @param {number} b - Subtrahend
 * @param {number} decimals - Decimal places for rounding (default 2)
 * History:
 * 01-12-2025: Created
 ****************************************************/
export function safeSubtract(a: number, b: number, decimals = 2): number {
  try {
    if (!sanitizeOperands(a, b)) return 0;
    const precision = normalizeDecimals(decimals);
    return Number((a - b).toFixed(precision));
  } catch {
    return 0;
  }
}

/******************************************************
 * ##: Safe Division
 * Divides two numbers with precision normalization, operand validation, and zero checks.
 *
 * Notes:
 * Returns 0 when operands are invalid or divisor is zero.
 * Examples: safeDivide(1, 3, 3) -> 0.333, safeDivide(10, 0) -> 0
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @param {number} decimals - Decimal places for rounding (default 2)
 * History:
 * 01-12-2025: Created
 ****************************************************/
export function safeDivide(a: number, b: number, decimals = 2): number {
  try {
    if (!sanitizeOperands(a, b) || b === 0) return 0;
    const precision = normalizeDecimals(decimals);
    return Number((a / b).toFixed(precision));
  } catch {
    return 0;
  }
}

/******************************************************
 * ##: Safe Number Comparison
 * Compares two numbers using fixed decimal precision with operand validation.
 *
 * Notes:
 * Returns false when operands are invalid.
 * Examples: numbersEqual(0.1 + 0.2, 0.3) -> true, numbersEqual(NaN, 1) -> false
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} decimals - Decimal places for comparison (default 2)
 * History:
 * 01-12-2025: Created
 ****************************************************/
export function numbersEqual(a: number, b: number, decimals = 2): boolean {
  try {
    if (!sanitizeOperands(a, b)) return false;
    const precision = normalizeDecimals(decimals);
    return a.toFixed(precision) === b.toFixed(precision);
  } catch {
    return false;
  }
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `safeParseFloat` instead.
 */
export const toInteger = safeParseInt;

/******************************************************
 * ##: Safe Number Conversion
 * Safely parses a value into a number with optional decimal precision
 *
 * Notes:
 * Handles commas as decimal/thousands separators. Returns 0 for null/undefined/empty string or invalid parsing.
 * Examples: safeParseFloat("123.45") -> 123.45, safeParseFloat("123,45") -> 123.45, safeParseFloat("1,234.56") -> 1234.56, safeParseFloat("abc", 2) -> 0, safeParseFloat(42) -> 42
 * @param {unknown} value - Value to convert
 * @param {number} decimals - Number of decimal places
 * History:
 * 21-08-2025: Created
 * 29-10-2025: Renamed from toNumber to safeParseFloat
 * 01-12-2025: Fixed space-separated thousands handling and improved number parsing logic
 ****************************************************/
export function safeParseFloat(value: unknown, decimals = 6): number {
  try {
    // Fast path for numbers
    if (typeof value === "number") {
      return isNaN(value) ? 0 : Number(value.toFixed(decimals));
    }

    // Return 0 for null/undefined/empty
    if (value === undefined || value === null || value === "") return 0;

    let str = String(value).trim();
    if (!str) return 0;

    // Remove all spaces (can be used as thousands separators)
    str = str.replace(/\s+/g, "");

    // Normalize separators
    let normalized: string;

    if (str.includes(",") && str.includes(".")) {
      // Determine which is decimal separator (rightmost one)
      const lastComma = str.lastIndexOf(",");
      const lastDot = str.lastIndexOf(".");

      if (lastDot > lastComma) {
        // "1,234.56" -> remove commas
        normalized = str.replace(/,/g, "");
      } else {
        // "1.234,56" -> swap separators
        normalized = str.replace(/\./g, "").replace(",", ".");
      }
    } else if (str.includes(",")) {
      // Check if comma is thousands separator or decimal separator
      const parts = str.split(",");
      if (parts.length === 2 && parts[1].length <= 2) {
        // "123,45" -> decimal separator
        normalized = str.replace(",", ".");
      } else {
        // "1,234" or "1,234,567" -> thousands separator
        normalized = str.replace(/,/g, "");
      }
    } else {
      normalized = str;
    }

    const num = parseFloat(normalized);
    if (!isFinite(num)) return 0;

    const precision = normalizeDecimals(decimals);
    return Number(num.toFixed(precision));

    // Error handling
  } catch {
    return 0;
  }
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `safeParseFloat` instead.
 */
export const toNumber = safeParseFloat;

/**
 * @deprecated Use `safeParseFloat` instead.
 */
export const parseToNumber = safeParseFloat;

/******************************************************
 * ##: Secure Random Index
 * Generates a uniformly distributed integer in [0, max) using Web Crypto when available
 *
 * Notes:
 * Falls back to Math.random() if crypto is unavailable (not cryptographically secure)
 * @param {number} max - Upper bound (exclusive)
 * History:
 * 21-08-2025: Created
 ****************************************************/
function secureRandomIndex(max: number): number {
  if (max <= 0) return 0;

  const g: any = globalThis as any;
  const crypto = g?.crypto;

  // Prefer Web Crypto (browser + Node 18+ expose crypto.getRandomValues)
  if (crypto && typeof crypto.getRandomValues === "function") {
    // Rejection sampling to avoid modulo bias
    const range = 0x100000000; // 2^32
    const threshold = range - (range % max);
    const buf = new Uint32Array(1);

    // Loop until we hit a value in the unbiased range
    // In practice this loops rarely (expected < 2 iterations).
    do {
      crypto.getRandomValues(buf);
    } while (buf[0] >= threshold);

    return buf[0] % max;
  }

  // Fallback (NOT cryptographically secure)
  return Math.floor(Math.random() * max);
}

/******************************************************
 * ##: Random Digits Generator
 * Generates a random string of digits with secure randomness when available
 *
 * Notes:
 * Options: length (default 6), charset (default "0123456789"), noLeadingZero (if true, first char not "0"). Returns a string to preserve leading zeros. Uses Web Crypto when possible; otherwise falls back to Math.random().
 * @param {number} length - Number of digits
 * @param {object} options - Options: charset, noLeadingZero
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function randomDigits(
  length = 6,
  options?: { charset?: string; noLeadingZero?: boolean }
): string {
  const charset = options?.charset ?? "0123456789";
  if (length <= 0 || charset.length === 0) return "";

  let out = "";

  for (let i = 0; i < length; i++) {
    if (i === 0 && options?.noLeadingZero && charset.includes("0")) {
      // Pick from charset without "0"
      const pool = charset.replace(/0/g, "");
      if (pool.length === 0) return ""; // nothing to pick
      out += pool[secureRandomIndex(pool.length)];
    } else {
      out += charset[secureRandomIndex(charset.length)];
    }
  }

  return out;
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `randomDigits` instead.
 */

export const otp = randomDigits;

/******************************************************
 * ##: Decimal Number Formatter
 * Formats a number with specified decimal places, handling comma/dot normalization.
 *
 * Intelligently handles European number formats (1.234,56) and US formats (1,234.56).
 * Converts strings to numbers and applies decimal formatting.
 * @param {number|string|null|undefined} value Number value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string with specified decimals
 * History:
 * 16-10-2025: Created
 ****************************************************/
export const formatDecimalNumber = (
  value: number | string | null | undefined,
  decimals: number = 2
): string => {
  try {
    // Handle nil values
    let processedValue: string | number = value ?? 0;

    // Handle string normalization for comma/dot formats
    if (typeof processedValue === "string") {
      const trimmed = processedValue.trim();

      if (trimmed.includes(",") && trimmed.includes(".")) {
        const lastComma = trimmed.lastIndexOf(",");
        const lastDot = trimmed.lastIndexOf(".");

        processedValue =
          lastComma > lastDot
            ? trimmed.replace(/\./g, "").replace(",", ".") // European style
            : trimmed.replace(/,/g, ""); // US style
      } else if (trimmed.includes(",")) {
        processedValue = trimmed.replace(/,/g, ".");
      } else {
        processedValue = trimmed;
      }
    }

    const numValue = parseFloat(String(processedValue));

    // Handle invalid numbers
    if (isNaN(numValue)) {
      return (0).toFixed(Math.max(0, Math.floor(decimals)));
    }

    return numValue.toFixed(Math.max(0, Math.floor(decimals)));
  } catch (error) {
    /* c8 ignore start */
    return (0).toFixed(Math.max(0, Math.floor(decimals)));
    /* c8 ignore end */
  }
};
