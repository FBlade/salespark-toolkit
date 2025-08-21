import { describe, it, expect } from "vitest";
import { clamp, round, toInteger, toNumber } from "../src/utils/number";

describe("number utils", () => {
  describe("clamp", () => {
    it("should clamp number within range", () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(20, 0, 10)).toBe(10);
    });
  });

  describe("round", () => {
    it("should round number to decimals", () => {
      expect(round(1.2345, 2)).toBe(1.23);
      expect(round(1.2355, 2)).toBe(1.24);
    });
  });

  describe("toInteger", () => {
    it("should convert string to integer", () => {
      expect(toInteger("42")).toBe(42);
      expect(toInteger("3.9")).toBe(3);
    });
    it("should return default value for invalid input", () => {
      expect(toInteger("abc", 10)).toBe(10);
      expect(toInteger(undefined)).toBe(0);
      expect(toInteger(null, 5)).toBe(5);
    });
    it("should handle numbers directly", () => {
      expect(toInteger(7.8)).toBe(7);
      expect(toInteger(0)).toBe(0);
    });
  });

  describe("toNumber", () => {
    it("should parse numbers from strings with dot or comma", () => {
      expect(toNumber("123.45")).toBe(123.45);
      expect(toNumber("123,45")).toBe(123.45);
      expect(toNumber("1,234.56")).toBe(1234.56);
    });
    it("should return 0 for invalid input", () => {
      expect(toNumber("abc")).toBe(0);
      expect(toNumber(undefined)).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber("")).toBe(0);
    });
    it("should handle numbers directly", () => {
      expect(toNumber(42)).toBe(42);
      expect(toNumber(3.14159, 2)).toBe(3.14);
    });
    it("should apply decimal precision", () => {
      expect(toNumber("1.23456789", 4)).toBe(1.2346);
      expect(toNumber("1.23456789", 2)).toBe(1.23);
    });
  });
});
