/******************************************************
 * ##: Reversible Base36 Code Encoder/Decoder (No Deps)
 * Encodes a base36 identifier into a lower-case base36 code using a secret key.
 * Decodes back with the same secret and configuration.
 * History:
 * 16-02-2026: Created
 ****************************************************/

export type EncodeDecodeConfig = {
  secret: string;
  bitSize?: number;
  rotateBits?: number;
  addConstant?: string;
};

const DEFAULTS = {
  bitSize: 80,
  rotateBits: 17,
  addConstant: "0x1fd0a5b7c3",
};

/******************************************************************
 * ##: Validate Base36 Input String
 * Validates that the provided string contains only base36 characters (0-9 and A-Z/a-z).
 *
 * TL;DR: Checks if a string matches the base36 charset.
 * Helps reject unexpected characters before parsing.
 * @param {string} value - Raw input string to validate as base36
 * @returns {boolean} - True when the input contains only base36 characters
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const isValidBase36 = (value: string) => /^[a-z0-9]+$/i.test(value);

/******************************************************************
 * ##: Normalize User Input String
 * Normalizes a possibly empty value into a trimmed string to simplify downstream validation.
 *
 * TL;DR: Converts falsy input to "" and trims whitespace.
 * Avoids repeating null checks across parsing logic.
 * @param {string} value - Raw string input that may be empty or contain whitespace
 * @returns {string} - Trimmed string value (or empty string when input is falsy)
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const normalizeInput = (value: string) => (value || "").trim();

/******************************************************************
 * ##: Validate Encoder Secret Strength
 * Verifies that a secret is present and meets a minimum length requirement before encoding or decoding.
 *
 * TL;DR: Rejects missing or short secrets using a SalesParkContract response.
 * Enforces a baseline secret quality for reversible obfuscation.
 * @param {string} secret - Secret used to derive the reversible obfuscation key
 * @returns {SalesParkContract<true>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const assertSecret = (secret: string): SalesParkContract<true> => {
  if (typeof secret !== "string" || secret.trim().length < 12) {
    return { status: false, data: { message: "Missing or weak secret" } };
  }
  return { status: true, data: true };
};

/******************************************************************
 * ##: Parse Base36 String to BigInt
 * Parses a base36 identifier into a BigInt by accumulating digits after validation and normalization.
 *
 * TL;DR: Converts validated base36 text into a BigInt value.
 * Returns a contract result instead of throwing on invalid input.
 * @param {string} value - Base36 string to parse (case-insensitive)
 * @returns {SalesParkContract<bigint>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const parseBase36BigInt = (value: string): SalesParkContract<bigint> => {
  try {
    const normalizedValue = normalizeInput(value);
    if (!normalizedValue) {
      return { status: false, data: { message: "Empty input" } };
    }
    if (!isValidBase36(normalizedValue)) {
      return { status: false, data: { message: "Invalid base36 input" } };
    }

    const safeValue = normalizedValue.toLowerCase();
    let output = 0n;

    for (let i = 0; i < safeValue.length; i++) {
      const char = safeValue[i];
      const digit =
        char >= "0" && char <= "9"
          ? BigInt(char.charCodeAt(0) - 48)
          : BigInt(char.charCodeAt(0) - 87);

      output = output * 36n + digit;
    }

    return { status: true, data: output };
  } catch (error) {
    return {
      status: false,
      data: { message: "Failed to parse base36 input", error },
    };
  }
};

/******************************************************************
 * ##: Convert BigInt to Lowercase Base36
 * Converts a non-negative BigInt into a lowercase base36 string and wraps failures in a contract response.
 *
 * TL;DR: Turns a BigInt into lowercase base36 text.
 * Rejects negative values to avoid unexpected representations.
 * @param {bigint} value - BigInt value to convert (must be non-negative)
 * @returns {SalesParkContract<string>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const toBase36Lower = (value: bigint): SalesParkContract<string> => {
  try {
    if (value < 0n) {
      return {
        status: false,
        data: { message: "Negative values are not supported" },
      };
    }
    return { status: true, data: value.toString(36) };
  } catch (error) {
    return {
      status: false,
      data: { message: "Failed to convert to base36", error },
    };
  }
};

/******************************************************************
 * ##: Resolve Encoding Parameters and Bit Mask
 * Normalizes config values into BigInt parameters, bounds rotations, and generates a bit mask for fixed-width math.
 *
 * TL;DR: Computes bitSize, rotateBits, addConstant, and a mask from config/defaults.
 * Keeps operations bounded to a predictable bit width for reversibility.
 * @param {EncodeDecodeConfig} config - Config with secret and optional bit/rotation/constant settings
 * @returns {SalesParkContract<object>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const getParams = (
  config: EncodeDecodeConfig,
): SalesParkContract<{
  bitSize: bigint;
  rotateBits: bigint;
  addConstant: bigint;
  mask: bigint;
}> => {
  try {
    const bitSizeRaw = BigInt(config.bitSize ?? DEFAULTS.bitSize);
    if (bitSizeRaw <= 0n) {
      return {
        status: false,
        data: { message: "bitSize must be greater than 0" },
      };
    }

    const rotateRaw = BigInt(config.rotateBits ?? DEFAULTS.rotateBits);
    const rotateBits = ((rotateRaw % bitSizeRaw) + bitSizeRaw) % bitSizeRaw;
    const addConstant = BigInt(config.addConstant ?? DEFAULTS.addConstant);
    const mask = (1n << bitSizeRaw) - 1n;

    return {
      status: true,
      data: { bitSize: bitSizeRaw, rotateBits, addConstant, mask },
    };
  } catch (error) {
    return { status: false, data: { message: "Invalid configuration", error } };
  }
};

/******************************************************************
 * ##: Derive Key From Secret Within Bit Mask
 * Derives a deterministic BigInt key from the secret string and constrains it to the configured bit mask.
 *
 * TL;DR: Converts a secret into a bounded BigInt key for XOR mixing.
 * Ensures key material stays within the same bit width as the value.
 * @param {string} secret - Secret string used to derive the key material
 * @param {bigint} mask - Bit mask used to constrain the derived key
 * @returns {bigint} - Derived key value constrained by the provided mask
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const secretToKey = (secret: string, mask: bigint): bigint => {
  let key = 0n;
  const safeSecret = secret.trim();
  for (let i = 0; i < safeSecret.length; i++) {
    key = (key * 131n + BigInt(safeSecret.charCodeAt(i))) & mask;
  }
  return key;
};

/******************************************************************
 * ##: Rotate BigInt Left Within Fixed Bit Size
 * Performs a left bit rotation on a BigInt value within a fixed bit width and applies the provided mask.
 *
 * TL;DR: Rotates bits left while preserving only bitSize bits.
 * Used to scramble values in a reversible obfuscation flow.
 * @param {bigint} x - Value to rotate
 * @param {bigint} r - Rotation amount in bits (0..bitSize-1)
 * @param {bigint} bitSize - Fixed width of the rotation space in bits
 * @param {bigint} mask - Mask that preserves only bitSize bits
 * @returns {bigint} - Rotated value constrained to bitSize bits
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const rotl = (x: bigint, r: bigint, bitSize: bigint, mask: bigint) => {
  if (r === 0n) return x & mask;
  return ((x << r) | (x >> (bitSize - r))) & mask;
};

/******************************************************************
 * ##: Rotate BigInt Right Within Fixed Bit Size
 * Performs a right bit rotation on a BigInt value within a fixed bit width and applies the provided mask.
 *
 * TL;DR: Rotates bits right while preserving only bitSize bits.
 * Used to reverse the rotation step during decoding.
 * @param {bigint} x - Value to rotate
 * @param {bigint} r - Rotation amount in bits (0..bitSize-1)
 * @param {bigint} bitSize - Fixed width of the rotation space in bits
 * @param {bigint} mask - Mask that preserves only bitSize bits
 * @returns {bigint} - Rotated value constrained to bitSize bits
 * History:
 * 16-02-2026: Created
 ******************************************************************/
const rotr = (x: bigint, r: bigint, bitSize: bigint, mask: bigint) => {
  if (r === 0n) return x & mask;
  return ((x >> r) | (x << (bitSize - r))) & mask;
};

/******************************************************************
 * ##: Encode Base36 Identifier
 * Obfuscates a base36 identifier into a reversible lowercase base36 code using XOR mixing, constant addition, and rotation.
 *
 * TL;DR: Encodes a base36 identifier into a reversible base36 code.
 * Uses a secret-derived key and fixed-width math to keep outputs bounded and reversible.
 * @param {string} identifier - Source identifier in base36 format
 * @param {EncodeDecodeConfig} config - Encoding configuration including secret and optional parameters
 * @returns {SalesParkContract<{ code: string }>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
export const encodeBase36Code = (
  identifier: string,
  config: EncodeDecodeConfig,
): SalesParkContract<{ code: string }> => {
  try {
    const secretCheck = assertSecret(config?.secret);
    if (!secretCheck.status) {
      return { status: false, data: secretCheck.data };
    }

    const input = normalizeInput(identifier);
    if (!input) {
      return { status: false, data: { message: "Identifier is required" } };
    }
    if (!isValidBase36(input)) {
      return {
        status: false,
        data: { message: "Identifier must be base36 (0-9, A-Z)" },
      };
    }

    const parsed = parseBase36BigInt(input);
    if (!parsed.status) {
      return { status: false, data: parsed.data };
    }

    const params = getParams(config);
    if (!params.status) {
      return { status: false, data: params.data };
    }

    const {
      bitSize,
      rotateBits,
      addConstant,
      mask,
    }: {
      bitSize: bigint;
      rotateBits: bigint;
      addConstant: bigint;
      mask: bigint;
    } = params.data;
    const key = secretToKey(config.secret, mask);

    let value: bigint = (parsed.data as bigint) & mask;
    value = value ^ key;
    value = (value + addConstant) & mask;
    value = rotl(value, rotateBits, bitSize, mask);

    const codeResult = toBase36Lower(value);
    if (!codeResult.status) {
      return { status: false, data: codeResult.data };
    }

    return { status: true, data: { code: codeResult.data } };
  } catch (error) {
    return {
      status: false,
      data: { message: "Failed to encode code", error },
    };
  }
};

/******************************************************************
 * ##: Decode Base36 Code
 * Reverses the obfuscation steps to restore the original identifier using the same secret and configuration parameters.
 *
 * TL;DR: Decodes a base36 code back into the original identifier.
 * Requires the same secret and config to reliably reverse XOR, add, and rotation.
 * @param {string} code - Encoded base36 code to decode
 * @param {EncodeDecodeConfig} config - Decoding configuration including secret and optional parameters
 * @returns {SalesParkContract<{ identifier: string }>} - Return a SalesPark Contract object.
 * History:
 * 16-02-2026: Created
 ******************************************************************/
export const decodeBase36Code = (
  code: string,
  config: EncodeDecodeConfig,
): SalesParkContract<{ identifier: string }> => {
  try {
    const secretCheck = assertSecret(config?.secret);
    if (!secretCheck.status) {
      return { status: false, data: secretCheck.data };
    }

    const input = normalizeInput(code);
    if (!input) {
      return { status: false, data: { message: "Code is required" } };
    }
    if (!isValidBase36(input)) {
      return {
        status: false,
        data: { message: "Code must be base36 (0-9, a-z)" },
      };
    }

    const parsed = parseBase36BigInt(input);
    if (!parsed.status) {
      return { status: false, data: parsed.data };
    }

    const params = getParams(config);
    if (!params.status) {
      return { status: false, data: params.data };
    }

    const {
      bitSize,
      rotateBits,
      addConstant,
      mask,
    }: {
      bitSize: bigint;
      rotateBits: bigint;
      addConstant: bigint;
      mask: bigint;
    } = params.data;
    const key = secretToKey(config.secret, mask);

    let value: bigint = (parsed.data as bigint) & mask;
    value = rotr(value, rotateBits, bitSize, mask);
    value = (value - addConstant) & mask;
    value = value ^ key;

    const identifierResult = toBase36Lower(value);
    if (!identifierResult.status) {
      return { status: false, data: identifierResult.data };
    }

    return {
      status: true,
      data: { identifier: identifierResult.data.toUpperCase() },
    };
  } catch (error) {
    return {
      status: false,
      data: { message: "Failed to decode code", error },
    };
  }
};
