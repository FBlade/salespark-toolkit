/******************************************************
 * ##: Password Generator (sync + async modes)
 * Generates random passwords with optional memorable and pattern-based modes.
 * Supports deterministic entropy and passphrase words in async mode.
 * History:
 * 14-03-2026: Created
 ****************************************************/

type RandomBytesSync = (length: number) => Uint8Array;
type RandomBytesAsync = (length: number) => Promise<Uint8Array>;
type CryptoSource = Pick<Crypto, "getRandomValues" | "subtle">;

type GenerateOptions = {
  length?: number;
  memorable?: boolean;
  pattern?: RegExp;
  prefix?: string;
  ignoreSecurityRecommendations?: boolean;
  entropy?: Uint8Array | string;
  words?: number;
};

const hasCrypto =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).crypto !== "undefined";
const cryptoSource = hasCrypto ? (globalThis as any).crypto : undefined;
const textEncoder =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null;

const MAX_RANDOM_BYTES = 65_536;
const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const CONSONANT = new RegExp(`[${CONSONANTS}]$`, "i");
const DEFAULT_PATTERN = /\w/;
const DEFAULT_LENGTH = 12;
const MIN_ENTROPY_BITS = 64;
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 7;

// Minimum memorable characters needed to reach MIN_ENTROPY_BITS.
const MIN_MEMORABLE_LENGTH = (() => {
  let bits = 0;
  let len = 0;
  let vowel = false;
  while (bits < MIN_ENTROPY_BITS) {
    bits += Math.log2(vowel ? VOWELS.length : CONSONANTS.length);
    vowel = !vowel;
    len += 1;
  }
  return len;
})();

const ensureCrypto = () => {
  if (!cryptoSource) {
    throw new Error("WebCrypto is required for password generation");
  }
  return cryptoSource as Crypto;
};

const getRandomBytesSync: RandomBytesSync = (length: number): Uint8Array => {
  if (!Number.isFinite(length) || length < 0) {
    throw new RangeError("length must be a non-negative finite number");
  }
  const crypto = ensureCrypto();
  const buffer = new Uint8Array(length);
  for (let offset = 0; offset < length; offset += MAX_RANDOM_BYTES) {
    const end = Math.min(offset + MAX_RANDOM_BYTES, length);
    crypto.getRandomValues(buffer.subarray(offset, end));
  }
  return buffer;
};

const getRandomBytes: RandomBytesAsync = async (
  length: number,
): Promise<Uint8Array> => getRandomBytesSync(length);

const createDeterministicRandomBytes = async (
  entropy: Uint8Array,
  source: CryptoSource = ensureCrypto(),
): Promise<RandomBytesAsync> => {
  if (entropy.length === 0) {
    throw new RangeError("entropy must not be empty");
  }
  if (!source.subtle) {
    throw new Error("WebCrypto subtle is required for deterministic entropy");
  }

  const keyData = new Uint8Array(entropy).buffer;
  const key = await source.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  let counter = 0n;
  const counterBytes = new Uint8Array(8);
  const counterView = new DataView(counterBytes.buffer);

  const deterministicRandomBytes: RandomBytesAsync = async (
    length: number,
  ): Promise<Uint8Array> => {
    if (!Number.isFinite(length) || length < 0) {
      throw new RangeError("length must be a non-negative finite number");
    }

    const buffer = new Uint8Array(length);
    let offset = 0;

    while (offset < length) {
      counterView.setBigUint64(0, counter, false);
      counter += 1n;
      const block = new Uint8Array(
        await source.subtle!.sign("HMAC", key, counterBytes),
      );
      const take = Math.min(block.length, length - offset);
      buffer.set(block.subarray(0, take), offset);
      offset += take;
    }

    return buffer;
  };

  return deterministicRandomBytes;
};

const randomIntSync = (
  min: number,
  max: number,
  randomBytes: RandomBytesSync = getRandomBytesSync,
): number => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError("min and max must be finite numbers");
  }
  if (max <= min) {
    throw new RangeError("max must be greater than min");
  }

  const range = max - min;
  if (range === 1) {
    return min;
  }

  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = 256 ** bytesNeeded;
  const limit = maxValue - (maxValue % range);

  let value = limit;
  while (value >= limit) {
    const bytes = randomBytes(bytesNeeded);
    value = 0;
    for (const byte of bytes) {
      value = value * 256 + byte;
    }
  }

  return min + (value % range);
};

const randomInt = async (
  min: number,
  max: number,
  randomBytes: RandomBytesAsync = getRandomBytes,
): Promise<number> => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new RangeError("min and max must be finite numbers");
  }
  if (max <= min) {
    throw new RangeError("max must be greater than min");
  }

  const range = max - min;
  if (range === 1) {
    return min;
  }

  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = 256 ** bytesNeeded;
  const limit = maxValue - (maxValue % range);

  let value = limit;
  while (value >= limit) {
    const bytes = await randomBytes(bytesNeeded);
    value = 0;
    for (const byte of bytes) {
      value = value * 256 + byte;
    }
  }

  return min + (value % range);
};

const buildValidChars = (pattern: RegExp) => {
  const chars: string[] = [];
  for (let i = 33; i <= 126; i += 1) {
    const char = String.fromCharCode(i);
    if (pattern.test(char)) {
      chars.push(char);
    }
  }
  if (chars.length === 0) {
    throw new Error(
      `Could not find characters that match the password pattern ${pattern}. ` +
        "Patterns must match individual characters, not the password as a whole.",
    );
  }
  return chars;
};

const estimatePatternEntropy = (
  alphabetSize: number,
  length: number,
  prefixLength: number,
) => {
  const bitsPerChar = alphabetSize > 1 ? Math.log2(alphabetSize) : 0;
  return {
    entropyBits: bitsPerChar * Math.max(0, length - prefixLength),
    recommendedLength:
      bitsPerChar > 0
        ? prefixLength + Math.ceil(MIN_ENTROPY_BITS / bitsPerChar)
        : null,
  };
};

const estimateMemorableEntropy = (length: number, prefix: string) => {
  const effectiveLength = Math.max(0, length - prefix.length);
  let entropyBits = 0;
  let expectsVowel = CONSONANT.test(prefix);
  for (let i = 0; i < effectiveLength; i += 1) {
    entropyBits += Math.log2(expectsVowel ? VOWELS.length : CONSONANTS.length);
    expectsVowel = !expectsVowel;
  }

  let recommendedLength = prefix.length;
  let bits = 0;
  expectsVowel = CONSONANT.test(prefix);
  while (bits < MIN_ENTROPY_BITS) {
    bits += Math.log2(expectsVowel ? VOWELS.length : CONSONANTS.length);
    expectsVowel = !expectsVowel;
    recommendedLength += 1;
  }

  return { entropyBits, recommendedLength };
};

const buildMemorableSync = (
  length: number,
  startsWithVowel: boolean,
  nextInt: (min: number, max: number) => number,
) => {
  let expectsVowel = startsWithVowel;
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const alphabet = expectsVowel ? VOWELS : CONSONANTS;
    result += alphabet[nextInt(0, alphabet.length)];
    expectsVowel = !expectsVowel;
  }
  return result;
};

const buildMemorable = async (
  length: number,
  startsWithVowel: boolean,
  nextInt: (min: number, max: number) => Promise<number>,
) => {
  let expectsVowel = startsWithVowel;
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const alphabet = expectsVowel ? VOWELS : CONSONANTS;
    result += alphabet[await nextInt(0, alphabet.length)];
    expectsVowel = !expectsVowel;
  }
  return result;
};

const buildWordLengths = async (
  count: number,
  nextInt: (min: number, max: number) => Promise<number>,
  targetLength?: number,
) => {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < count; i += 1) {
    const len = await nextInt(MIN_WORD_LENGTH, MAX_WORD_LENGTH + 1);
    lengths.push(len);
    total += len;
  }

  if (targetLength !== undefined && total < targetLength) {
    const adjustable: number[] = [];
    for (let i = 0; i < count; i += 1) {
      if (lengths[i]! < MAX_WORD_LENGTH) adjustable.push(i);
    }

    let remaining = targetLength - total;
    while (remaining > 0 && adjustable.length > 0) {
      const pick = await nextInt(0, adjustable.length);
      const wordIdx = adjustable[pick]!;
      lengths[wordIdx] = lengths[wordIdx]! + 1;
      remaining -= 1;

      if (lengths[wordIdx]! >= MAX_WORD_LENGTH) {
        adjustable.splice(pick, 1);
      }
    }
  }

  return lengths;
};

const parseEntropy = (entropy: Uint8Array | string): Uint8Array => {
  if (typeof entropy === "string") {
    if (textEncoder) return textEncoder.encode(entropy);
    if (typeof Buffer !== "undefined") return Buffer.from(entropy, "utf8");
    throw new Error("TextEncoder is required for entropy strings");
  }
  if (entropy instanceof Uint8Array) {
    return entropy;
  }
  throw new TypeError("entropy must be a Uint8Array or string");
};

const validateOptions = (options?: GenerateOptions) => {
  const length = options?.length ?? DEFAULT_LENGTH;
  const memorable = options?.memorable ?? false;
  const pattern = options?.pattern ?? DEFAULT_PATTERN;
  const prefix = String(options?.prefix ?? "");
  const ignoreSecurityRecommendations =
    options?.ignoreSecurityRecommendations ?? false;
  const words = options?.words;

  if (!Number.isSafeInteger(length)) {
    throw new RangeError("length must be a safe integer");
  }
  if (length < 0) {
    throw new RangeError("length must be a non-negative integer");
  }
  if (!(pattern instanceof RegExp)) {
    throw new TypeError("pattern must be a RegExp");
  }
  if (words !== undefined) {
    if (!Number.isSafeInteger(words)) {
      throw new RangeError("words must be a safe integer");
    }
    if (words <= 0) {
      throw new RangeError("words must be a positive integer");
    }
  }
  if (words !== undefined && prefix !== "") {
    throw new Error("prefix is not supported when words are enabled");
  }

  return {
    length,
    memorable,
    pattern,
    prefix,
    ignoreSecurityRecommendations,
    words,
  };
};

const generatePasswordSync = (options?: GenerateOptions): string => {
  const {
    length,
    memorable,
    pattern,
    prefix,
    ignoreSecurityRecommendations,
    words,
  } = validateOptions(options);

  if (words !== undefined) {
    throw new Error("words requires async password generation");
  }

  const nextInt = (min: number, max: number) =>
    randomIntSync(min, max, getRandomBytesSync);

  // Memorable mode: direct alphabet indexing
  if (memorable) {
    if (!ignoreSecurityRecommendations) {
      const estimate = estimateMemorableEntropy(length, prefix);
      if (estimate.entropyBits < MIN_ENTROPY_BITS) {
        throw new Error(
          `Security recommendation: estimated entropy ${estimate.entropyBits.toFixed(
            1,
          )} bits is below ${MIN_ENTROPY_BITS} bits. Use length >= ${
            estimate.recommendedLength
          } or set memorable: false. To override, pass { ignoreSecurityRecommendations: true }.`,
        );
      }
    }
    const charCount = Math.max(0, length - prefix.length);
    return (
      prefix + buildMemorableSync(charCount, CONSONANT.test(prefix), nextInt)
    );
  }

  // Pattern mode
  const validChars = buildValidChars(pattern);
  if (!ignoreSecurityRecommendations) {
    const estimate = estimatePatternEntropy(
      validChars.length,
      length,
      prefix.length,
    );
    if (estimate.entropyBits < MIN_ENTROPY_BITS) {
      const recommendation =
        estimate.recommendedLength === null
          ? "Use a broader pattern to increase the character set."
          : `Use length >= ${estimate.recommendedLength} or broaden the pattern.`;
      throw new Error(
        `Security recommendation: estimated entropy ${estimate.entropyBits.toFixed(
          1,
        )} bits is below ${MIN_ENTROPY_BITS} bits. ${recommendation} To override, pass { ignoreSecurityRecommendations: true }.`,
      );
    }
  }

  let result = prefix;
  while (result.length < length) {
    result += validChars[nextInt(0, validChars.length)];
  }
  return result;
};

const generatePasswordAsync = async (
  options?: GenerateOptions,
): Promise<string> => {
  const {
    length,
    memorable,
    pattern,
    prefix,
    ignoreSecurityRecommendations,
    words,
  } = validateOptions(options);

  const entropy = options?.entropy;

  let entropyBytes: Uint8Array | undefined;
  if (entropy !== undefined) {
    entropyBytes = parseEntropy(entropy);
  }

  const randomBytes = entropyBytes
    ? await createDeterministicRandomBytes(entropyBytes)
    : getRandomBytes;
  const nextInt = (min: number, max: number) =>
    randomInt(min, max, randomBytes);

  // Passphrase mode
  if (words !== undefined) {
    if (
      !ignoreSecurityRecommendations &&
      words * MAX_WORD_LENGTH < MIN_MEMORABLE_LENGTH
    ) {
      const recommendedWords = Math.ceil(
        MIN_MEMORABLE_LENGTH / MAX_WORD_LENGTH,
      );
      throw new Error(
        `Security recommendation: word count ${words} cannot reach ${MIN_ENTROPY_BITS} bits with ${MIN_WORD_LENGTH}-${MAX_WORD_LENGTH} letter words. Use words >= ${recommendedWords}. To override, pass { ignoreSecurityRecommendations: true }.`,
      );
    }

    const targetLength = ignoreSecurityRecommendations
      ? undefined
      : MIN_MEMORABLE_LENGTH;
    const lengths = await buildWordLengths(words, nextInt, targetLength);
    const wordsList: string[] = [];
    for (const wordLength of lengths) {
      wordsList.push(await buildMemorable(wordLength, false, nextInt));
    }
    return wordsList.join(" ");
  }

  // Memorable mode: direct alphabet indexing
  if (memorable) {
    if (!ignoreSecurityRecommendations) {
      const estimate = estimateMemorableEntropy(length, prefix);
      if (estimate.entropyBits < MIN_ENTROPY_BITS) {
        throw new Error(
          `Security recommendation: estimated entropy ${estimate.entropyBits.toFixed(
            1,
          )} bits is below ${MIN_ENTROPY_BITS} bits. Use length >= ${
            estimate.recommendedLength
          } or set memorable: false. To override, pass { ignoreSecurityRecommendations: true }.`,
        );
      }
    }
    const charCount = Math.max(0, length - prefix.length);
    return (
      prefix +
      (await buildMemorable(charCount, CONSONANT.test(prefix), nextInt))
    );
  }

  // Pattern mode
  const validChars = buildValidChars(pattern);
  if (!ignoreSecurityRecommendations) {
    const estimate = estimatePatternEntropy(
      validChars.length,
      length,
      prefix.length,
    );
    if (estimate.entropyBits < MIN_ENTROPY_BITS) {
      const recommendation =
        estimate.recommendedLength === null
          ? "Use a broader pattern to increase the character set."
          : `Use length >= ${estimate.recommendedLength} or broaden the pattern.`;
      throw new Error(
        `Security recommendation: estimated entropy ${estimate.entropyBits.toFixed(
          1,
        )} bits is below ${MIN_ENTROPY_BITS} bits. ${recommendation} To override, pass { ignoreSecurityRecommendations: true }.`,
      );
    }
  }

  let result = prefix;
  while (result.length < length) {
    result += validChars[await nextInt(0, validChars.length)];
  }
  return result;
};

/******************************************************
 * ##: Generate Password
 * Default sync implementation; returns a Promise when async options are used.
 * @param {Number} length - Password length
 * @param {Boolean} memorable - Alternates consonants and vowels
 * @param {RegExp} pattern - Pattern applied to each character
 * @param {String} prefix - Prefix appended to the password
 * History:
 * 14-03-2026: Created
 ****************************************************/
export function generatePassword(
  length?: number,
  memorable?: boolean,
  pattern?: RegExp,
  prefix?: string,
): string;
export function generatePassword(
  options?: GenerateOptions,
): string | Promise<string>;
export function generatePassword(
  lengthOrOptions?: number | GenerateOptions,
  memorable?: boolean,
  pattern?: RegExp,
  prefix?: string,
): string | Promise<string> {
  if (typeof lengthOrOptions === "object") {
    const options = lengthOrOptions as GenerateOptions;
    const requiresAsync =
      options.words !== undefined || options.entropy !== undefined;
    return requiresAsync
      ? generatePasswordAsync(options)
      : generatePasswordSync(options);
  }

  const options: GenerateOptions = {};
  if (lengthOrOptions !== undefined) options.length = lengthOrOptions;
  if (memorable !== undefined) options.memorable = memorable;
  if (pattern !== undefined) options.pattern = pattern;
  if (prefix !== undefined) options.prefix = prefix;

  return generatePasswordSync(options);
}

/******************************************************
 * ##: Generate Password (options wrapper)
 * Full options support including async features (words, entropy).
 * History:
 * 14-03-2026: Created
 ****************************************************/
export const generatePasswordWithOptions = (
  options?: GenerateOptions,
): string | Promise<string> => {
  const requiresAsync =
    options?.words !== undefined || options?.entropy !== undefined;
  return requiresAsync
    ? generatePasswordAsync(options)
    : generatePasswordSync(options);
};

export type { GenerateOptions };
