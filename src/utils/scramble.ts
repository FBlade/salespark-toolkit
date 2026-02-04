/******************************************************************
 * ##: Scramble helpers (obfuscation, not crypto)
 * Lightweight XOR scrambling for strings and JSON-serializable objects.
 * Notes: This is reversible obfuscation and NOT cryptographic security.
 ******************************************************************/

const hasBuffer =
  typeof Buffer !== "undefined" && typeof (Buffer as any).from === "function";

/******************************************************************
 * ##: Base64 Encode Binary
 * Base64-encodes a binary string (Latin-1) into a printable Base64 string.
 * Falls back to browser `btoa` when Buffer is unavailable.
 * @param {string} binary - Binary (Latin-1) string to encode
 * @returns {string} Base64-encoded string
 * History:
 * 28-01-2026: Created
 ******************************************************************/
const base64EncodeBinary = (binary: string): string => {
  if (hasBuffer) {
    return Buffer.from(binary, "binary").toString("base64");
  }
  if (typeof btoa === "function") {
    return btoa(binary);
  }
  throw new Error("Base64 encoder not available");
};

/******************************************************************
 * ##: Base64 Decode to Binary
 * Base64-decodes a Base64 string into a binary string (Latin-1).
 * Falls back to browser `atob` when Buffer is unavailable.
 * @param {string} base64 - Base64-encoded string
 * @returns {string} Binary (Latin-1) string
 * History:
 * 28-01-2026: Created
 ******************************************************************/
const base64DecodeToBinary = (base64: string): string => {
  if (hasBuffer) {
    return Buffer.from(base64, "base64").toString("binary");
  }
  if (typeof atob === "function") {
    return atob(base64);
  }
  throw new Error("Base64 decoder not available");
};

/******************************************************************
 * ##: UTF-8 to Binary
 * Converts a UTF-8 string into a binary string (Latin-1) for Base64 encoding.
 * Uses Buffer or TextEncoder when available.
 * @param {string} value - UTF-8 string
 * @returns {string} Binary (Latin-1) string
 * History:
 * 28-01-2026: Created
 ******************************************************************/
const utf8ToBinary = (value: string): string => {
  if (hasBuffer) {
    return Buffer.from(value, "utf8").toString("binary");
  }
  if (typeof TextEncoder !== "undefined") {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return binary;
  }
  return value;
};

/******************************************************************
 * ##: Binary to UTF-8
 * Converts a binary string (Latin-1) back into a UTF-8 string.
 * Uses Buffer or TextDecoder when available.
 * @param {string} binary - Binary (Latin-1) string
 * @returns {string} UTF-8 string
 * History:
 * 28-01-2026: Created
 ******************************************************************/
const binaryToUtf8 = (binary: string): string => {
  if (hasBuffer) {
    return Buffer.from(binary, "binary").toString("utf8");
  }
  if (typeof TextDecoder !== "undefined") {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) & 0xff;
    }
    return new TextDecoder().decode(bytes);
  }
  return binary;
};

const toBase64 = (value: string): string =>
  base64EncodeBinary(utf8ToBinary(value));

const fromBase64 = (value: string): string =>
  binaryToUtf8(base64DecodeToBinary(value));

/******************************************************************
 * ##: Scramble a string by XOR-ing each character with a repeating secret key
 * Applies an XOR operation between each character code and a repeating key character code.
 * The XOR result is then Base64-encoded for transport as a printable string.
 *
 * TL;DR: Obfuscate a string by XOR-ing it with a repeating secret and Base64-encoding the result.
 * Use only for reversible scrambling, not cryptographic protection.
 * @param {string} value - Plain string to scramble (typically a Base64-encoded JSON payload).
 * @param {string} secret - Secret key used as the repeating XOR mask.
 * @returns {SalesParkContract<any>} - Return a SalesPark Contract object
 * History:
 * 28-01-2026: Created
 * 04-02-2026: Refactored + return SalesPark Contract object
 ******************************************************************/
export const scrambleString = (
  value: string,
  secret: string,
): SalesParkContract<any> => {
  try {
    if (typeof value !== "string") {
      return { status: false, data: "Value must be a string" };
    }
    if (!secret || typeof secret !== "string") {
      return { status: false, data: "Secret must be a non-empty string" };
    }

    let result = "";

    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i) & 0xff;
      const keyCode = secret.charCodeAt(i % secret.length) & 0xff;

      result += String.fromCharCode(charCode ^ keyCode);
    }

    return { status: true, data: base64EncodeBinary(result) };

    // Error handling
  } catch (error) {
    return { status: false, data: error };
  }
};

/******************************************************************
 * ##: Descramble a Base64 string by reversing XOR with a repeating secret key
 * Base64-decodes the scrambled input to a binary string, then XORs each character with the key.
 * This reverses the scramble operation as long as the same secret key is used.
 *
 * TL;DR: Reverse the XOR-based scrambling using the same secret key.
 * It Base64-decodes, then XORs again to recover the original string.
 * @param {string} value - Base64-encoded scrambled input produced by the scrambler.
 * @param {string} secret - Secret key used as the repeating XOR mask (must match the encoding key).
 * @returns {SalesParkContract<any>} - Return a SalesPark Contract object
 * History:
 * 28-01-2026: Created
 * 04-02-2026: Refactored + return SalesPark Contract object
 ******************************************************************/
export const descrambleString = (
  value: string,
  secret: string,
): SalesParkContract<any> => {
  try {
    if (typeof value !== "string") {
      return { status: false, data: "Value must be a string" };
    }
    if (!secret || typeof secret !== "string") {
      return { status: false, data: "Secret must be a non-empty string" };
    }

    const decoded = base64DecodeToBinary(value);
    let result = "";

    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) & 0xff;
      const keyCode = secret.charCodeAt(i % secret.length) & 0xff;

      result += String.fromCharCode(charCode ^ keyCode);
    }

    return { status: true, data: result };

    // Error handling
  } catch (error) {
    return { status: false, data: error };
  }
};

/******************************************************************
 * ##: Encode object into scrambled Base64 string using a secret key
 * Serializes an input object to JSON, Base64-encodes it, and scrambles the result using a secret key.
 * This is intended for lightweight obfuscation of JSON payloads, not for cryptographic security.
 *
 * TL;DR: Turn an object into a scrambled string so it can be stored/transmitted less visibly.
 * It JSON-stringifies, Base64-encodes, then scrambles the payload with a secret key.
 * @param {object} input - Any JSON-serializable object to encode (arrays are also accepted as objects).
 * @param {string} secret - Secret key used to scramble the Base64 payload (must be a non-empty string).
 * @returns {string} - Scrambled Base64 string representing the encoded object.
 * @returns {SalesParkContract<any>} - Return a SalesPark Contract object
 * History:
 * 28-01-2026: Created
 * 04-02-2026: Refactored + return SalesPark Contract object
 ******************************************************************/
export const encodeObject = (
  input: object,
  secret: string,
): SalesParkContract<any> => {
  try {
    if (!input || typeof input !== "object") {
      return { status: false, data: "Input must be an object" };
    }
    if (!secret || typeof secret !== "string") {
      return { status: false, data: "Secret must be a non-empty string" };
    }

    const jsonString = JSON.stringify(input);
    const base64 = toBase64(jsonString);

    const scrambledResponse = scrambleString(base64, secret);
    if (!scrambledResponse.status) {
      return { status: false, data: "Scrambling failed" };
    }
    return { status: true, data: scrambledResponse.data };

    // Error handling
  } catch (error) {
    return { status: false, data: error };
  }
};

/******************************************************************
 * ##: Decode scrambled string back into an object using a secret key
 * Descrambles an encoded string with the provided secret, Base64-decodes it, and parses it as JSON.
 * This reverses the encode flow and returns the original JSON-compatible value if inputs are valid.
 *
 * TL;DR: Convert a scrambled string back into the original object using the same secret key.
 * It descrambles, Base64-decodes, then JSON-parses the payload.
 * @param {string} encoded - Scrambled Base64 string produced by the encoder/scrambler.
 * @param {string} secret - Secret key used to descramble the payload (must match the encoding key).
 * @returns {SalesParkContract<any>} - Return a SalesPark Contract object
 * History:
 * 28-01-2026: Created
 * 04-02-2026: Refactored + return SalesPark Contract object
 ******************************************************************/
export const decodeObject = (
  encoded: string,
  secret: string,
): SalesParkContract<any> => {
  try {
    if (typeof encoded !== "string") {
      return { status: false, data: "Encoded value must be a string" };
    }
    if (!secret || typeof secret !== "string") {
      return { status: false, data: "Secret must be a non-empty string" };
    }

    const descrambledResponse = descrambleString(encoded, secret);
    if (!descrambledResponse.status) {
      return { status: false, data: "Descrambling failed" };
    }
    const jsonString = fromBase64(descrambledResponse.data);

    return { status: true, data: JSON.parse(jsonString) };

    // Error handling
  } catch (error) {
    return { status: false, data: error };
  }
};
