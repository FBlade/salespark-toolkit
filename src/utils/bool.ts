/****************************************************
 * ##: Boolean Parser
 * Converts a value to boolean, supporting common string/number representations
 *
 * Notes:
 * - Accepts "true", "yes", "1", "false", "no", "0" (case/whitespace-insensitive)
 * - Returns default value if not recognized or on error
 * @param {unknown} value - Input value (string | number | boolean | null | undefined)
 * @param {Boolean} def - Default value if input cannot be parsed (default: false)
 * History:
 * 21-08-2025: Created
 ****************************************************/
export const toBool = (value: unknown, def: boolean = false): boolean => {
  try {
    if (value === null || value === undefined) return def;

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    if (typeof value === "string") {
      switch (value.toLowerCase().trim()) {
        case "true":
        case "yes":
        case "1":
          return true;
        case "false":
        case "no":
        case "0":
          return false;
        default:
          return def;
      }
    }

    return def;
  } catch {
    return false;
  }
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `toBool` instead.
 */
export const parseToBool = toBool;
