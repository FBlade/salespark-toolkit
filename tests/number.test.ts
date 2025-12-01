import { describe, it, expect } from "vitest";
import {
  clamp,
  round,
  toInteger,
  toNumber,
  safeParseInt,
  parseToNumber,
  safeParseFloat,
  randomDigits,
  otp,
  formatDecimalNumber,
} from "../src/utils/number";

describe("number utils", () => {
  describe("toInteger edge cases", () => {
    it("should return defaultValue if toString throws", () => {
      const badObj = {
        toString() {
          throw new Error("fail");
        },
      };
      expect(toInteger(badObj, 99)).toBe(99);
    });
  });

  describe("safeParseFloat edge cases", () => {
    it("should return 0 if toString throws", () => {
      const badObj = {
        toString() {
          throw new Error("fail");
        },
      };
      expect(safeParseFloat(badObj)).toBe(0);
    });
  });

  describe("randomDigits edge cases", () => {
    it("should return empty string if length <= 0", () => {
      expect(randomDigits(0)).toBe("");
    });
    it("should return empty string if charset is empty", () => {
      expect(randomDigits(5, { charset: "" })).toBe("");
    });
    it("should return empty string if noLeadingZero and charset only has zero", () => {
      expect(randomDigits(1, { charset: "0", noLeadingZero: true })).toBe("");
    });
  });
  describe("safeParseInt (alias)", () => {
    it("should behave like toInteger", () => {
      expect(safeParseInt("42")).toBe(42);
      expect(safeParseInt("not a number", 7)).toBe(7);
      expect(safeParseInt(123)).toBe(123);
    });
  });

  describe("parseToNumber (alias)", () => {
    it("should behave like safeParseFloat", () => {
      expect(parseToNumber("3.14")).toBeCloseTo(3.14);
      expect(parseToNumber("not a number")).toBe(0);
      expect(parseToNumber(2.718, 2)).toBeCloseTo(2.72);
      expect(parseToNumber("1 234,56")).toBe(1234.56);
    });
  });

  describe("randomDigits", () => {
    it("should generate a string of digits of given length", () => {
      const result = randomDigits(6);
      expect(result).toMatch(/^\d{6}$/);
      expect(typeof result).toBe("string");
    });
    it("should generate different values on each call", () => {
      const a = randomDigits(6);
      const b = randomDigits(6);
      expect(a).not.toBe(b);
    });
    it("should default to 6 digits if no argument", () => {
      expect(randomDigits()).toMatch(/^\d{6}$/);
    });
  });

  describe("otp (alias)", () => {
    it("should behave like randomDigits", () => {
      expect(otp(4)).toMatch(/^\d{4}$/);
      expect(typeof otp(4)).toBe("string");
    });
  });
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

  describe("safeParseFloat", () => {
    it("should parse numbers from strings with dot or comma", () => {
      expect(safeParseFloat("123.45")).toBe(123.45);
      expect(safeParseFloat("123,45")).toBe(123.45);
      expect(safeParseFloat("1,234.56")).toBe(1234.56);
      expect(safeParseFloat("1.234,56")).toBe(1234.56);
    });
    it("should return 0 for invalid input", () => {
      expect(safeParseFloat("abc")).toBe(0);
      expect(safeParseFloat(undefined)).toBe(0);
      expect(safeParseFloat(null)).toBe(0);
      expect(safeParseFloat("")).toBe(0);
      expect(safeParseFloat(NaN)).toBe(0);
    });
    it("should handle numbers directly", () => {
      expect(safeParseFloat(42)).toBe(42);
      expect(safeParseFloat(3.14159, 2)).toBe(3.14);
    });
    it("should apply decimal precision", () => {
      expect(safeParseFloat("1.23456789", 4)).toBe(1.2346);
      expect(safeParseFloat("1.23456789", 2)).toBe(1.23);
    });
    it("should handle spaces used as thousands separators", () => {
      expect(safeParseFloat("1 234,56")).toBe(1234.56);
      expect(safeParseFloat("1 234 567.89")).toBe(1234567.89);
      expect(safeParseFloat("   9 876.543210   ", 3)).toBe(9876.543);
    });
  });

  describe("toNumber (alias)", () => {
    it("should forward to safeParseFloat", () => {
      const inputs = [
        "123.45",
        "1.234,56",
        "1 234 567.89",
        undefined,
        null,
        "",
      ];

      for (const value of inputs) {
        expect(toNumber(value as any)).toBe(safeParseFloat(value as any));
      }
    });
  });

  describe("formatDecimalNumber", () => {
    it("formats numbers with default 2 decimals", () => {
      expect(formatDecimalNumber(1234.5678)).toBe("1234.57");
      expect(formatDecimalNumber(1234)).toBe("1234.00");
      expect(formatDecimalNumber(0)).toBe("0.00");
    });

    it("formats numbers with custom decimal places", () => {
      expect(formatDecimalNumber(1234.5678, 0)).toBe("1235");
      expect(formatDecimalNumber(1234.5678, 1)).toBe("1234.6");
      expect(formatDecimalNumber(1234.5678, 3)).toBe("1234.568");
      expect(formatDecimalNumber(1234.5678, 4)).toBe("1234.5678");
    });

    it("handles European number format (1.234,56)", () => {
      expect(formatDecimalNumber("1.234,56", 2)).toBe("1234.56");
      expect(formatDecimalNumber("12.345,78", 2)).toBe("12345.78");
      expect(formatDecimalNumber("1.000.000,99", 2)).toBe("1000000.99");
    });

    it("handles US number format (1,234.56)", () => {
      expect(formatDecimalNumber("1,234.56", 2)).toBe("1234.56");
      expect(formatDecimalNumber("12,345.78", 2)).toBe("12345.78");
      expect(formatDecimalNumber("1,000,000.99", 2)).toBe("1000000.99");
    });

    it("handles comma as decimal separator", () => {
      expect(formatDecimalNumber("1234,56", 2)).toBe("1234.56");
      expect(formatDecimalNumber("123,45", 2)).toBe("123.45");
      expect(formatDecimalNumber("0,99", 2)).toBe("0.99");
    });

    it("handles string numbers without separators", () => {
      expect(formatDecimalNumber("1234.56", 2)).toBe("1234.56");
      expect(formatDecimalNumber("1234", 2)).toBe("1234.00");
      expect(formatDecimalNumber("0.99", 2)).toBe("0.99");
    });

    it("handles null, undefined, and empty values", () => {
      expect(formatDecimalNumber(null, 2)).toBe("0.00");
      expect(formatDecimalNumber(undefined, 2)).toBe("0.00");
      expect(formatDecimalNumber("", 2)).toBe("0.00");
    });

    it("handles invalid inputs", () => {
      expect(formatDecimalNumber("abc", 2)).toBe("0.00");
      expect(formatDecimalNumber("invalid", 2)).toBe("0.00");
      expect(formatDecimalNumber("123abc", 2)).toBe("123.00"); // parseFloat stops at first non-numeric
    });

    it("handles negative numbers", () => {
      expect(formatDecimalNumber(-1234.56, 2)).toBe("-1234.56");
      expect(formatDecimalNumber("-1234,56", 2)).toBe("-1234.56");
      expect(formatDecimalNumber("-1.234,56", 2)).toBe("-1234.56");
    });

    it("handles negative decimal values", () => {
      expect(formatDecimalNumber(1234.5678, -1)).toBe("1235");
      expect(formatDecimalNumber(1234.5678, -0.5)).toBe("1235");
    });

    it("handles large numbers", () => {
      expect(formatDecimalNumber(999999999.99, 2)).toBe("999999999.99");
      expect(formatDecimalNumber("999.999.999,99", 2)).toBe("999999999.99");
    });
  });
});
