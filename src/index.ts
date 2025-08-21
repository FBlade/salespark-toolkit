export * from "./utils/array";
export * from "./utils/object";
export * from "./utils/string";
export * from "./utils/number";
export * from "./utils/func";

/** Environment helpers (runtime-agnostic checks) */
export const isBrowser = typeof globalThis !== "undefined" && typeof (globalThis as any).document !== "undefined";
export const isNode = typeof process !== "undefined" && !!(process.versions?.node);
