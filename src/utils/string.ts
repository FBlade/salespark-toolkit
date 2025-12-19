type Locale = string | string[] | undefined;

export type CapitalizeFirstOptions = {
  lowerRest?: boolean;
  locale?: Locale;
};

export type CapitalizeWordsOptions = {
  lowerRest?: boolean;
  locale?: Locale;
  treatHyphenAsSeparator?: boolean;
};

export type SentenceCaseOptions = {
  lowerRest?: boolean;
  locale?: Locale;
};

function upper(value: string, locale?: Locale) {
  return locale ? value.toLocaleUpperCase(locale) : value.toUpperCase();
}

function lower(value: string, locale?: Locale) {
  return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase();
}

/******************************************************
 * ##: Slugify String
 * Converts a string to a URL-friendly slug (basic ASCII, keeps numbers and dashes)
 * @param {String} input - String to slugify
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/******************************************************
 * ##: Simple String Template Filler
 * Fills a template string with values (e.g., "Hello, {name}!")
 * @param {String} template - Template string
 * @param {Object} values - Key-value pairs to fill
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function fill(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}

/******************************************************
 * ##: Remove Diacritics
 * Removes diacritic marks from a string using NFD normalization
 *
 * Notes:
 * Examples: "ação" -> "acao", "coração" -> "coracao", "résumé" -> "resume", "naïve" -> "naive"
 * @param {String} str - String to deburr
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function deburr(str: string): string {
  try {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return str;
  }
}

/******************************************************
 * ##: Capitalize First Letter
 * Capitalizes only the first character of a string; optionally lowercases the rest
 * @param {String} input - Input string
 * @param {Object} options - { lowerRest = true, locale }
 * History:
 * 19-12-2025: Created
 ****************************************************/
export function capitalizeFirst(
  input: unknown,
  options?: CapitalizeFirstOptions
): string {
  if (typeof input !== "string" || input.length === 0) return "";

  const { lowerRest = true, locale } = options ?? {};
  const first = upper(input[0], locale);
  const rest = lowerRest ? lower(input.slice(1), locale) : input.slice(1);

  return first + rest;
}

/******************************************************
 * ##: Capitalize Words
 * Capitalizes each word in a string with options for hyphens and locale
 * @param {String} input - Input string
 * @param {Object} options - { lowerRest = true, locale, treatHyphenAsSeparator = false }
 * History:
 * 19-12-2025: Created
 ****************************************************/
export function capitalizeWords(
  input: unknown,
  options?: CapitalizeWordsOptions
): string {
  if (typeof input !== "string" || input.length === 0) return "";

  const {
    lowerRest = true,
    locale,
    treatHyphenAsSeparator = false,
  } = options ?? {};

  const wordPattern = treatHyphenAsSeparator
    ? /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu
    : /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

  return input.replace(wordPattern, (word) => {
    const first = upper(word[0], locale);
    const rest = lowerRest ? lower(word.slice(1), locale) : word.slice(1);

    return first + rest;
  });
}

/******************************************************
 * ##: Sentence Case
 * Capitalizes the first letter of each sentence (. ! ?) with optional lowercasing of the rest
 * @param {String} input - Input string
 * @param {Object} options - { lowerRest = true, locale }
 * History:
 * 19-12-2025: Created
 ****************************************************/
export function sentenceCase(
  input: unknown,
  options?: SentenceCaseOptions
): string {
  if (typeof input !== "string" || input.length === 0) return "";

  const { lowerRest = true, locale } = options ?? {};
  const base = lowerRest ? lower(input, locale) : input;
  const sentencePattern = /(^\s*[\p{L}])|([.!?]\s*[\p{L}])/gu;

  return base.replace(sentencePattern, (match) => {
    const lastChar = match[match.length - 1];
    const upperChar = upper(lastChar, locale);
    return match.slice(0, -1) + upperChar;
  });
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `deburr` instead.
 */
export const removeDiacritics = deburr;

/******************************************************
 * ##: Basic String Sanitizer
 * Sanitizes input by removing control chars, HTML/script/style/iframe blocks, dangerous URL schemes, and keeps letters/numbers/spaces/punctuation
 *
 * Notes:
 * Non-string inputs return "". This is a light, generic sanitizer (not a full HTML sanitizer).
 * @param {unknown} input - Input to sanitize
 * @param {Number} maxLength - Optional max length for output
 * History:
 * 21-08-2025: Created
 ****************************************************/
export function sanitize(input: unknown, maxLength?: number): string {
  if (typeof input !== "string") return "";

  // 1. Remove invisible spaces and control characters
  let cleaned = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // 2. Remove embedded script/style/iframe blocks
  cleaned = cleaned.replace(/<(script|style|iframe)[^>]*>.*?<\/\1>/gis, "");

  // 3. Remove event handler attributes (e.g., onclick, onerror)
  cleaned = cleaned.replace(/on\w+\s*=\s*(['"]).*?\1/gi, "");

  // 4. Remove CSS expressions (expression(...))
  cleaned = cleaned.replace(/expression\s*\([^)]*\)/gi, "");

  // 5. Remove blocks between dangerous HTML entities (e.g., &#x3C;script&#x3E;...&#x3C;/script&#x3E;)
  cleaned = cleaned.replace(
    /&#x3C;script&#x3E;[\s\S]*?&#x3C;\/script&#x3E;/gi,
    ""
  );
  cleaned = cleaned.replace(/&#x3C;.*?&#x3E;/gi, "");

  // 6. Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // 7. Remove dangerous URL schemes
  cleaned = cleaned.replace(/\b(javascript:|data:|vbscript:|file:|ftp:)/gi, "");

  // 8. Keep letters/numbers/spaces and basic punctuation
  cleaned = cleaned.replace(/[^\p{L}\p{N}\s\-.,!?@#%&()]/gu, "");
  // 9. Apply maxLength only if explicitly passed
  if (typeof maxLength === "number" && maxLength > 0) {
    cleaned = cleaned.substring(0, maxLength);
  }

  // 10. Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `sanitize` instead.
 */
export const basicSanitize = sanitize;
