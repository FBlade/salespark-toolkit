/******************************************************
 * ##: Portuguese Tax ID (NIF) Validator
 * Validates a Portuguese tax identification number ("NIF").
 *
 * Rules / Notes:
 * - Exactly 9 digits.
 * - Check digit (last digit) via Mod11 weights 9..2 over first 8 digits.
 *   sum = Σ(d[i]*w[i]); mod = sum % 11; check = (mod < 2 ? 0 : 11 - mod).
 * - Allowed leading digits: 1,2,3,5,6,8,9.
 * - Strips non-digit characters.
 * - Rejects repeated digit sequences (e.g., 000000000).
 * @param value Raw input to validate (string or number)
 * @returns true if valid, otherwise false.
 * History:
 * 25-09-2025: Created as isValidPTTaxId
 ****************************************************/
export function isPTTaxId(value: string | number): boolean {
  try {
    if (value === null || value === undefined) return false;

    let nif = String(value).trim();
    // Strip any non-digit characters
    nif = nif.replace(/[^0-9]/g, "");

    if (nif.length !== 9) return false;
    if (!/^\d{9}$/.test(nif)) return false;

    // Reject repeated digit sequences (all digits identical)
    if (/^(\d)\1{8}$/.test(nif)) return false;

    const first = nif[0];
    const defaultAllowed = new Set(["1", "2", "3", "5", "6", "8", "9"]);
    if (!defaultAllowed.has(first)) return false;

    // Compute control digit with weights 9..2
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const digit = parseInt(nif[i], 10);
      const weight = 9 - i; // i=0 => 9 ... i=7 => 2
      sum += digit * weight;
    }
    const mod11 = sum % 11;
    const checkDigit = mod11 < 2 ? 0 : 11 - mod11;
    return checkDigit === parseInt(nif[8], 10);
  } catch {
    /* c8 ignore start */
    return false; // Defensive fallback: any unexpected error results in invalid
    /* c8 ignore end */
  }
}

/**
 * @deprecated Use isPTTaxId instead.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const isValidPTTaxId = isPTTaxId;
