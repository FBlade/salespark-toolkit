import { describe, it, expect } from "vitest";
import { toBool } from "../src/utils/bool";

describe("toBool", () => {
  it("should parse true values", () => {
    expect(toBool(true)).toBe(true);
    expect(toBool("true")).toBe(true);
    expect(toBool("yes")).toBe(true);
    expect(toBool("1")).toBe(true);
    expect(toBool(1)).toBe(true);
  });
  it("should parse false values", () => {
    expect(toBool(false)).toBe(false);
    expect(toBool("false")).toBe(false);
    expect(toBool("no")).toBe(false);
    expect(toBool("0")).toBe(false);
    expect(toBool(0)).toBe(false);
  });
  it("should handle null, undefined, and unknown strings", () => {
    expect(toBool(null)).toBe(false);
    expect(toBool(undefined)).toBe(false);
    expect(toBool("unknown")).toBe(false);
    expect(toBool("maybe", true)).toBe(true);
    expect(toBool("maybe")).toBe(false);
  });
  it("should trim and ignore case", () => {
    expect(toBool(" YES ")).toBe(true);
    expect(toBool(" No ")).toBe(false);
    expect(toBool("TrUe")).toBe(true);
    expect(toBool("FaLsE")).toBe(false);
  });
});
