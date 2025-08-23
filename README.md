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

- **Array utilities**: chunk, uniqBy, deep equality, flatten, etc.
- **Object utilities**: pick, omit, clean objects, etc.
- **String utilities**: slugify, template fill, deburr, sanitize, etc.
- **Number utilities**: clamp, round, safe parse, random digits, etc.
- **Boolean utilities**: safe boolean conversion with common representations.
- **Function utilities**: debounce, throttle, nil/empty checks, formatBytes, string similarity, etc.
- **Environment detection**: `isBrowser`, `isNode`.

---

## 🚀 Usage

Get started in seconds with a few common utilities:

### Named Imports (Tree-shakeable)

```typescript
import {
  debounce,
  chunk,
  slugify,
  clamp,
  isBrowser,
  toBool,
} from "@salespark/toolkit";

// Debounce a function
const debouncedFn = debounce(() => {
  /* ... */
}, 200);

// Chunk an array
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1,2],[3,4],[5]]

// Slugify a string
const slug = slugify("Olá mundo!"); // "ola-mundo"

// Clamp a number
const safe = clamp(15, 0, 10); // 10

// Convert to boolean
const bool = toBool("yes"); // true

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
  (x) => x.id
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
  "type"
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
  "name"
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

**`cleanObject<T>(obj: T): any`** — Deep-cleans an object by removing null/undefined values.

```javascript
cleanObject({
  name: "John",
  age: null,
  city: undefined,
  data: { valid: true, invalid: null },
});
// Result: {name: 'John', data: {valid: true}}
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

**`sanitize(input: unknown, maxLength?: number): string`** — Sanitizes input by removing dangerous content.

```javascript
sanitize("<script>alert('hack')</script>Hello World!", 20);
// Result: "Hello World!"
```

### 🔢 Number Utilities

**`clamp(n: number, min: number, max: number): number`** — Restricts a number within min and max bounds.

```javascript
clamp(15, 0, 10);
// Result: 10
```

**`round(n: number, decimals?: number): number`** — Rounds a number to fixed decimal places.

```javascript
round(3.14159, 2);
// Result: 3.14
```

**`toInteger(value: unknown, defaultValue?: number): number`** — Safely converts a value to an integer.

```javascript
toInteger("42.7");
// Result: 42
```

**`safeParseInt(value: unknown, defaultValue?: number): number`** — Alias for safe integer conversion.

```javascript
safeParseInt("abc", 0);
// Result: 0
```

**`toNumber(value: unknown, decimals?: number): number`** — Safely parses a value into a number with optional decimal precision.

```javascript
toNumber("123,45", 2);
// Result: 123.45
```

**`randomDigits(length?: number, options?: { charset?: string; noLeadingZero?: boolean }): string`** — Generates a random string of digits with secure randomness when available.

```javascript
randomDigits(6);
// Result: "482751" (random)
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

**`isNil(value: unknown): boolean`** — Checks if a value is null or undefined.

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

**`isNilOrEmpty(value: unknown): boolean`** — Checks if value is null/undefined or an empty string.

```javascript
isNilOrEmpty("");
// Result: true

isNilOrEmpty(null);
// Result: true
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

**`isNilOrZeroLen(value: unknown): boolean`** — Checks if value is nil or has zero length.

```javascript
isNilOrZeroLen([]);
// Result: true

isNilOrZeroLen(null);
// Result: true
```

**`isNilOrNaN(value: unknown): boolean`** — Checks if value is nil or NaN.

```javascript
isNilOrNaN(NaN);
// Result: true

isNilOrNaN("abc");
// Result: true (coerced to NaN)
```

**`formatBytes(bytes: number, si?: boolean, dp?: number): string`** — Formats bytes as human-readable text.

```javascript
formatBytes(1024);
// Result: "1.0 KiB"

formatBytes(1000, true);
// Result: "1.0 kB"
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
- `isNullOrUndefinedEmptyOrZero` — Use `isNilEmptyOrZeroLen` instead.
- `isNullUndefinedOrZero` — Use `isNilOrZeroLen` instead.
- `isNullOrUndefinedOrNaN` — Use `isNilOrNaN` instead.
- `humanFileSize` — Use `formatBytes` instead.
- `getStringSimilarity` — Use `stringSimilarity` instead.
- `addSpaceBetweenNumbers` — Use `addThousandsSpace` instead.

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

_Document version: 3_  
_Last update: 23-08-2025_
