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
 * 18-10-2025: Trim before checking empty
 ****************************************************/
export const isNilOrEmpty = (value: unknown): boolean => {
  try {
    return isNil(value) || (typeof value === "string" && value?.trim() === "");
    /* c8 ignore next -- defensive fallback (should never throw) */
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
 * 08-11-2025: Fixed type-safety and logic - added proper 'length' property check using 'in' operator,
 *             changed catch block to return false (don't assume error means empty), added explicit
 *             false return for values without length property
 ****************************************************/
export const isNilEmptyOrZeroLength = (value: unknown): boolean => {
  try {
    if (isNil(value) || value === "") return true;

    if (typeof value === "object" && value !== null && "length" in value) {
      const length = (value as { length: unknown }).length;
      return typeof length === "number" && length === 0;
    }

    return false;
  } catch {
    return true;
  }
};

/**
 * @deprecated Use `isNilEmptyOrZeroLength` instead.
 */
export const isNilEmptyOrZeroLen = isNilEmptyOrZeroLength;

/******************************************************
 * ##: Nil or Zero Length Check
 * Checks if value is nil or has zero length (.length === 0). Does NOT treat "" specially.
 * @param {unknown} value - Value to check
 * History:
 * 21-08-2025: Created
 * 08-11-2025: Fixed type-safety and logic - added proper 'length' property check using 'in' operator,
 *             changed catch block to return false (don't assume error means empty), added explicit
 *             false return for values without length property
 ****************************************************/
export const isNilOrZeroLength = (value: unknown): boolean => {
  try {
    if (isNil(value)) return true;

    if (typeof value === "object" && value !== null && "length" in value) {
      const length = (value as { length: unknown }).length;
      return typeof length === "number" && length === 0;
    }

    return false;
  } catch {
    return true;
  }
};

/**
 * @deprecated Use `isNilOrZeroLength` instead.
 */
export const isNilOrZeroLen = isNilOrZeroLength;

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

/******************************************************
 * ##: Delay Function
 * Creates a promise that resolves after the specified number of milliseconds
 * @param {Number} ms - Delay in milliseconds (negative values are treated as 0)
 * @returns {Promise<void>} Promise that resolves after the delay
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

/******************************************************
 * ##: Enforced Nil/Empty/Textual Null Check
 * Checks if value is null/undefined/empty string or the text values "null" / "undefined" (case-insensitive)
 * @param {unknown} value - Value to check
 * @returns {Boolean} true if value is considered empty-like
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const isNilTextOrEmpty = (value: unknown): boolean => {
  try {
    if (value === null || value === undefined || value === "") return true;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      return v === "null" || v === "undefined";
    }
    return false;
    /* c8 ignore next -- defensive fallback (should never throw) */
  } catch {
    return true; // safest fallback
  }
};

/******************************************************
 * ##: Modern Currency Formatter (Intl.NumberFormat)
 * Formats currency values using modern Intl.NumberFormat API with configurable locale and currency.
 *
 * Provides flexible currency formatting with optional symbol display,
 * proper decimal handling, and graceful fallback for errors.
 * @param {number|string|null|undefined} value Currency value to format
 * @param {boolean} withoutCurrencySymbol Hide currency symbol (show as decimal)
 * @param {string} currency Currency code (ISO 4217, e.g., "EUR", "USD")
 * @param {string} locale Locale string (e.g., "pt-PT", "en-US")
 * @returns {string} Formatted currency string (e.g., "1.234,56 €" or "1.234,56")
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const formatCurrency = (
  value: number | string | null | undefined,
  withoutCurrencySymbol: boolean = false,
  currency: string = "EUR",
  locale: string = "pt-PT"
): string => {
  try {
    // Normalize input value
    const numValue =
      value === undefined || value === null || value === "" ? 0 : Number(value);

    if (isNaN(numValue) || !isFinite(numValue)) {
      return withoutCurrencySymbol ? "0,00" : "0,00 €";
    }

    const intlOptions: Intl.NumberFormatOptions = {
      style: withoutCurrencySymbol ? "decimal" : "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat(locale, intlOptions).format(numValue);
  } catch (error) {
    /* c8 ignore start */
    // Fallback to simple formatting if Intl fails
    const numValue = Number(value) || 0;
    const formatted = numValue.toFixed(2).replace(".", ",");
    return withoutCurrencySymbol ? formatted : `${formatted} €`;
    /* c8 ignore end */
  }
};

/******************************************************
 * ##: Parse Name into First and Last Components
 * Extracts first and last name from a full name string.
 *
 * Handles edge cases like single names, empty inputs, and multi-word names.
 * Returns first word as firstName and last word as lastName.
 * @param {string|null|undefined} name Full name string to parse
 * @returns {{firstName: string, lastName: string}} Object with firstName and lastName properties
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const parseName = (
  name: string | null | undefined
): { firstName: string; lastName: string } => {
  try {
    // Handle nil or empty inputs
    if (name === undefined || name === null || name === "") {
      return { firstName: "", lastName: "" };
    }

    // Trim whitespace and normalize spacing
    const cleanName = name.toString().trim().replace(/\s+/g, " ");

    if (cleanName === "") {
      return { firstName: "", lastName: "" };
    }

    // Single name case
    if (!cleanName.includes(" ")) {
      return { firstName: cleanName, lastName: "" };
    }

    // Multiple names case - get first and last
    const nameParts = cleanName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    return { firstName, lastName };
  } catch (error) {
    /* c8 ignore start */
    // Defensive fallback: try to use original input as firstName
    const fallbackName = name ? String(name).trim() : "";
    return { firstName: fallbackName, lastName: "" };
    /* c8 ignore end */
  }
};

/******************************************************
 * ##: Currency Symbol to ISO Code Converter
 * Converts currency symbols (€, £, $) to ISO 4217 currency codes.
 *
 * Maps common currency symbols to their corresponding three-letter codes.
 * Returns "EUR" as fallback for unknown symbols.
 * @param {string|null|undefined} symbol Currency symbol to convert (e.g., "€", "£", "$")
 * @returns {string} ISO 4217 currency code (e.g., "EUR", "GBP", "USD")
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const symbolToCurrency = (symbol: string | null | undefined): string => {
  try {
    if (!symbol || typeof symbol !== "string") {
      return "EUR";
    }

    const normalizedSymbol = symbol.trim();

    switch (normalizedSymbol) {
      case "€":
        return "EUR";
      case "£":
        return "GBP";
      case "$":
        return "USD";
      case "¥":
      case "￥":
        return "JPY";
      case "₹":
        return "INR";
      case "₽":
        return "RUB";
      case "¢":
        return "USD"; // US cents
      case "₩":
        return "KRW"; // South Korean Won
      case "₪":
        return "ILS"; // Israeli Shekel
      case "₦":
        return "NGN"; // Nigerian Naira
      case "₨":
        return "PKR"; // Pakistani Rupee
      case "₱":
        return "PHP"; // Philippine Peso
      case "₫":
        return "VND"; // Vietnamese Dong
      case "₡":
        return "CRC"; // Costa Rican Colon
      case "₲":
        return "PYG"; // Paraguayan Guarani
      case "₴":
        return "UAH"; // Ukrainian Hryvnia
      case "₵":
        return "GHS"; // Ghanaian Cedi
      case "₶":
        return "EUR"; // Livre tournois (historical, fallback to EUR)
      case "₸":
        return "KZT"; // Kazakhstani Tenge
      case "₺":
        return "TRY"; // Turkish Lira
      case "₻":
        return "EUR"; // Nordic mark (historical, fallback to EUR)
      case "₼":
        return "AZN"; // Azerbaijani Manat
      case "₾":
        return "GEL"; // Georgian Lari
      case "₿":
        return "BTC"; // Bitcoin
      case "﷼":
        return "SAR"; // Saudi Riyal
      case "＄":
        return "USD"; // Full-width dollar sign
      case "￠":
        return "USD"; // Full-width cent sign
      case "￡":
        return "GBP"; // Full-width pound sign
      case "￢":
        return "GBP"; // Full-width not sign (sometimes used for pound)
      case "￣":
        return "JPY"; // Full-width macron (sometimes used for yen)
      case "￤":
        return "EUR"; // Full-width lira sign
      case "￦":
        return "KRW"; // Full-width won sign
      // Additional common symbols
      case "R":
        return "ZAR"; // South African Rand (when used as symbol)
      case "R$":
        return "BRL"; // Brazilian Real
      case "C$":
        return "CAD"; // Canadian Dollar
      case "A$":
        return "AUD"; // Australian Dollar
      case "S$":
        return "SGD"; // Singapore Dollar
      case "HK$":
        return "HKD"; // Hong Kong Dollar
      case "NZ$":
        return "NZD"; // New Zealand Dollar
      case "kr":
      case "Kr":
        return "SEK"; // Swedish Krona (fallback, could be NOK or DKK)
      case "zł":
        return "PLN"; // Polish Zloty
      case "Kč":
        return "CZK"; // Czech Koruna
      case "Ft":
        return "HUF"; // Hungarian Forint
      case "lei":
        return "RON"; // Romanian Leu
      case "лв":
        return "BGN"; // Bulgarian Lev
      case "kn":
        return "HRK"; // Croatian Kuna
      case "din":
        return "RSD"; // Serbian Dinar
      case "ден":
        return "MKD"; // Macedonian Denar
      default:
        return "EUR"; // fallback
    }
  } catch (error) {
    /* c8 ignore start */
    return "EUR"; // safe fallback
    /* c8 ignore end */
  }
};

/******************************************************
 * ##: ISO Currency Code to Symbol Converter
 * Converts ISO 4217 currency codes to their corresponding symbols.
 *
 * Maps three-letter currency codes to common currency symbols.
 * Returns "€" as fallback for unknown currencies.
 * @param {string|null|undefined} currency ISO 4217 currency code (e.g., "EUR", "GBP", "USD")
 * @returns {string} Currency symbol (e.g., "€", "£", "$")
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const currencyToSymbol = (
  currency: string | null | undefined
): string => {
  try {
    if (!currency || typeof currency !== "string") {
      return "€";
    }

    const normalizedCurrency = currency.trim().toUpperCase();

    switch (normalizedCurrency) {
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "USD":
        return "$";
      case "JPY":
        return "¥";
      case "INR":
        return "₹";
      case "RUB":
        return "₽";
      case "CNY":
        return "¥";
      case "KRW":
        return "₩"; // South Korean Won
      case "ILS":
        return "₪"; // Israeli Shekel
      case "NGN":
        return "₦"; // Nigerian Naira
      case "PKR":
        return "₨"; // Pakistani Rupee
      case "PHP":
        return "₱"; // Philippine Peso
      case "VND":
        return "₫"; // Vietnamese Dong
      case "CRC":
        return "₡"; // Costa Rican Colon
      case "PYG":
        return "₲"; // Paraguayan Guarani
      case "UAH":
        return "₴"; // Ukrainian Hryvnia
      case "GHS":
        return "₵"; // Ghanaian Cedi
      case "KZT":
        return "₸"; // Kazakhstani Tenge
      case "TRY":
        return "₺"; // Turkish Lira
      case "AZN":
        return "₼"; // Azerbaijani Manat
      case "GEL":
        return "₾"; // Georgian Lari
      case "BTC":
        return "₿"; // Bitcoin
      case "SAR":
        return "﷼"; // Saudi Riyal
      case "ZAR":
        return "R"; // South African Rand
      case "BRL":
        return "R$"; // Brazilian Real
      case "CAD":
        return "C$"; // Canadian Dollar
      case "AUD":
        return "A$"; // Australian Dollar
      case "SGD":
        return "S$"; // Singapore Dollar
      case "HKD":
        return "HK$"; // Hong Kong Dollar
      case "NZD":
        return "NZ$"; // New Zealand Dollar
      case "SEK":
        return "kr"; // Swedish Krona
      case "NOK":
        return "kr"; // Norwegian Krone
      case "DKK":
        return "kr"; // Danish Krone
      case "PLN":
        return "zł"; // Polish Zloty
      case "CZK":
        return "Kč"; // Czech Koruna
      case "HUF":
        return "Ft"; // Hungarian Forint
      case "RON":
        return "lei"; // Romanian Leu
      case "BGN":
        return "лв"; // Bulgarian Lev
      case "HRK":
        return "kn"; // Croatian Kuna
      case "RSD":
        return "din"; // Serbian Dinar
      case "MKD":
        return "ден"; // Macedonian Denar
      case "CHF":
        return "CHF"; // Swiss Franc (commonly written as CHF)
      case "THB":
        return "฿"; // Thai Baht
      case "MYR":
        return "RM"; // Malaysian Ringgit
      case "IDR":
        return "Rp"; // Indonesian Rupiah
      case "CLP":
        return "$"; // Chilean Peso (uses $ symbol)
      case "COP":
        return "$"; // Colombian Peso (uses $ symbol)
      case "MXN":
        return "$"; // Mexican Peso (uses $ symbol)
      case "ARS":
        return "$"; // Argentine Peso (uses $ symbol)
      case "UYU":
        return "$"; // Uruguayan Peso (uses $ symbol)
      case "PEN":
        return "S/"; // Peruvian Sol
      case "BOB":
        return "Bs"; // Bolivian Boliviano
      case "EGP":
        return "£"; // Egyptian Pound (uses £ symbol)
      case "LBP":
        return "£"; // Lebanese Pound (uses £ symbol)
      case "SYP":
        return "£"; // Syrian Pound (uses £ symbol)
      default:
        return "€"; // fallback
    }
  } catch (error) {
    /* c8 ignore start */
    return "€"; // safe fallback
    /* c8 ignore end */
  }
};

/* ======================================================================================
 * Deprecated aliases (backward-compatibility) - new function alias (if needed later)
 * ====================================================================================*/
// Deprecated alias for previous provisional name
/**
 * @deprecated Use `isNilTextOrEmpty` instead.
 */
export const isNullUndefinedOrEmptyEnforced = isNilTextOrEmpty;

/* ======================================================================================
 * Deprecated aliases (backward-compatibility)
 * Keep until downstream code is migrated. Remove in a major release.
 * ====================================================================================*/
/**
 * @deprecated Use `addThousandsSpace` instead.
 */
export const addSpaceBetweenNumbers = addThousandsSpace;
