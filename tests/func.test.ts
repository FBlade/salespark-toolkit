import { describe, it, expect, vi } from "vitest";
import {
  debounce,
  throttle,
  isNil,
  isNilText,
  isNilOrEmpty,
  hasNilOrEmpty,
  isNilEmptyOrZeroLen,
  isNilOrZeroLen,
  isNilOrNaN,
  formatBytes,
  addThousandsSpace,
  stringSimilarity,
} from "../src/utils/func";

describe("debounce", () => {
  it("should debounce function calls", async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    debounced();
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  it("should throttle function calls", async () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 50);
    throttled();
    throttled();
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("isNil", () => {
  it("should detect null and undefined", () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil("")).toBe(false);
    expect(isNil(0)).toBe(false);
  });
});

describe("isNilText", () => {
  it('should detect null, undefined, "null", "undefined"', () => {
    expect(isNilText(null)).toBe(true);
    expect(isNilText(undefined)).toBe(true);
    expect(isNilText("null")).toBe(true);
    expect(isNilText("undefined")).toBe(true);
    expect(isNilText("NULL")).toBe(true);
    expect(isNilText("UNDEFINED")).toBe(true);
    expect(isNilText("")).toBe(false);
    expect(isNilText(0)).toBe(false);
  });
});

describe("isNilOrEmpty", () => {
  it("should detect null, undefined, empty string", () => {
    expect(isNilOrEmpty(null)).toBe(true);
    expect(isNilOrEmpty(undefined)).toBe(true);
    expect(isNilOrEmpty("")).toBe(true);
    expect(isNilOrEmpty("abc")).toBe(false);
    expect(isNilOrEmpty(0)).toBe(false);
  });
});

describe("hasNilOrEmpty", () => {
  it("should detect nil or empty in array", () => {
    expect(hasNilOrEmpty([1, null, 2])).toBe(true);
    expect(hasNilOrEmpty(["", "abc"])).toBe(true);
    expect(hasNilOrEmpty([1, 2, 3])).toBe(false);
    expect(hasNilOrEmpty("not-an-array")).toBe(true);
  });
});

describe("isNilEmptyOrZeroLen", () => {
  it("should detect nil, empty string, or zero length", () => {
    expect(isNilEmptyOrZeroLen(null)).toBe(true);
    expect(isNilEmptyOrZeroLen(undefined)).toBe(true);
    expect(isNilEmptyOrZeroLen("")).toBe(true);
    expect(isNilEmptyOrZeroLen([])).toBe(true);
    expect(isNilEmptyOrZeroLen([1])).toBe(false);
    expect(isNilEmptyOrZeroLen("abc")).toBe(false);
  });
});

describe("isNilOrZeroLen", () => {
  it("should detect nil or zero length", () => {
    expect(isNilOrZeroLen(null)).toBe(true);
    expect(isNilOrZeroLen(undefined)).toBe(true);
    expect(isNilOrZeroLen([])).toBe(true);
    expect(isNilOrZeroLen([1])).toBe(false);
    expect(isNilOrZeroLen("")).toBe(true);
    expect(isNilOrZeroLen("abc")).toBe(false);
  });
});

describe("isNilOrNaN", () => {
  it("should detect nil or NaN", () => {
    expect(isNilOrNaN(null)).toBe(true);
    expect(isNilOrNaN(undefined)).toBe(true);
    expect(isNilOrNaN(NaN)).toBe(true);
    expect(isNilOrNaN("abc")).toBe(true);
    expect(isNilOrNaN(123)).toBe(false);
  });
});

describe("formatBytes", () => {
  it("should format bytes in SI units", () => {
    expect(formatBytes(999, true)).toBe("999 B");
    expect(formatBytes(1000, true)).toBe("1.0 kB");
    expect(formatBytes(1500, true)).toBe("1.5 kB");
    expect(formatBytes(1000000, true)).toBe("1.0 MB");
  });
  it("should format bytes in IEC units", () => {
    expect(formatBytes(1023)).toBe("1023 B");
    expect(formatBytes(1024)).toBe("1.0 KiB");
    expect(formatBytes(1048576)).toBe("1.0 MiB");
  });
  it("should handle negative values", () => {
    expect(formatBytes(-1024)).toBe("-1.0 KiB");
    expect(formatBytes(-1000, true)).toBe("-1.0 kB");
  });
  it("should handle decimal places", () => {
    expect(formatBytes(1536, false, 2)).toBe("1.50 KiB");
    expect(formatBytes(1536, true, 3)).toBe("1.536 kB");
  });
  it("should return NaN for invalid input", () => {
    expect(formatBytes(NaN)).toBe("NaN");
    expect(formatBytes(Infinity)).toBe("NaN");
  });
});

describe("stringSimilarity", () => {
  it("should return 1 for identical strings", () => {
    expect(stringSimilarity("abc", "abc")).toBe(1);
    expect(stringSimilarity("", "")).toBe(1);
  });
  it("should return 0 for completely different strings", () => {
    expect(stringSimilarity("abc", "xyz")).toBe(0);
  });
  it("should handle empty strings", () => {
    expect(stringSimilarity("", "abc")).toBe(0);
    expect(stringSimilarity("abc", "")).toBe(0);
  });
  it("should return similarity between 0 and 1 for partial matches", () => {
    expect(stringSimilarity("kitten", "sitting")).toBeGreaterThan(0);
    expect(stringSimilarity("flaw", "lawn")).toBeGreaterThan(0);
  });
  it("should be symmetric", () => {
    expect(stringSimilarity("abc", "abcd")).toBeCloseTo(
      stringSimilarity("abcd", "abc")
    );
  });
});

describe("addThousandsSpace", () => {
  it("should format integer numbers with spaces", () => {
    expect(addThousandsSpace(1234567)).toBe("1 234 567");
    expect(addThousandsSpace("1234567")).toBe("1 234 567");
    expect(addThousandsSpace(1000)).toBe("1 000");
    expect(addThousandsSpace(999)).toBe("999");
  });
  it("should format decimal numbers with spaces", () => {
    expect(addThousandsSpace(1234567.89)).toBe("1 234 567.89");
    expect(addThousandsSpace("1234567.89")).toBe("1 234 567.89");
    expect(addThousandsSpace(1000.5)).toBe("1 000.5");
  });
  it("should handle small numbers and strings", () => {
    expect(addThousandsSpace(12)).toBe("12");
    expect(addThousandsSpace("12")).toBe("12");
  });
  it("should handle invalid input gracefully", () => {
    expect(addThousandsSpace("not-a-number")).toBe("not-a-number");
  });
});
