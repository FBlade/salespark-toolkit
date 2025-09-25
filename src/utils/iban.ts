/******************************************************
 * ##: IBAN (International Bank Account Number) Validator
 * Validates International Bank Account Numbers according to ISO 13616.
 *
 * Rules / Notes:
 * - Country-specific format and length validation
 * - MOD-97 checksum validation
 * - BBAN (Basic Bank Account Number) format validation
 * - Supports all IBAN registry countries
 * - Strips spaces and formatting automatically
 * @param value Raw IBAN input to validate (string)
 * @returns true if valid IBAN, otherwise false.
 * History:
 * 25-09-2025: Adapted from ibantools library for SalesPark toolkit
 ****************************************************/
export function isValidIBAN(value: string): boolean {
  try {
    if (!value || typeof value !== "string") return false;

    // Strip formatting and convert to uppercase
    const iban = value.replace(/[\s-]/g, "").toUpperCase();

    // Basic length and format check
    if (iban.length < 15 || iban.length > 34) return false;
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;

    const countryCode = iban.slice(0, 2);
    const spec = countrySpecs[countryCode];

    // Check if country is supported
    if (!spec?.bban_regexp || !spec.chars) return false;

    // Verify length matches country specification
    if (spec.chars !== iban.length) return false;

    // Verify checksum digits are numeric
    if (!/^[0-9]{2}$/.test(iban.slice(2, 4))) return false;

    // Validate BBAN format
    const bban = iban.slice(4);
    if (!new RegExp(spec.bban_regexp).test(bban)) return false;

    // Validate BBAN with country-specific rules if available
    if (spec.bban_validation_func && !spec.bban_validation_func(bban))
      return false;

    // Validate IBAN checksum using MOD-97
    return isValidIBANChecksum(iban);
  } catch {
    /* c8 ignore start */
    return false; // Defensive fallback for any unexpected errors
    /* c8 ignore end */
  }
}

/******************************************************
 * ##: IBAN Checksum Validator
 * Validates IBAN checksum using MOD-97 algorithm per ISO 13616.
 *
 * Algorithm:
 * 1. Move country code and check digits to end
 * 2. Replace letters with numbers (A=10, B=11, ..., Z=35)
 * 3. Calculate MOD-97 of the resulting number
 * 4. Valid if remainder equals 1
 * @param iban Complete IBAN string to validate
 * @returns true if checksum is valid, otherwise false
 * History:
 * 25-09-2025: Created for IBAN validation
 ****************************************************/
function isValidIBANChecksum(iban: string): boolean {
  // Rearrange: move first 4 chars to end
  const rearranged = iban.slice(4) + iban.slice(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numericString = rearranged
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : char;
    })
    .join("");

  // Calculate MOD-97
  return mod97(numericString) === 1;
}

/******************************************************
 * ##: MOD-97 Calculator
 * Calculates MOD-97 for large numbers as strings to avoid overflow.
 *
 * Process chunks of max 9 digits to stay within JavaScript number limits
 * while maintaining precision for the modulo operation.
 * @param numStr Numeric string to calculate MOD-97 for
 * @returns MOD-97 remainder
 * History:
 * 25-09-2025: Created for IBAN checksum validation
 ****************************************************/
function mod97(numStr: string): number {
  let remainder = numStr;

  while (remainder.length > 2) {
    const chunk = remainder.slice(0, 9); // Max 9 digits to avoid overflow
    const chunkNum = parseInt(chunk, 10);

    if (isNaN(chunkNum)) return NaN;

    remainder = (chunkNum % 97) + remainder.slice(chunk.length);
  }

  return parseInt(remainder, 10) % 97;
}

/******************************************************
 * ##: Country Specification Interface
 * Defines structure for IBAN country specifications.
 * History:
 * 25-09-2025: Created for IBAN validation
 ****************************************************/
interface CountrySpec {
  chars?: number; // Total IBAN length for country
  bban_regexp?: string; // BBAN format regex
  bban_validation_func?: (bban: string) => boolean; // Custom validation
  IBANRegistry?: boolean; // Official IBAN registry member
  SEPA?: boolean; // SEPA member country
}

/******************************************************
 * ##: IBAN Country Specifications
 * Country-specific IBAN format definitions and validation rules.
 * Based on IBAN Registry and includes SEPA membership status.
 * History:
 * 25-09-2025: Adapted from ibantools library
 ****************************************************/
const countrySpecs: Record<string, CountrySpec> = {
  AD: {
    chars: 24,
    bban_regexp: "^[0-9]{8}[A-Z0-9]{12}$",
    IBANRegistry: true,
    SEPA: true,
  },
  AE: { chars: 23, bban_regexp: "^[0-9]{3}[0-9]{16}$", IBANRegistry: true },
  AL: { chars: 28, bban_regexp: "^[0-9]{8}[A-Z0-9]{16}$", IBANRegistry: true },
  AT: { chars: 20, bban_regexp: "^[0-9]{16}$", IBANRegistry: true, SEPA: true },
  AZ: { chars: 28, bban_regexp: "^[A-Z]{4}[A-Z0-9]{20}$", IBANRegistry: true },
  BA: {
    chars: 20,
    bban_regexp: "^[0-9]{16}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
  },
  BE: {
    chars: 16,
    bban_regexp: "^[0-9]{12}$",
    bban_validation_func: checkBelgianBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  BG: {
    chars: 22,
    bban_regexp: "^[A-Z]{4}[0-9]{6}[A-Z0-9]{8}$",
    IBANRegistry: true,
    SEPA: true,
  },
  BH: { chars: 22, bban_regexp: "^[A-Z]{4}[A-Z0-9]{14}$", IBANRegistry: true },
  BR: {
    chars: 29,
    bban_regexp: "^[0-9]{23}[A-Z]{1}[A-Z0-9]{1}$",
    IBANRegistry: true,
  },
  BY: {
    chars: 28,
    bban_regexp: "^[A-Z]{4}[0-9]{4}[A-Z0-9]{16}$",
    IBANRegistry: true,
  },
  CH: {
    chars: 21,
    bban_regexp: "^[0-9]{5}[A-Z0-9]{12}$",
    IBANRegistry: true,
    SEPA: true,
  },
  CR: { chars: 22, bban_regexp: "^[0-9]{18}$", IBANRegistry: true },
  CY: {
    chars: 28,
    bban_regexp: "^[0-9]{8}[A-Z0-9]{16}$",
    IBANRegistry: true,
    SEPA: true,
  },
  CZ: {
    chars: 24,
    bban_regexp: "^[0-9]{20}$",
    bban_validation_func: checkCzechSlovakBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  DE: { chars: 22, bban_regexp: "^[0-9]{18}$", IBANRegistry: true, SEPA: true },
  DK: { chars: 18, bban_regexp: "^[0-9]{14}$", IBANRegistry: true, SEPA: true },
  DO: { chars: 28, bban_regexp: "^[A-Z]{4}[0-9]{20}$", IBANRegistry: true },
  EE: {
    chars: 20,
    bban_regexp: "^[0-9]{16}$",
    bban_validation_func: checkEstonianBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  EG: { chars: 29, bban_regexp: "^[0-9]{25}$", IBANRegistry: true },
  ES: {
    chars: 24,
    bban_regexp: "^[0-9]{20}$",
    bban_validation_func: checkSpanishBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  FI: { chars: 18, bban_regexp: "^[0-9]{14}$", IBANRegistry: true, SEPA: true },
  FO: { chars: 18, bban_regexp: "^[0-9]{14}$", IBANRegistry: true },
  FR: {
    chars: 27,
    bban_regexp: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    bban_validation_func: checkFrenchBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  GB: {
    chars: 22,
    bban_regexp: "^[A-Z]{4}[0-9]{14}$",
    IBANRegistry: true,
    SEPA: true,
  },
  GE: { chars: 22, bban_regexp: "^[A-Z0-9]{2}[0-9]{16}$", IBANRegistry: true },
  GI: {
    chars: 23,
    bban_regexp: "^[A-Z]{4}[A-Z0-9]{15}$",
    IBANRegistry: true,
    SEPA: true,
  },
  GL: { chars: 18, bban_regexp: "^[0-9]{14}$", IBANRegistry: true },
  GR: {
    chars: 27,
    bban_regexp: "^[0-9]{7}[A-Z0-9]{16}$",
    IBANRegistry: true,
    SEPA: true,
  },
  GT: { chars: 28, bban_regexp: "^[A-Z0-9]{24}$", IBANRegistry: true },
  HR: {
    chars: 21,
    bban_regexp: "^[0-9]{17}$",
    bban_validation_func: checkCroatianBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  HU: {
    chars: 28,
    bban_regexp: "^[0-9]{24}$",
    bban_validation_func: checkHungarianBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  IE: {
    chars: 22,
    bban_regexp: "^[A-Z0-9]{4}[0-9]{14}$",
    IBANRegistry: true,
    SEPA: true,
  },
  IL: { chars: 23, bban_regexp: "^[0-9]{19}$", IBANRegistry: true },
  IS: { chars: 26, bban_regexp: "^[0-9]{22}$", IBANRegistry: true, SEPA: true },
  IT: {
    chars: 27,
    bban_regexp: "^[A-Z]{1}[0-9]{10}[A-Z0-9]{12}$",
    IBANRegistry: true,
    SEPA: true,
  },
  JO: {
    chars: 30,
    bban_regexp: "^[A-Z]{4}[0-9]{4}[A-Z0-9]{18}$",
    IBANRegistry: true,
  },
  KW: { chars: 30, bban_regexp: "^[A-Z]{4}[A-Z0-9]{22}$", IBANRegistry: true },
  KZ: { chars: 20, bban_regexp: "^[0-9]{3}[A-Z0-9]{13}$", IBANRegistry: true },
  LB: { chars: 28, bban_regexp: "^[0-9]{4}[A-Z0-9]{20}$", IBANRegistry: true },
  LC: { chars: 32, bban_regexp: "^[A-Z]{4}[A-Z0-9]{24}$", IBANRegistry: true },
  LI: {
    chars: 21,
    bban_regexp: "^[0-9]{5}[A-Z0-9]{12}$",
    IBANRegistry: true,
    SEPA: true,
  },
  LT: { chars: 20, bban_regexp: "^[0-9]{16}$", IBANRegistry: true, SEPA: true },
  LU: {
    chars: 20,
    bban_regexp: "^[0-9]{3}[A-Z0-9]{13}$",
    IBANRegistry: true,
    SEPA: true,
  },
  LV: {
    chars: 21,
    bban_regexp: "^[A-Z]{4}[A-Z0-9]{13}$",
    IBANRegistry: true,
    SEPA: true,
  },
  MC: {
    chars: 27,
    bban_regexp: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    bban_validation_func: checkFrenchBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  MD: {
    chars: 24,
    bban_regexp: "^[A-Z0-9]{2}[A-Z0-9]{18}$",
    IBANRegistry: true,
  },
  ME: {
    chars: 22,
    bban_regexp: "^[0-9]{18}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
  },
  MK: {
    chars: 19,
    bban_regexp: "^[0-9]{3}[A-Z0-9]{10}[0-9]{2}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
  },
  MR: { chars: 27, bban_regexp: "^[0-9]{23}$", IBANRegistry: true },
  MT: {
    chars: 31,
    bban_regexp: "^[A-Z]{4}[0-9]{5}[A-Z0-9]{18}$",
    IBANRegistry: true,
    SEPA: true,
  },
  MU: {
    chars: 30,
    bban_regexp: "^[A-Z]{4}[0-9]{19}[A-Z]{3}$",
    IBANRegistry: true,
  },
  NL: {
    chars: 18,
    bban_regexp: "^[A-Z]{4}[0-9]{10}$",
    IBANRegistry: true,
    SEPA: true,
  },
  NO: {
    chars: 15,
    bban_regexp: "^[0-9]{11}$",
    bban_validation_func: checkNorwegianBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  PK: { chars: 24, bban_regexp: "^[A-Z0-9]{4}[0-9]{16}$", IBANRegistry: true },
  PL: {
    chars: 28,
    bban_regexp: "^[0-9]{24}$",
    bban_validation_func: checkPolishBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  PS: { chars: 29, bban_regexp: "^[A-Z0-9]{4}[0-9]{21}$", IBANRegistry: true },
  PT: {
    chars: 25,
    bban_regexp: "^[0-9]{21}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  QA: { chars: 29, bban_regexp: "^[A-Z]{4}[A-Z0-9]{21}$", IBANRegistry: true },
  RO: {
    chars: 24,
    bban_regexp: "^[A-Z]{4}[A-Z0-9]{16}$",
    IBANRegistry: true,
    SEPA: true,
  },
  RS: {
    chars: 22,
    bban_regexp: "^[0-9]{18}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
  },
  SA: { chars: 24, bban_regexp: "^[0-9]{2}[A-Z0-9]{18}$", IBANRegistry: true },
  SE: { chars: 24, bban_regexp: "^[0-9]{20}$", IBANRegistry: true, SEPA: true },
  SI: {
    chars: 19,
    bban_regexp: "^[0-9]{15}$",
    bban_validation_func: checkMod97BBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  SK: {
    chars: 24,
    bban_regexp: "^[0-9]{20}$",
    bban_validation_func: checkCzechSlovakBBAN,
    IBANRegistry: true,
    SEPA: true,
  },
  SM: {
    chars: 27,
    bban_regexp: "^[A-Z]{1}[0-9]{10}[A-Z0-9]{12}$",
    IBANRegistry: true,
    SEPA: true,
  },
  TN: { chars: 24, bban_regexp: "^[0-9]{20}$", IBANRegistry: true },
  TR: { chars: 26, bban_regexp: "^[0-9]{5}[A-Z0-9]{17}$", IBANRegistry: true },
  UA: { chars: 29, bban_regexp: "^[0-9]{6}[A-Z0-9]{19}$", IBANRegistry: true },
  VG: { chars: 24, bban_regexp: "^[A-Z0-9]{4}[0-9]{16}$", IBANRegistry: true },
  XK: { chars: 20, bban_regexp: "^[0-9]{16}$", IBANRegistry: true },
};

/******************************************************
 * ##: MOD-97 BBAN Validator
 * Validates BBAN using MOD-97 algorithm for specific countries.
 *
 * Used by countries like Portugal, Slovenia, Serbia, etc.
 * that use MOD-97 checksum validation for their BBAN format.
 * @param bban Basic Bank Account Number to validate
 * @returns true if BBAN passes MOD-97 validation, otherwise false
 * History:
 * 25-09-2025: Created for country-specific IBAN validation
 ****************************************************/
function checkMod97BBAN(bban: string): boolean {
  const stripped = bban.replace(/[\s.]+/g, "");
  return mod97(stripped) === 1;
}

/******************************************************
 * ##: Belgian BBAN Validator
 * Validates Belgian BBAN format using national checksum algorithm.
 *
 * Belgian IBANs use a specific checksum calculation where the
 * remainder of account number divided by 97 must equal the control digits.
 * @param bban Basic Bank Account Number to validate (12 digits)
 * @returns true if BBAN passes Belgian validation, otherwise false
 * History:
 * 25-09-2025: Created for Belgian IBAN validation
 ****************************************************/
function checkBelgianBBAN(bban: string): boolean {
  const stripped = bban.replace(/[\s.]+/g, "");
  const checkingPart = parseInt(stripped.substring(0, stripped.length - 2), 10);
  const checksum = parseInt(stripped.substring(stripped.length - 2), 10);
  const remainder = checkingPart % 97 === 0 ? 97 : checkingPart % 97;
  return remainder === checksum;
}

/******************************************************
 * ##: Czech/Slovak BBAN Validator
 * Validates Czech Republic and Slovakia BBAN format using weighted checksums.
 *
 * Both countries use similar validation with weighted digit calculations
 * for prefix (positions 4-9) and suffix (positions 10-19) sections.
 * @param bban Basic Bank Account Number to validate (20 digits)
 * @returns true if BBAN passes Czech/Slovak validation, otherwise false
 * History:
 * 25-09-2025: Created for Czech Republic and Slovakia IBAN validation
 ****************************************************/
function checkCzechSlovakBBAN(bban: string): boolean {
  const weightsPrefix = [10, 5, 8, 4, 2, 1];
  const weightsSuffix = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
  const controlPrefix = parseInt(bban.charAt(9), 10);
  const controlSuffix = parseInt(bban.charAt(19), 10);
  const prefix = bban.substring(4, 9);
  const suffix = bban.substring(10, 19);

  let sum = 0;
  for (let i = 0; i < prefix.length; i++) {
    sum += parseInt(prefix.charAt(i), 10) * weightsPrefix[i];
  }
  let remainder = sum % 11;
  if (
    controlPrefix !==
    (remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder)
  ) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < suffix.length; i++) {
    sum += parseInt(suffix.charAt(i), 10) * weightsSuffix[i];
  }
  remainder = sum % 11;
  return (
    controlSuffix ===
    (remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder)
  );
}

/******************************************************
 * ##: Estonian BBAN Validator
 * Validates Estonian BBAN format using weighted checksum algorithm.
 *
 * Estonian IBANs use weighted digit calculation with specific weights
 * applied to positions 2-14, with control digit at position 15.
 * @param bban Basic Bank Account Number to validate (16 digits)
 * @returns true if BBAN passes Estonian validation, otherwise false
 * History:
 * 25-09-2025: Created for Estonian IBAN validation
 ****************************************************/
function checkEstonianBBAN(bban: string): boolean {
  const weights = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  const controlDigit = parseInt(bban.charAt(15), 10);
  const toCheck = bban.substring(2, 15);
  let sum = 0;
  for (let i = 0; i < toCheck.length; i++) {
    sum += parseInt(toCheck.charAt(i), 10) * weights[i];
  }
  const remainder = sum % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
}

/******************************************************
 * ##: Spanish BBAN Validator
 * Validates Spanish BBAN format using dual checksum algorithm.
 *
 * Spanish IBANs have two control digits: one for bank/branch (position 8)
 * and one for account number (position 9), each with specific weights.
 * @param bban Basic Bank Account Number to validate (20 digits)
 * @returns true if BBAN passes Spanish validation, otherwise false
 * History:
 * 25-09-2025: Created for Spanish IBAN validation
 ****************************************************/
function checkSpanishBBAN(bban: string): boolean {
  const weightsBankBranch = [4, 8, 5, 10, 9, 7, 3, 6];
  const weightsAccount = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];
  const controlBankBranch = parseInt(bban.charAt(8), 10);
  const controlAccount = parseInt(bban.charAt(9), 10);
  const bankBranch = bban.substring(0, 8);
  const account = bban.substring(10, 20);

  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(bankBranch.charAt(i), 10) * weightsBankBranch[i];
  }
  let remainder = sum % 11;
  if (
    controlBankBranch !==
    (remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder)
  ) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(account.charAt(i), 10) * weightsAccount[i];
  }
  remainder = sum % 11;
  return (
    controlAccount ===
    (remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder)
  );
}

/******************************************************
 * ##: French/Monaco BBAN Validator
 * Validates French and Monaco BBAN format using character conversion and MOD-97.
 *
 * French IBANs convert letters to numbers using specific mapping (A/J=1, B/K/S=2, etc.)
 * then apply MOD-97 validation. Also used by Monaco (MC).
 * @param bban Basic Bank Account Number to validate (23 characters)
 * @returns true if BBAN passes French validation, otherwise false
 * History:
 * 25-09-2025: Created for French and Monaco IBAN validation
 ****************************************************/
function checkFrenchBBAN(bban: string): boolean {
  const stripped = bban.replace(/[\s.]+/g, "");
  const normalized = Array.from(stripped);

  for (let i = 0; i < stripped.length; i++) {
    const c = normalized[i].charCodeAt(0);
    if (c >= 65) {
      switch (c) {
        case 65:
        case 74:
          normalized[i] = "1";
          break;
        case 66:
        case 75:
        case 83:
          normalized[i] = "2";
          break;
        case 67:
        case 76:
        case 84:
          normalized[i] = "3";
          break;
        case 68:
        case 77:
        case 85:
          normalized[i] = "4";
          break;
        case 69:
        case 78:
        case 86:
          normalized[i] = "5";
          break;
        case 70:
        case 79:
        case 87:
          normalized[i] = "6";
          break;
        case 71:
        case 80:
        case 88:
          normalized[i] = "7";
          break;
        case 72:
        case 81:
        case 89:
          normalized[i] = "8";
          break;
        case 73:
        case 82:
        case 90:
          normalized[i] = "9";
          break;
      }
    }
  }

  return mod97(normalized.join("")) === 0;
}

/******************************************************
 * ##: Croatian BBAN Validator
 * Validates Croatian BBAN format using dual MOD-11 checksums.
 *
 * Croatian IBANs have two control digits: one for bank/branch (position 6)
 * and one for account number (position 16), both using MOD-11 algorithm.
 * @param bban Basic Bank Account Number to validate (17 digits)
 * @returns true if BBAN passes Croatian validation, otherwise false
 * History:
 * 25-09-2025: Created for Croatian IBAN validation
 ****************************************************/
function checkCroatianBBAN(bban: string): boolean {
  const controlBankBranch = parseInt(bban.charAt(6), 10);
  const controlAccount = parseInt(bban.charAt(16), 10);
  const bankBranch = bban.substring(0, 6);
  const account = bban.substring(7, 16);

  return (
    checkMod11(bankBranch, controlBankBranch) &&
    checkMod11(account, controlAccount)
  );
}

/******************************************************
 * ##: MOD-11 Checksum Validator
 * Validates number sequence using MOD-11 algorithm with specific rules.
 *
 * Implementation of MOD-11 algorithm used by Croatian and other
 * banking systems for account number validation.
 * @param toCheck Number sequence to validate (string of digits)
 * @param control Expected control digit for validation
 * @returns true if control digit matches MOD-11 calculation, otherwise false
 * History:
 * 25-09-2025: Created for Croatian IBAN validation
 ****************************************************/
function checkMod11(toCheck: string, control: number): boolean {
  let nr = 10;
  for (let i = 0; i < toCheck.length; i++) {
    nr += parseInt(toCheck.charAt(i), 10);
    if (nr % 10 !== 0) {
      nr = nr % 10;
    }
    nr = nr * 2;
    nr = nr % 11;
  }
  return control === (11 - nr === 10 ? 0 : 11 - nr);
}

/******************************************************
 * ##: Hungarian BBAN Validator
 * Validates Hungarian BBAN format using weighted checksums with special rules.
 *
 * Hungarian IBANs use weighted digit validation for bank/branch control
 * and different logic for account validation based on account type.
 * @param bban Basic Bank Account Number to validate (24 digits)
 * @returns true if BBAN passes Hungarian validation, otherwise false
 * History:
 * 25-09-2025: Created for Hungarian IBAN validation
 ****************************************************/
function checkHungarianBBAN(bban: string): boolean {
  const weights = [9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3, 1, 9, 7, 3];
  const controlDigitBankBranch = parseInt(bban.charAt(7), 10);
  const toCheckBankBranch = bban.substring(0, 7);

  let sum = 0;
  for (let i = 0; i < toCheckBankBranch.length; i++) {
    sum += parseInt(toCheckBankBranch.charAt(i), 10) * weights[i];
  }
  const remainder = sum % 10;
  if (controlDigitBankBranch !== (remainder === 0 ? 0 : 10 - remainder)) {
    return false;
  }

  if (bban.endsWith("00000000")) {
    const toCheckAccount = bban.substring(8, 15);
    const controlDigitAccount = parseInt(bban.charAt(15), 10);
    sum = 0;
    for (let i = 0; i < toCheckAccount.length; i++) {
      sum += parseInt(toCheckAccount.charAt(i), 10) * weights[i];
    }
    const accountRemainder = sum % 10;
    return (
      controlDigitAccount ===
      (accountRemainder === 0 ? 0 : 10 - accountRemainder)
    );
  } else {
    const toCheckAccount = bban.substring(8, 23);
    const controlDigitAccount = parseInt(bban.charAt(23), 10);
    sum = 0;
    for (let i = 0; i < toCheckAccount.length; i++) {
      sum += parseInt(toCheckAccount.charAt(i), 10) * weights[i];
    }
    const accountRemainder = sum % 10;
    return (
      controlDigitAccount ===
      (accountRemainder === 0 ? 0 : 10 - accountRemainder)
    );
  }
}

/******************************************************
 * ##: Norwegian BBAN Validator
 * Validates Norwegian BBAN format using weighted checksum algorithm.
 *
 * Norwegian IBANs use weighted digit calculation with specific weights
 * applied to first 10 digits, with control digit at position 10.
 * @param bban Basic Bank Account Number to validate (11 digits)
 * @returns true if BBAN passes Norwegian validation, otherwise false
 * History:
 * 25-09-2025: Created for Norwegian IBAN validation
 ****************************************************/
function checkNorwegianBBAN(bban: string): boolean {
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const stripped = bban.replace(/[\s.]+/g, "");
  const controlDigit = parseInt(stripped.charAt(10), 10);
  const toCheck = stripped.substring(0, 10);

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(toCheck.charAt(i), 10) * weights[i];
  }
  const remainder = sum % 11;
  return controlDigit === (remainder === 0 ? 0 : 11 - remainder);
}

/******************************************************
 * ##: Polish BBAN Validator
 * Validates Polish BBAN format using weighted checksum algorithm.
 *
 * Polish IBANs use weighted digit calculation with specific weights
 * applied to first 7 digits, with control digit at position 7.
 * @param bban Basic Bank Account Number to validate (24 digits)
 * @returns true if BBAN passes Polish validation, otherwise false
 * History:
 * 25-09-2025: Created for Polish IBAN validation
 ****************************************************/
function checkPolishBBAN(bban: string): boolean {
  const weights = [3, 9, 7, 1, 3, 9, 7];
  const controlDigit = parseInt(bban.charAt(7), 10);
  const toCheck = bban.substring(0, 7);

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(toCheck.charAt(i), 10) * weights[i];
  }
  const remainder = sum % 10;
  return controlDigit === (remainder === 0 ? 0 : 10 - remainder);
}
