/**
****************************************************
 * ##: Object Property Picker
 * Picks specified properties from an object and returns a new object
 * @param {Object} obj - Source object
 * @param {Array} keys - Array of keys to pick
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

/**
****************************************************
 * ##: Object Property Omitter
 * Omits specified properties from an object and returns a new object
 * @param {Object} obj - Source object
 * @param {Array} keys - Array of keys to omit
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const set = new Set<keyof T>(keys);
  const out = {} as any;
  for (const k in obj) if (!set.has(k)) out[k] = obj[k];
  return out;
}

/**
****************************************************
 * ##: Object to Clean String
 * Converts an object or value to a clean string without JSON braces and quotes
 *
 * Notes:
 * Examples: { a: 1, b: "x" } -> "a=1_b=x", null -> "", 42 -> "42"
 * @param {unknown} obj - Object or value to convert
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function objectToString(obj: unknown): string {
  try {
    if (obj === null || obj === undefined) return "";
    if (typeof obj !== "object") return String(obj);

    return JSON.stringify(obj)
      .replace(/[{}"]/g, "") // remove { } "
      .replace(/:/g, "=") // replace : with =
      .replace(/,/g, "_"); // replace , with _
  } catch {
    // Fallback: best-effort stringify
    try {
      return String(obj);
    } catch {
      return "";
    }
  }
}

/**
****************************************************
 * ##: Deep Object Cleaner
 * Deep-cleans an input by removing null, undefined, "null", "undefined" and recursively cleaning arrays/objects
 *
 * Notes:
 * - Falsy values like 0, false, "" are kept.
 * - Non-plain objects (e.g., Date, Map) are treated as generic objects via Object.entries.
 * - Prunes empty objects/arrays produced by the cleaning step.
 * @param {unknown} obj - Object or array to clean
 * History:
 * 21-08-2025: Created
 ****************************************************/
type Removable = null | undefined | "null" | "undefined";

const isRemovable = (v: unknown): v is Removable =>
  v === null || v === undefined || v === "null" || v === "undefined";

export function cleanObject<T = unknown>(obj: T): any {
  // Handle arrays: map + clean each item, then filter removable values
  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => cleanObject(item))
      .filter((item) => !isRemovable(item));
    return cleanedArray;
  }

  // Handle objects (and only objects, excluding null)
  if (obj !== null && typeof obj === "object") {
    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip removable raw values fast
      if (isRemovable(value)) continue;

      // Recursively clean nested values
      const nested = cleanObject(value);

      // After cleaning, skip if still removable
      if (isRemovable(nested)) continue;

      // Prune empty objects/arrays (to mirror original behavior)
      const isObj = typeof nested === "object" && nested !== null;
      const isEmptyObj =
        isObj && !Array.isArray(nested) && Object.keys(nested).length === 0;
      const isEmptyArr = Array.isArray(nested) && nested.length === 0;
      if (isEmptyObj || isEmptyArr) continue;

      cleaned[key] = nested;
    }

    return cleaned;
  }

  // Primitives (and functions) are returned as-is
  return obj as any;
}
