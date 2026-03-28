# SalesPark Toolkit v2 - Documentation

## @salespark/toolkit

Shared toolkit of helpers and utilities for **Node.js**, **React**, and browser environments.  
Tree-shakeable, TypeScript-first, ESM + CJS outputs.

[![Coverage](https://codecov.io/gh/FBlade/salespark-toolkit/branch/main/graph/badge.svg)](https://codecov.io/gh/FBlade/salespark-toolkit)
[![npm version](https://img.shields.io/npm/v/%40salespark%2Ftoolkit.svg)](https://www.npmjs.com/package/@salespark/toolkit)
![types](https://img.shields.io/npm/types/%40salespark%2Ftoolkit)
![modules](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-1f6feb)
![tree-shakeable](https://img.shields.io/badge/tree--shakeable-yes-success)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

---

## 📦 Installation

```bash
yarn add @salespark/toolkit
# or
npm i @salespark/toolkit
```

## ✨ Features

- **Array utilities**: chunk, uniqBy, deep equality, flatten, groupBy, etc.
- **Object utilities**: pick, omit, clean objects, deep merge, etc.
- **String utilities**: slugify, template fill, deburr, sanitize, capitalize words/sentences, SMS length.
- **Number utilities**: clamp, round, safe arithmetic/comparisons, safe parse (locale-aware), random digits, etc.
- **Random utilities**: token generation helpers (non-crypto), random IDs, shuffle helpers
- **Function utilities**: debounce, throttle, safeJSONParse, formatCurrency, parseName, currency conversions, etc.
- **Defer utilities**: post-return microtask scheduling, non-critical timers, after-response hooks.
- **Boolean utilities**: safe boolean conversion with common representations
- **Validation utilities**: IBAN validator (ISO 13616), Portuguese tax ID validator
- **Security utilities**: Markdown XSS protection, content sanitization, risk assessment, password generation, obfuscation helpers, reversible base36 code encoding/decoding
- **UUID utilities**: uuidv4 generator (RFC 4122)
- **Environment detection**: `isBrowser`, `isNode` runtime checks

---

## 🚀 Usage

Get started in seconds with a few common utilities:

### Named Imports (Tree-shakeable)

```typescript
import {
  debounce,
  delay,
  chunk,
  slugify,
  clamp,
  isBrowser,
  toBool,
  generatePassword,
  smsLength,
  uuidv4,
} from "@salespark/toolkit";

// Debounce a function
const debouncedFn = debounce(() => {
  /* ... */
}, 200);

// Delay execution
await delay(1000); // Wait 1 second

// Chunk an array
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1,2],[3,4],[5]]

// Slugify a string
const slug = slugify("Olá mundo!"); // "ola-mundo"

// Clamp a number
const safe = clamp(15, 0, 10); // 10

// Convert to boolean
const bool = toBool("yes"); // true

// Generate a password (sync by default)
const recoveryToken = generatePassword(96, false);

// SMS length and segmentation
const sms = smsLength("hello");

// Generate UUID v4
const id = uuidv4();

// Check environment
if (isBrowser) {
  /* browser-specific code */
}
```

### Lodash-style Import (Alternative)

```typescript
import * as _ from "@salespark/toolkit";

// Debounce a function
const debouncedFn = _.debounce(() => {
  /* ... */
}, 200);

// Chunk an array
const chunks = _.chunk([1, 2, 3, 4, 5], 2); // [[1,2],[3,4],[5]]

// Slugify a string
const slug = _.slugify("Olá mundo!"); // "ola-mundo"

// Clamp a number
const safe = _.clamp(15, 0, 10); // 10

// Convert to boolean
const bool = _.toBool("yes"); // true

// Generate UUID v4
const id = _.uuidv4();

// Check environment
if (_.isBrowser) {
  /* browser-specific code */
}
```

## 📚 API Reference

### 📋 Array Utilities

**`chunk<T>(arr: T[], size: number): T[][]`** — Splits an array into equally sized pieces.

```javascript
chunk([1, 2, 3, 4, 5], 2);
// Result: [[1, 2], [3, 4], [5]]
```

**`uniq<T>(arr: T[]): T[]`** — Removes duplicate values from an array.

```javascript
uniq([1, 2, 2, 3, 3, 3]);
// Result: [1, 2, 3]
```

**`uniqBy<T, K>(arr: T[], key: (v: T) => K): T[]`** — Returns unique items based on a computed key.

```javascript
uniqBy(
  [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 1, name: "John" },
  ],
  (x) => x.id,
);
// Result: [{id: 1, name: 'John'}, {id: 2, name: 'Jane'}]
```

**`areArraysEqual<T>(arr1: T[], arr2: T[]): boolean`** — Deeply compares two arrays for equality.

```javascript
areArraysEqual([1, 2, 3], [1, 2, 3]);
// Result: true
```

**`flatten<T>(arr: any[]): T[]`** — Flattens nested arrays into a single array (1 level deep).

```javascript
flatten([1, [2, 3], [4, [5]]]);
// Result: [1, 2, 3, 4, [5]]
```

**`flattenOnce<T>(array): T[]`** — Flattens array a single level deep.

```javascript
flattenOnce([1, [2, 3], [4, 5]]);
// Result: [1, 2, 3, 4, 5]
```

**`flattenDepth<T>(array, depth?, options?): T[]`** — Flattens array up to specified depth.

```javascript
flattenDepth([1, [2, [3, [4]]]], 2);
// Result: [1, 2, 3, [4]]
```

**`groupBy<T, K>(arr: T[], key: ((item: T) => K) | K): Record<string, T[]>`** — Groups array items by a key or function.

```javascript
groupBy(
  [
    { type: "fruit", name: "apple" },
    { type: "fruit", name: "banana" },
    { type: "veggie", name: "carrot" },
  ],
  "type",
);
// Result: {fruit: [{type: 'fruit', name: 'apple'}, {type: 'fruit', name: 'banana'}], veggie: [{type: 'veggie', name: 'carrot'}]}
```

**`sortBy<T>(arr: T[], key: ((item: T) => any) | keyof T): T[]`** — Sorts array by a key or function.

```javascript
sortBy([{ age: 30 }, { age: 20 }, { age: 25 }], "age");
// Result: [{age: 20}, {age: 25}, {age: 30}]
```

**`difference<T>(arr1: T[], arr2: T[]): T[]`** — Returns elements in arr1 not present in arr2.

```javascript
difference([1, 2, 3, 4], [2, 4, 6]);
// Result: [1, 3]
```

**`intersection<T>(arr1: T[], arr2: T[]): T[]`** — Returns elements common to both arrays.

```javascript
intersection([1, 2, 3], [2, 3, 4]);
// Result: [2, 3]
```

**`compact<T>(arr: T[]): T[]`** — Removes falsy values from array.

```javascript
compact([0, 1, false, 2, "", 3, null, undefined, 4]);
// Result: [1, 2, 3, 4]
```

**`pluck<T, K>(arr: T[], key: K): Array<T[K]>`** — Extracts a property from each object in array.

```javascript
pluck(
  [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 },
  ],
  "name",
);
// Result: ['John', 'Jane']
```

**`shuffle<T>(arr: T[]): T[]`** — Shuffles array elements randomly.

```javascript
shuffle([1, 2, 3, 4, 5]);
// Result: [3, 1, 5, 2, 4] (random order)
```

**`isFlattenable(value: unknown): boolean`** — Checks if a value can be flattened.

```javascript
isFlattenable([1, 2, 3]);
// Result: true
```

**`pushAll<T>(array: T[], values: readonly T[]): T[]`** — Appends all values into array in-place.

```javascript
const arr = [1, 2];
pushAll(arr, [3, 4, 5]);
// Result: arr is now [1, 2, 3, 4, 5]
```

### 📦 Object Utilities

**`pick<T, K>(obj: T, keys: K[]): Pick<T, K>`** — Picks specified properties from an object.

```javascript
pick({ name: "John", age: 30, city: "NYC" }, ["name", "age"]);
// Result: {name: 'John', age: 30}
```

**`omit<T, K>(obj: T, keys: K[]): Omit<T, K>`** — Omits specified properties from an object.

```javascript
omit({ name: "John", age: 30, city: "NYC" }, ["age"]);
// Result: {name: 'John', city: 'NYC'}
```

**`objectToString(obj: unknown): string`** — Converts an object to a clean string without JSON braces.

```javascript
objectToString({ name: "John", age: 30 });
// Result: "name=John_age=30"
```

**`cleanObject<T>(obj: T, removeEmptyString?: boolean): any`** — Deep-cleans an object by removing null/undefined-like values, with optional empty-string removal.

```javascript
// Default behaviour: keep empty strings
cleanObject({
  name: "John",
  age: null,
  city: undefined,
  note: "",
  data: { valid: true, invalid: null },
});
// Result: {name: 'John', note: '', data: {valid: true}}

// With removeEmptyString enabled
cleanObject(
  {
    name: "John",
    age: null,
    city: undefined,
    note: "",
    tags: ["", "ok"],
  },
  true,
);
// Result: {name: 'John', tags: ['ok']}
```

### 🔤 String Utilities

**`slugify(input: string): string`** — Converts a string to a URL-friendly slug.

```javascript
slugify("Olá Mundo! Como está?");
// Result: "ola-mundo-como-esta"
```

**`fill(template: string, values: Record<string, string|number>): string`** — Fills a template string with values.

```javascript
fill("Hello {name}, you are {age} years old!", { name: "John", age: 30 });
// Result: "Hello John, you are 30 years old!"
```

**`deburr(str: string): string`** — Removes diacritic marks from a string.

```javascript
deburr("café résumé naïve");
// Result: "cafe resume naive"
```

**`capitalizeFirst(input: string, options?: { lowerRest?: boolean; locale?: string | string[] }): string`** — Capitalizes only the first character; optionally lowercases the rest.

```javascript
capitalizeFirst("hELLO world");
// Result: "Hello world"
```

**`capitalizeWords(input: string, options?: { lowerRest?: boolean; locale?: string | string[]; treatHyphenAsSeparator?: boolean }): string`** — Capitalizes each word; can treat hyphen as separator.

```javascript
capitalizeWords("e-mail marketing");
// Result: "E-mail Marketing"

capitalizeWords("e-mail marketing", { treatHyphenAsSeparator: true });
// Result: "E-Mail Marketing"
```

**`sentenceCase(input: string, options?: { lowerRest?: boolean; locale?: string | string[] }): string`** — Capitalizes the start of each sentence (. ! ?); optionally lowercases the rest.

```javascript
sentenceCase("hello world. this is fine!");
// Result: "Hello world. This is fine!"
```

**`sanitize(input: unknown, maxLength?: number): string`** — Sanitizes input by removing dangerous content.

```javascript
sanitize("<script>alert('hack')</script>Hello World!", 20);
// Result: "Hello World!"
```

**`smsLength(text: string, singleOverrides?, multiOverrides?): SmsLengthResult`** — Calculates SMS encoding, length, and segmentation details (overrides are optional).

```javascript
const sms = smsLength("hello");
// Result: { encoding: "GSM_7BIT", length: 5, messages: 1, remaining: 155, ... }

const custom = smsLength("hello", { GSM_7BIT: 10 }, { GSM_7BIT: 5 });
// Result: characterPerMessage uses overrides
```

### 🔢 Number Utilities

**`clamp(n: number, min: number, max: number): number`** — Restricts a number to be within the min and max bounds.

```javascript
clamp(10, 0, 5); // 5
clamp(-5, 0, 10); // 0
```

**`round(n: number, decimals?: number): number`** — Rounds a number to a fixed number of decimals without floating point surprises.

```javascript
round(1.2345, 2); // 1.23
round(1.235, 2); // 1.24
```

**`safeAdd(a: number, b: number, decimals?: number): number`** — Adds two numbers with rounding and guards against invalid operands and precision errors.

```javascript
safeAdd(0.1, 0.2, 2); // 0.3
safeAdd(Number.NaN, 5); // 0 (invalid operand)
```

**`safeMultiply(a: number, b: number, decimals?: number): number`** — Multiplies two numbers safely with rounding and operand validation.

```javascript
safeMultiply(0.1, 0.2, 4); // 0.02
safeMultiply(Infinity, 2); // 0 (invalid operand)
```

**`safeSubtract(a: number, b: number, decimals?: number): number`** — Subtracts numbers safely, clamping decimal precision when needed.

```javascript
safeSubtract(10, 3.3333, 2); // 6.67
safeSubtract(5, Number.NaN); // 0 (invalid operand)
```

**`safeDivide(a: number, b: number, decimals?: number): number`** — Divides numbers with division-by-zero protection and precision normalization.

```javascript
safeDivide(1, 3, 3); // 0.333
safeDivide(10, 0); // 0 (division by zero)
```

**`numbersEqual(a: number, b: number, decimals?: number): boolean`** — Safely compares two numbers using fixed decimal precision and invalid operand guards.

```javascript
numbersEqual(0.1 + 0.2, 0.3); // true
numbersEqual(1.2345, 1.2344, 4); // false
numbersEqual(NaN, 1); // false
```

**`safeParseInt(value: unknown, defaultValue?: number): number`** — Safely converts a value to an integer with fallback.

```javascript
safeParseInt("42"); // 42
safeParseInt("abc", 10); // 10
safeParseInt(3.9); // 3
```

**`safeParseFloat(value: unknown, decimals?: number): number`** — Safely parses a value into a number with decimal precision, handling locale separators (commas, dots, spaces) and invalid inputs.

```javascript
safeParseFloat("123.45"); // 123.45
safeParseFloat("123,45"); // 123.45
safeParseFloat("1,234.56"); // 1234.56
safeParseFloat("1 234,56"); // 1234.56 (spaces as thousands)
safeParseFloat("1.234,56"); // 1234.56 (dot thousands, comma decimals)
safeParseFloat("abc"); // 0
safeParseFloat(NaN); // 0
```

**`randomDigits(length?: number, options?: { charset?: string; noLeadingZero?: boolean }): string`** — Generates a random string of digits with secure randomness when available.

```javascript
randomDigits(6);
// Result: "482751" (random)
```

**`randomDigits(length?: number, options?: { charset?: string; noLeadingZero?: boolean }): string`** — Generates a random string of digits with secure randomness when available.

```javascript
randomDigits(6); // "847293"
randomDigits(4, { noLeadingZero: true }); // "3847" (no leading zero)
randomDigits(6, { charset: "ABCDEF0123456789" }); // "3F2A9D" (hex)
```

**`formatDecimalNumber(value: number | string | null | undefined, decimals?: number): string`** — Formats a number with specified decimal places, intelligently handling European (`1.234,56`) and US (`1,234.56`) number formats.

**`formatDecimalNumber(value: number | string | null | undefined, decimals?: number): string`** — Formats a number with specified decimal places, intelligently handling European (`1.234,56`) and US (`1,234.56`) number formats.

```javascript
formatDecimalNumber(1234.5678); // "1234.57"
formatDecimalNumber("1.234,56", 2); // "1234.56" (European format)
formatDecimalNumber("1,234.56", 2); // "1234.56" (US format)
formatDecimalNumber("1234,56", 3); // "1234.560"
formatDecimalNumber(null, 2); // "0.00"
formatDecimalNumber("invalid", 2); // "0.00"
```

#### 🗑️ Deprecated (Number Utilities)

- **`toInteger`** → Use `safeParseInt` instead
- **`toNumber`** → Use `safeParseFloat` instead
- **`parseToNumber`** → Use `safeParseFloat` instead
- **`otp`** → Use `randomDigits` instead

### 🎲 Random Utilities

**`createToken(options?: { withUppercase?: boolean; withLowercase?: boolean; withNumbers?: boolean; withSymbols?: boolean; length?: number; alphabet?: string }): string`** — Generates a random token string using Math.random (non-crypto) and a configurable alphabet.

```javascript
createToken(); // 64-char token (letters + numbers)
createToken({ length: 16, withSymbols: true });
createToken({ alphabet: "ABCDEF0123456789", length: 24 }); // custom alphabet
```

**`random(): number`** — Returns a random float in the range [0, 1) using Math.random (non-crypto).

```javascript
random(); // 0.123456...
```

**`randFromArray<T>(array: T[]): T`** — Picks a random element from an array.

```javascript
randFromArray(["a", "b", "c"]); // random element
```

**`randIntFromInterval(min: number, max: number): number`** — Returns a random integer in [min, max).

```javascript
randIntFromInterval(10, 20); // 10..19
```

**`shuffleArray<T>(array: T[]): T[]`** — Returns a shuffled copy of the input array.

```javascript
shuffleArray([1, 2, 3]); // new shuffled array
```

**`shuffleArrayMutate<T>(array: T[]): T[]`** — Shuffles an array in place (mutates input).

```javascript
shuffleArrayMutate([1, 2, 3]); // same array instance, shuffled
```

**`shuffleString(str: string, delimiter?: string): string`** — Shuffles a string by splitting and rejoining.

```javascript
shuffleString("abc"); // "bca" (random order)
```

**`generateRandomId(): string`** — Generates a short id with prefix "id-" and a base36 segment.

```javascript
generateRandomId(); // "id-5gk9x1c2qz" (random)
```

### ✅ Boolean Utilities

**`toBool(value: unknown, def?: boolean): boolean`** — Converts a value to boolean, supporting common string/number representations.

```javascript
toBool("yes");
// Result: true

toBool("0");
// Result: false
```

### ⚡ Function Utilities

**`debounce<T>(fn: T, wait?: number): T`** — Returns a debounced version of a function.

```javascript
const debouncedFn = debounce(() => console.log("Called!"), 300);
debouncedFn(); // Will only execute after 300ms of no further calls
```

**`throttle<T>(fn: T, wait?: number): T`** — Returns a throttled version of a function.

```javascript
const throttledFn = throttle(() => console.log("Called!"), 1000);
throttledFn(); // Will execute at most once per 1000ms
```

**`delay(ms: number): Promise<void>`** — Creates a promise that resolves after specified milliseconds.

```javascript
await delay(1000); // Wait 1 second
await delay(500); // Wait 500ms
```

**`isNil(value: unknown): boolean`** — Checks if a value is null or undefined.

**`isNilTextOrEmpty(value: unknown): boolean`** — Strict check for `null`, `undefined`, empty string `""`, or textual values `"null"` / `"undefined"` (case-insensitive, trims spaces). Returns `true` in those cases, otherwise `false`.

```javascript
isNilTextOrEmpty(null); // true
isNilTextOrEmpty("undefined"); // true
isNilTextOrEmpty(" UNDEFINED "); // true
isNilTextOrEmpty("null"); // true
isNilTextOrEmpty(""); // true
isNilTextOrEmpty("abc"); // false
isNilTextOrEmpty(0); // false
```

> Deprecated: `isNullUndefinedOrEmptyEnforced` (use `isNilTextOrEmpty`).

```javascript
isNil(null);
// Result: true

isNil(undefined);
// Result: true

isNil(0);
// Result: false
```

**`isNilText(value: unknown): boolean`** — Checks if value is null/undefined or the text "null"/"undefined".

```javascript
isNilText("null");
// Result: true

isNilText("undefined");
// Result: true
```

**`isNilOrEmpty(value: unknown): boolean`** — Checks if value is null/undefined or an empty string (trimmed).

```javascript
isNilOrEmpty("");
// Result: true

isNilOrEmpty(" ");
// Result: true

isNilOrEmpty(null);
// Result: true

isNilOrEmpty(undefined);
// Result: true
```

**`isNilEmptyOrEmptyObject(value: unknown): boolean`** — Checks if value is nil, empty string, or an empty plain object (no own keys).

```javascript
isNilEmptyOrEmptyObject(null);
// Result: true

isNilEmptyOrEmptyObject("");
// Result: true

isNilEmptyOrEmptyObject({});
// Result: true

isNilEmptyOrEmptyObject({ a: 1 });
// Result: false
```

**`hasNilOrEmpty(array: unknown): boolean`** — Checks if any element in array is nil or empty.

```javascript
hasNilOrEmpty([1, "", 3]);
// Result: true

hasNilOrEmpty([1, 2, 3]);
// Result: false
```

**`isNilEmptyOrZeroLen(value: unknown): boolean`** — Checks if value is nil, empty string, or has zero length.

```javascript
isNilEmptyOrZeroLen([]);
// Result: true

isNilEmptyOrZeroLen("");
// Result: true
```

**`isNilEmptyOrZeroLength(value: unknown): boolean`**

```javascript
isNilEmptyOrZeroLength([]);
// Result: true

isNilEmptyOrZeroLength("");
// Result: true
```

**`isNilOrNaN(value: unknown): boolean`** — Checks if value is nil or NaN.

```javascript
isNilOrNaN(NaN);
// Result: true

isNilOrNaN("abc");
// Result: true (coerced to NaN)
```

**`formatBytes(bytes: number, si?: boolean, dp?: number, noSpace?: boolean): string`** — Formats bytes as human-readable text.

```javascript
formatBytes(999, true);
// Result: "999 Bytes"

formatBytes(1024);
// Result: "1.0 KiB"

formatBytes(1000, true, 1, true);
// Result: "1.0kB"
```

**`stringSimilarity(s1: string, s2: string): number`** — Returns the similarity between two strings (0..1).

```javascript
stringSimilarity("hello", "hallo");
// Result: 0.8
```

**`addThousandsSpace(value: number | string): string`** — Adds spaces between thousands in a number.

```javascript
addThousandsSpace(1234567);
// Result: "1 234 567"
```

**`safeJSONParse<T>(input: unknown, defaultValue: T): T`** — Safely parses a JSON string or returns the object if already parsed. Falls back to default value on failure.

```javascript
safeJSONParse('{"key": "value"}', {});
// Result: { key: "value" }

safeJSONParse({ already: "object" }, {});
// Result: { already: "object" }

safeJSONParse("{invalid}", { fallback: true });
// Result: { fallback: true }
```

**`formatCurrency(value: number | string | null | undefined, withoutCurrencySymbol?: boolean, currency?: string, locale?: string): string`** — Formats currency values with configurable currency and locale. Uses modern Intl.NumberFormat with automatic thousands separators, proper decimal handling, and graceful fallback for errors.

```javascript
// Default: EUR currency with Portuguese locale
formatCurrency(1234.56);
// Result: "1234,56 €"

formatCurrency(1000000.123);
// Result: "1 000 000,12 €"

formatCurrency(999.9, true);
// Result: "999,90" (without symbol)

// Different currencies
formatCurrency(1234.56, false, "USD", "en-US");
// Result: "$1,234.56"

formatCurrency(1234.56, false, "GBP", "en-GB");
// Result: "£1,234.56"

formatCurrency(1234.56, false, "USD", "pt-PT");
// Result: "1234,56 US$"

formatCurrency(null);
// Result: "0,00 €"
```

**`formatCurrencyPro(value: number | string | null | undefined, options?: { withoutCurrencySymbol?: boolean; currency?: string; locale?: string; redact?: boolean; redactChar?: string }): string`** — Same as `formatCurrency`, but uses a single options object and supports redaction.

```javascript
// Same defaults as formatCurrency
formatCurrencyPro(1234.56);
// Result: "1234,56 €"

// Options object
formatCurrencyPro(1234.56, { currency: "USD", locale: "en-US" });
// Result: "$1,234.56"

// Redacted output (mask digits)
formatCurrencyPro(1234.56, { redact: true });
// Result: "****,** €"

// Custom redaction character
formatCurrencyPro(1234.56, { redact: true, redactChar: "•" });
// Result: "••••,•• €"
```

**`parseName(name: string | null | undefined): {firstName: string, lastName: string}`** — Extracts first and last name from a full name string. Handles single names, empty inputs, and multi-word names intelligently.

```javascript
parseName("João Silva");
// Result: { firstName: "João", lastName: "Silva" }

parseName("Maria José Santos Costa");
// Result: { firstName: "Maria", lastName: "Costa" }

parseName("Ana");
// Result: { firstName: "Ana", lastName: "" }

parseName("  José   María   García  ");
// Result: { firstName: "José", lastName: "García" }

parseName(null);
// Result: { firstName: "", lastName: "" }
```

**`symbolToCurrency(symbol: string | null | undefined): string`** — Converts currency symbols to ISO 4217 currency codes. Supports 50+ currency symbols including €, £, $, ¥, ₹, ₽, ₩, ₪, and many others.

```javascript
symbolToCurrency("€");
// Result: "EUR"

symbolToCurrency("$");
// Result: "USD"

symbolToCurrency("₩");
// Result: "KRW"

symbolToCurrency("R$");
// Result: "BRL"

symbolToCurrency("unknown");
// Result: "EUR" (fallback)
```

**`currencyToSymbol(currency: string | null | undefined): string`** — Converts ISO 4217 currency codes to their corresponding symbols. Supports 50+ currencies with intelligent fallbacks.

```javascript
currencyToSymbol("EUR");
// Result: "€"

currencyToSymbol("USD");
// Result: "$"

currencyToSymbol("KRW");
// Result: "₩"

currencyToSymbol("BRL");
// Result: "R$"

currencyToSymbol("UNKNOWN");
// Result: "€" (fallback)
```

### 🕒 Defer Utilities

**`deferPostReturn(fn: () => void | Promise<void>): void`** — Runs a function right after the current call stack completes (microtask), without blocking the caller.

```javascript
const order = [];
order.push("a");
deferPostReturn(() => order.push("b"));
order.push("c");
// After the current stack finishes (microtask): order = ["a", "c", "b"]
```

**`deferNonCritical(fn: () => void | Promise<void>): void`** — Schedules a function as late as possible (low priority) for non-critical work.

```javascript
deferNonCritical(() => {
  // logs, metrics, cleanup — runs later without competing with main work
});
```

**`deferAfterResponse(res: { once: (event: "finish" | "close", listener: (...args: any[]) => void) => void; writableEnded?: boolean }, fn: () => void | Promise<void>): void`** — Runs a function after the HTTP response is finished (sent to the client), scheduled soon (microtask).

```javascript
// Example with a response-like object
deferAfterResponse(res, () => {
  // post-response tasks — lightweight, run shortly after sending
});
```

**`deferAfterResponseNonCritical(res: { once: (event: "finish" | "close", listener: (...args: any[]) => void) => void; writableEnded?: boolean }, fn: () => void | Promise<void>): void`** — Runs a function after the HTTP response is finished, scheduled as low priority (as late as possible).

```javascript
deferAfterResponseNonCritical(res, () => {
  // non-critical post-response work — scheduled with low priority
});
```

### 🔒 Security Utilities

**`checkMarkdownSecurity(text: string | null | undefined): SecurityCheckResult`** — Comprehensive markdown security validation with XSS protection, threat detection, and automatic sanitization.

```typescript
import { checkMarkdownSecurity } from "@salespark/toolkit";

// Safe content
checkMarkdownSecurity("# Hello World\n\nThis is **bold** text.");
// Result: { isValid: true, text: "...", risks: [], sanitized: false }

// Dangerous content with script
checkMarkdownSecurity('<script>alert("xss")</script>');
// Result: {
//   isValid: false,
//   text: "",
//   risks: [{ type: "scriptTags", severity: "critical", description: "..." }],
//   sanitized: true
// }

// Content with multiple threats
checkMarkdownSecurity(
  '<iframe src="evil.com"></iframe><div onclick="bad()">test</div>',
);
// Result: Multiple risks detected, sorted by severity
```

**`sanitizeMarkdown(text: string | null | undefined): string`** — Aggressive markdown sanitization removing all HTML tags, scripts, and suspicious content.

```typescript
import { sanitizeMarkdown } from "@salespark/toolkit";

sanitizeMarkdown("<p>Hello <strong>World</strong></p>");
// Result: "Hello World"

sanitizeMarkdown('javascript:alert("xss")');
// Result: "alert(\"xss\")"

sanitizeMarkdown("<script>alert(1)</script>Safe text");
// Result: "Safe text"
```

**`assessSecurityRisks(risks: SecurityRisk[]): SecurityAssessment`** — Risk assessment and scoring system with actionable recommendations.

```typescript
import { assessSecurityRisks } from "@salespark/toolkit";

const risks = [
  {
    type: "scriptTags",
    severity: "critical",
    description: "Script injection detected",
  },
];

assessSecurityRisks(risks);
// Result: {
//   score: 100,
//   level: "critical",
//   recommendations: [
//     "URGENT: Critical security risks detected - do not render this content",
//     "Always validate content from untrusted sources",
//     "Consider implementing Content Security Policy (CSP)"
//   ]
// }

// Safe content
assessSecurityRisks([]);
// Result: { score: 0, level: "safe", recommendations: ["Content appears safe to use"] }
```

**`generatePassword(...)`** — Password generator with sync defaults and async-only options (`words`, `entropy`).

```typescript
import { generatePassword } from "@salespark/toolkit";

// Sync usage (positional signature skips security recommendations)
const recoveryToken = generatePassword(96, false);

// Enforce security recommendations by using options
const strict = generatePassword({
  length: 12,
  memorable: true,
  ignoreSecurityRecommendations: false,
});

// Memorable password (override security recommendations if needed)
const memorable = generatePassword({
  length: 12,
  memorable: true,
  ignoreSecurityRecommendations: true,
});

// Async options (passphrase / deterministic entropy)
const passphrase = await generatePassword({
  words: 4,
  ignoreSecurityRecommendations: true,
});

const deterministic = await generatePassword({
  length: 24,
  entropy: "seed-123",
  ignoreSecurityRecommendations: true,
});
```

**`encodeString(input: string, secret: string): SalesParkContract<any>`** — Base64-encodes a string and scrambles it with the provided secret (obfuscation only).

```javascript
const encoded = encodeString("Hello", "secret");
// Result: { status: true, data: "..." }

const decoded = decodeString(encoded.data, "secret");
// Result: { status: true, data: "Hello" }
```

**`decodeString(encoded: string, secret: string): SalesParkContract<any>`** — Reverses `encodeString` using the same secret.

**`encodeObject(input: object, secret: string): SalesParkContract<object>`** — JSON-stringifies an object, Base64-encodes it, and scrambles the result (obfuscation only).

```javascript
const encoded = encodeObject({ id: 1, name: "Ana" }, "secret");
// Result: { status: true, data: "..." }

const decoded = decodeObject(encoded.data, "secret");
// Result: { status: true, data: { id: 1, name: "Ana" } }
```

**`decodeObject(encoded: string, secret: string): SalesParkContract<object>`** — Reverses `encodeObject` using the same secret.

**`encodeBase36Code(identifier: string, config: EncodeDecodeConfig): SalesParkContract<{ code: string }>`** — Encodes a base36 identifier into a reversible lower-case base36 code using secret-based XOR + rotation.

```typescript
import { encodeBase36Code, decodeBase36Code } from "@salespark/toolkit";

const config = {
  secret: "my-super-secret-key",
  bitSize: 80,
  rotateBits: 17,
  addConstant: "0x1fd0a5b7c3",
};

const encoded = encodeBase36Code("AB12CD34", config);
// Result: { status: true, data: { code: "..." } }

const decoded = decodeBase36Code(encoded.data.code, config);
// Result: { status: true, data: { identifier: "AB12CD34" } }
```

**`decodeBase36Code(code: string, config: EncodeDecodeConfig): SalesParkContract<{ identifier: string }>`** — Decodes a previously encoded base36 code back to the original identifier (upper-case).

```typescript
const bad = encodeBase36Code("AB-12", {
  secret: "my-super-secret-key",
});
// Result: { status: false, data: { message: "Identifier must be base36 (0-9, A-Z)" } }

const weakSecret = decodeBase36Code("abc123", {
  secret: "short",
});
// Result: { status: false, data: { message: "Missing or weak secret" } }
```

**`EncodeDecodeConfig`** — Configuration object used by `encodeBase36Code` and `decodeBase36Code`.

```typescript
type EncodeDecodeConfig = {
  secret: string; // required, minimum 12 chars
  bitSize?: number; // default: 80
  rotateBits?: number; // default: 17
  addConstant?: string; // default: "0x1fd0a5b7c3"
};
```

### ✅ Validation Utilities

**`isPTTaxId(value: string | number): boolean`** — Validates Portuguese Tax ID (NIF) with MOD-11 algorithm and format checking.

```typescript
import { isPTTaxId } from "@salespark/toolkit";

isPTTaxId("123456789"); // false (invalid check digit)
isPTTaxId("123 456 789"); // false (spaces stripped automatically)
isPTTaxId("513183504"); // true (valid NIF)
isPTTaxId("423456789"); // false (invalid prefix - 4 not allowed)

// Deprecated alias (use isPTTaxId instead)
// isValidPTTaxId("513183504");   // true
```

**`isValidIBAN(value: string): boolean`** — Validates International Bank Account Numbers (IBAN) according to ISO 13616 standard with country-specific rules.

```typescript
import { isValidIBAN } from "@salespark/toolkit";

isValidIBAN("NL91ABNA0417164300"); // true (valid Dutch IBAN)
isValidIBAN("NL91 ABNA 0417 1643 00"); // true (spaces stripped automatically)
isValidIBAN("GB29NWBK60161331926819"); // true (valid UK IBAN)
isValidIBAN("DE89370400440532013000"); // true (valid German IBAN)
isValidIBAN("NL91ABNA0417164301"); // false (invalid checksum)
isValidIBAN("XX1234567890"); // false (invalid country code)
```

### 🌐 Environment Detection

**`isBrowser: boolean`** — True if running in browser.

```javascript
if (isBrowser) {
  console.log("Running in browser");
}
```

**`isNode: boolean`** — True if running in Node.js.

```javascript
if (isNode) {
  console.log("Running in Node.js");
}
```

## ⚠️ Deprecated Functions

The following functions are deprecated but maintained for backward compatibility:

### 📋 Array Utilities (Deprecated)

- `areArraysDeepEqualUnordered` — Use `areArraysEqual` instead.

### ✅ Boolean Utilities (Deprecated)

- `parseToBool` — Use `toBool` instead.

### ⚡ Function Utilities (Deprecated)

- `isNullOrUndefined` — Use `isNil` instead.
- `isNullOrUndefinedTextInc` — Use `isNilText` instead.
- `isNullUndefinedOrEmpty` — Use `isNilOrEmpty` instead.
- `isNullOrUndefinedInArray` — Use `hasNilOrEmpty` instead.
- `isNullOrUndefinedEmptyOrZero` — Use `isNilEmptyOrZeroLength` instead.
- `isNilEmptyOrZeroLen` — Use `isNilEmptyOrZeroLength` instead.
- `isNullUndefinedOrZero` — Use `isNilEmptyOrZeroLength` instead.
- `isNilOrZeroLen` — Use `isNilEmptyOrZeroLength` instead.
- `isNullOrUndefinedOrNaN` — Use `isNilOrNaN` instead.
- `humanFileSize` — Use `formatBytes` instead.
- `getStringSimilarity` — Use `stringSimilarity` instead.
- `addSpaceBetweenNumbers` — Use `addThousandsSpace` instead.

### ✅ Validation Utilities (Deprecated)

> These functions are now in the main API but their legacy aliases are deprecated:

- `isValidPTTaxId` — Use `isPTTaxId` instead.

### 🔢 Number Utilities (Deprecated)

- `parseToNumber` — Use `toNumber` instead.
- `otp` — Use `randomDigits` instead.

### 🔤 String Utilities (Deprecated)

- `removeDiacritics` — Use `deburr` instead.
- `basicSanitize` — Use `sanitize` instead.

## 🏷️ TypeScript

All functions are fully typed for best developer experience.

---

## 🛠️ Support

Got stuck? Don’t panic — we’ve got you covered.

### 🤖 AI Assistant

We built a custom **AI Assistant** trained _only_ on `@salespark/toolkit`.  
It answers implementation and troubleshooting questions in real time:

👉 Ask the Toolkit GPT:  
https://chatgpt.com/g/g-68a9bf25537081918c3b76ae8f353e70-salespark-toolkit-v2

_(Free to use with a ChatGPT account)_

---

### 🔒 Internal Usage Notice

This package is primarily designed and maintained for internal use within the SalesPark ecosystem.
While it can technically be used in other Node.js/Mongoose projects, no official support or guarantees are provided outside of SalesPark-managed projects.

All code follows the same engineering standards applied across the SalesPark platform, ensuring consistency, reliability, and long-term maintainability of our internal systems.

⚡ Note: This package is most efficient and works best when used together with other official SalesPark packages, where interoperability and optimizations are fully leveraged.

Disclaimer: This software is provided "as is", without warranties of any kind, express or implied. SalesPark shall not be held liable for any issues, damages, or losses arising from its use outside the intended SalesPark environment.

Organization packages: https://www.npmjs.com/org/salespark

---

## 📄 License

MIT © [SalesPark](https://salespark.io)

---

_Document version: 18_  
_Last update: 14-03-2026_
