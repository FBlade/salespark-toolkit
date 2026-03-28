/******************************************************************
 * ##: Generate Random Number (non-crypto)
 * Returns a floating-point value in the range [0, 1) using Math.random().
 * @returns {number} - Random float between 0 (inclusive) and 1 (exclusive)
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const random = () => Math.random();

/******************************************************************
 * ##: Pick Random Array Item
 * Selects a random element from the provided array using Math.random().
 * @param {unknown[]} array - Source array to pick from
 * @returns {unknown} - Random element (undefined if array is empty)
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const randFromArray = (array: unknown[]) =>
  array[Math.floor(random() * array.length)];

/******************************************************************
 * ##: Random Integer From Interval
 * Generates an integer in the range [min, max) using Math.random().
 * @param {number} min - Inclusive lower bound
 * @param {number} max - Exclusive upper bound
 * @returns {number} - Random integer within the interval
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const randIntFromInterval = (min: number, max: number) =>
  Math.floor(random() * (max - min) + min);

/******************************************************************
 * ##: Shuffle Array In Place
 * Applies the Durstenfeld shuffle to randomize the array order in place.
 * @param {T[]} array - Array to shuffle (mutated)
 * @returns {T[]} - The same array instance, shuffled
 * History:
 * 28-03-2026: Created
 ******************************************************************/
// Durstenfeld shuffle
function shuffleArrayMutate<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/******************************************************************
 * ##: Shuffle Array Copy
 * Returns a shuffled copy of the input array without mutating the original.
 * @param {T[]} array - Array to shuffle (not mutated)
 * @returns {T[]} - New array with randomized order
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const shuffleArray = <T>(array: T[]): T[] => shuffleArrayMutate([...array]);

/******************************************************************
 * ##: Shuffle String Parts
 * Shuffles a string by splitting on a delimiter and rejoining after shuffle.
 * @param {string} str - Input string to shuffle
 * @param {string} delimiter - Split/join delimiter (default: empty string)
 * @returns {string} - Shuffled string
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const shuffleString = (str: string, delimiter = ""): string =>
  shuffleArrayMutate(str.split(delimiter)).join(delimiter);

/******************************************************************
 * ##: Create Random Token (non-crypto)
 * Builds a token string from a configurable alphabet and shuffles it.
 * Notes: This uses Math.random() and is NOT cryptographically secure.
 * @param {object} options - Token generation options
 * @param {boolean} options.withUppercase - Include A-Z (default: true)
 * @param {boolean} options.withLowercase - Include a-z (default: true)
 * @param {boolean} options.withNumbers - Include 0-9 (default: true)
 * @param {boolean} options.withSymbols - Include symbols (default: false)
 * @param {number} options.length - Token length (default: 64)
 * @param {string} options.alphabet - Custom alphabet (overrides flags)
 * @returns {string} - Generated token
 * History:
 * 28-03-2026: Created
 ******************************************************************/
function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
}: {
  withUppercase?: boolean;
  withLowercase?: boolean;
  withNumbers?: boolean;
  withSymbols?: boolean;
  length?: number;
  alphabet?: string;
} = {}): string {
  const allAlphabet =
    alphabet ??
    [
      withUppercase ? "ABCDEFGHIJKLMOPQRSTUVWXYZ" : "",
      withLowercase ? "abcdefghijklmopqrstuvwxyz" : "",
      withNumbers ? "0123456789" : "",
      withSymbols ? ".,;:!?./-\"'#{([-|\\@)]=}*+" : "",
    ].join("");

  const safeLength = Number.isFinite(length)
    ? Math.max(0, Math.floor(length))
    : 0;

  if (!allAlphabet || safeLength === 0) return "";

  let token = "";
  for (let i = 0; i < safeLength; i++) {
    token += allAlphabet[Math.floor(random() * allAlphabet.length)];
  }

  return token;
}

/******************************************************************
 * ##: Generate Random ID String
 * Builds a short id with a base36 random segment prefixed by "id-".
 * @returns {string} - Random id string
 * History:
 * 28-03-2026: Created
 ******************************************************************/
const generateRandomId = () => `id-${random().toString(36).substring(2, 12)}`;

export {
  random,
  randFromArray,
  randIntFromInterval,
  shuffleArray,
  shuffleArrayMutate,
  shuffleString,
  generateRandomId,
  createToken,
};
