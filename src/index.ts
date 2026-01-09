export * from "./utils/array";
export * from "./utils/bool";
export * from "./utils/object";
export * from "./utils/string";
export * from "./utils/number";
export * from "./utils/func";
export * from "./utils/validations";
export * from "./utils/iban";
export * from "./utils/security";
export * from "./utils/defer";

/** Environment helpers (runtime-agnostic checks) */
export const isBrowser =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as any).document !== "undefined";
export const isNode =
  typeof process !== "undefined" && !!process.versions?.node;
