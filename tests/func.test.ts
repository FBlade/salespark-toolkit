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
  isNilEmptyOrZeroLength,
  isNilOrZeroLength,
  isNilOrNaN,
  formatBytes,
  formatCurrency,
  addThousandsSpace,
  stringSimilarity,
  delay,
  isNilTextOrEmpty,
  parseName,
  symbolToCurrency,
  currencyToSymbol,
  // deprecated alias
  isNullUndefinedOrEmptyEnforced,
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

describe("isNilEmptyOrZeroLength", () => {
  it("should be the same as isNilEmptyOrZeroLen", () => {
    expect(isNilEmptyOrZeroLength(null)).toBe(true);
    expect(isNilEmptyOrZeroLength(undefined)).toBe(true);
    expect(isNilEmptyOrZeroLength("")).toBe(true);
    expect(isNilEmptyOrZeroLength([])).toBe(true);
    expect(isNilEmptyOrZeroLength([1])).toBe(false);
    expect(isNilEmptyOrZeroLength("abc")).toBe(false);
    expect(isNilEmptyOrZeroLength({ length: 0 })).toBe(true);
    expect(isNilEmptyOrZeroLength({ length: 5 })).toBe(true);
  });
});

describe("isNilOrZeroLength", () => {
  it("should be the same as isNilOrZeroLen", () => {
    expect(isNilOrZeroLength(null)).toBe(true);
    expect(isNilOrZeroLength(undefined)).toBe(true);
    expect(isNilOrZeroLength([])).toBe(true);
    expect(isNilOrZeroLength([1])).toBe(false);
    expect(isNilOrZeroLength("")).toBe(true);
    expect(isNilOrZeroLength("abc")).toBe(true);
    expect(isNilOrZeroLength({ length: 0 })).toBe(true);
    expect(isNilOrZeroLength({ length: 5 })).toBe(true);
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

describe("formatCurrency", () => {
  it("should format currency values with EUR symbol", () => {
    const result1 = formatCurrency(1234.56);
    expect(result1).toContain("1234,56");
    expect(result1).toContain("€");

    const result0 = formatCurrency(0);
    expect(result0).toContain("0,00");
    expect(result0).toContain("€");

    const result999 = formatCurrency(999.9);
    expect(result999).toContain("999,90");
    expect(result999).toContain("€");

    const resultBig = formatCurrency(1000000.123);
    expect(resultBig).toContain("000,12");
    expect(resultBig).toContain("€");
  });

  it("should format currency values without symbol", () => {
    expect(formatCurrency(1234.56, true)).toBe("1234,56");
    expect(formatCurrency(0, true)).toBe("0,00");
    expect(formatCurrency(999.9, true)).toBe("999,90");
  });

  it("should handle string inputs", () => {
    const result = formatCurrency("1234.56");
    expect(result).toContain("1234,56");
    expect(result).toContain("€");

    expect(formatCurrency("1000", true)).toBe("1000,00");

    const result999 = formatCurrency("999.123");
    expect(result999).toContain("999,12");
    expect(result999).toContain("€");
  });

  it("should handle null/undefined/empty inputs", () => {
    const resultNull = formatCurrency(null);
    expect(resultNull).toContain("0,00");
    expect(resultNull).toContain("€");

    const resultUnd = formatCurrency(undefined);
    expect(resultUnd).toContain("0,00");
    expect(resultUnd).toContain("€");

    const resultEmpty = formatCurrency("");
    expect(resultEmpty).toContain("0,00");
    expect(resultEmpty).toContain("€");

    expect(formatCurrency(null, true)).toBe("0,00");
    expect(formatCurrency(undefined, true)).toBe("0,00");
  });

  it("should handle invalid inputs gracefully", () => {
    const resultInvalid = formatCurrency("not-a-number");
    expect(resultInvalid).toContain("0,00");
    expect(resultInvalid).toContain("€");

    expect(formatCurrency("abc", true)).toBe("0,00");

    const resultNaN = formatCurrency(NaN);
    expect(resultNaN).toContain("0,00");
    expect(resultNaN).toContain("€");

    const resultInf = formatCurrency(Infinity);
    expect(resultInf).toContain("0,00");
    expect(resultInf).toContain("€");
  });

  it("should handle negative values", () => {
    const result = formatCurrency(-1234.56);
    expect(result).toContain("-1234,56");
    expect(result).toContain("€");
    expect(formatCurrency(-999.9, true)).toBe("-999,90");
  });

  it("should format large numbers with thousands separator", () => {
    const result1 = formatCurrency(1000000);
    expect(result1).toMatch(/1.000.000,00\s*€/);

    const result2 = formatCurrency(12345.67, true);
    expect(result2).toMatch(/12.345,67/);
  });

  it("should support different currencies", () => {
    const usd = formatCurrency(1234.56, false, "USD");
    expect(usd).toContain("1234,56");
    expect(usd).toContain("US$");

    const gbp = formatCurrency(999.99, false, "GBP");
    expect(gbp).toContain("999,99");
    expect(gbp).toContain("£");

    const jpy = formatCurrency(1000, false, "JPY");
    expect(jpy).toContain("1000");
    expect(jpy).toContain("JP¥");
  });

  it("should support different locales", () => {
    const enUS = formatCurrency(1234.56, false, "USD", "en-US");
    expect(enUS).toContain("$1,234.56");

    const enGB = formatCurrency(1234.56, false, "GBP", "en-GB");
    expect(enGB).toContain("£1,234.56");

    const deDE = formatCurrency(1234.56, false, "EUR", "de-DE");
    expect(deDE).toContain("1.234,56");
    expect(deDE).toContain("€");
  });

  it("should combine different currencies and locales", () => {
    const frFR_USD = formatCurrency(1234.56, false, "USD", "fr-FR");
    expect(frFR_USD).toMatch(/1[\s\u202f]234,56/); // Allow both regular space and narrow no-break space
    expect(frFR_USD).toContain("$US");

    const ptPT_USD = formatCurrency(1234.56, false, "USD", "pt-PT");
    expect(ptPT_USD).toContain("1234,56");
    expect(ptPT_USD).toContain("US$");
  });

  it("should maintain backward compatibility with default parameters", () => {
    // These should behave exactly like before
    const default1 = formatCurrency(1234.56);
    const explicit1 = formatCurrency(1234.56, false, "EUR", "pt-PT");
    expect(default1).toBe(explicit1);

    const default2 = formatCurrency(999.9, true);
    const explicit2 = formatCurrency(999.9, true, "EUR", "pt-PT");
    expect(default2).toBe(explicit2);
  });
});

describe("parseName", () => {
  it("should handle null/undefined/empty inputs", () => {
    expect(parseName(null)).toEqual({ firstName: "", lastName: "" });
    expect(parseName(undefined)).toEqual({ firstName: "", lastName: "" });
    expect(parseName("")).toEqual({ firstName: "", lastName: "" });
    expect(parseName("   ")).toEqual({ firstName: "", lastName: "" });
  });

  it("should handle single name", () => {
    expect(parseName("João")).toEqual({ firstName: "João", lastName: "" });
    expect(parseName("Maria")).toEqual({ firstName: "Maria", lastName: "" });
    expect(parseName("Ana")).toEqual({ firstName: "Ana", lastName: "" });
  });

  it("should handle two names", () => {
    expect(parseName("João Silva")).toEqual({
      firstName: "João",
      lastName: "Silva",
    });
    expect(parseName("Maria Santos")).toEqual({
      firstName: "Maria",
      lastName: "Santos",
    });
    expect(parseName("Ana Costa")).toEqual({
      firstName: "Ana",
      lastName: "Costa",
    });
  });

  it("should handle multiple names (first and last)", () => {
    expect(parseName("João Pedro Silva")).toEqual({
      firstName: "João",
      lastName: "Silva",
    });
    expect(parseName("Maria José Santos Costa")).toEqual({
      firstName: "Maria",
      lastName: "Costa",
    });
    expect(parseName("Ana Rita Ferreira Oliveira")).toEqual({
      firstName: "Ana",
      lastName: "Oliveira",
    });
  });

  it("should handle names with extra whitespace", () => {
    expect(parseName("  João   Silva  ")).toEqual({
      firstName: "João",
      lastName: "Silva",
    });
    expect(parseName("Maria    Santos")).toEqual({
      firstName: "Maria",
      lastName: "Santos",
    });
    expect(parseName("   Ana   Rita   Costa   ")).toEqual({
      firstName: "Ana",
      lastName: "Costa",
    });
  });

  it("should handle names with special characters", () => {
    expect(parseName("José-Maria Silva")).toEqual({
      firstName: "José-Maria",
      lastName: "Silva",
    });
    expect(parseName("Anne-Marie Dubois")).toEqual({
      firstName: "Anne-Marie",
      lastName: "Dubois",
    });
    expect(parseName("O'Connor")).toEqual({
      firstName: "O'Connor",
      lastName: "",
    });
  });

  it("should handle international names", () => {
    expect(parseName("李 小明")).toEqual({ firstName: "李", lastName: "小明" });
    expect(parseName("José María García")).toEqual({
      firstName: "José",
      lastName: "García",
    });
    expect(parseName("François-Xavier de La Tour")).toEqual({
      firstName: "François-Xavier",
      lastName: "Tour",
    });
  });

  it("should handle edge cases defensively", () => {
    // Non-string input that can be coerced
    expect(parseName(12345 as any)).toEqual({
      firstName: "12345",
      lastName: "",
    });
    expect(parseName(true as any)).toEqual({ firstName: "true", lastName: "" });
  });
});

describe("symbolToCurrency", () => {
  it("should convert common currency symbols to ISO codes", () => {
    expect(symbolToCurrency("€")).toBe("EUR");
    expect(symbolToCurrency("£")).toBe("GBP");
    expect(symbolToCurrency("$")).toBe("USD");
    expect(symbolToCurrency("¥")).toBe("JPY");
    expect(symbolToCurrency("￥")).toBe("JPY");
    expect(symbolToCurrency("₹")).toBe("INR");
    expect(symbolToCurrency("₽")).toBe("RUB");
    expect(symbolToCurrency("¢")).toBe("USD");
    expect(symbolToCurrency("₩")).toBe("KRW");
    expect(symbolToCurrency("₪")).toBe("ILS");
    expect(symbolToCurrency("₦")).toBe("NGN");
    expect(symbolToCurrency("₱")).toBe("PHP");
    expect(symbolToCurrency("₫")).toBe("VND");
    expect(symbolToCurrency("₺")).toBe("TRY");
    expect(symbolToCurrency("₿")).toBe("BTC");
    expect(symbolToCurrency("﷼")).toBe("SAR");
  });

  it("should convert text-based currency symbols", () => {
    expect(symbolToCurrency("R$")).toBe("BRL");
    expect(symbolToCurrency("C$")).toBe("CAD");
    expect(symbolToCurrency("A$")).toBe("AUD");
    expect(symbolToCurrency("S$")).toBe("SGD");
    expect(symbolToCurrency("HK$")).toBe("HKD");
    expect(symbolToCurrency("NZ$")).toBe("NZD");
    expect(symbolToCurrency("kr")).toBe("SEK");
    expect(symbolToCurrency("Kr")).toBe("SEK");
    expect(symbolToCurrency("zł")).toBe("PLN");
    expect(symbolToCurrency("Kč")).toBe("CZK");
    expect(symbolToCurrency("Ft")).toBe("HUF");
    expect(symbolToCurrency("лв")).toBe("BGN");
  });

  it("should handle null/undefined/empty inputs", () => {
    expect(symbolToCurrency(null)).toBe("EUR");
    expect(symbolToCurrency(undefined)).toBe("EUR");
    expect(symbolToCurrency("")).toBe("EUR");
    expect(symbolToCurrency("   ")).toBe("EUR");
  });

  it("should handle unknown symbols with fallback", () => {
    expect(symbolToCurrency("@")).toBe("EUR");
    expect(symbolToCurrency("&")).toBe("EUR");
    expect(symbolToCurrency("xyz")).toBe("EUR");
  });

  it("should handle non-string inputs", () => {
    expect(symbolToCurrency(123 as any)).toBe("EUR");
    expect(symbolToCurrency({} as any)).toBe("EUR");
    expect(symbolToCurrency([] as any)).toBe("EUR");
  });

  it("should trim whitespace around symbols", () => {
    expect(symbolToCurrency(" € ")).toBe("EUR");
    expect(symbolToCurrency("  $  ")).toBe("USD");
    expect(symbolToCurrency("\t£\n")).toBe("GBP");
  });
});

describe("currencyToSymbol", () => {
  it("should convert ISO currency codes to symbols", () => {
    expect(currencyToSymbol("EUR")).toBe("€");
    expect(currencyToSymbol("GBP")).toBe("£");
    expect(currencyToSymbol("USD")).toBe("$");
    expect(currencyToSymbol("JPY")).toBe("¥");
    expect(currencyToSymbol("INR")).toBe("₹");
    expect(currencyToSymbol("RUB")).toBe("₽");
    expect(currencyToSymbol("CNY")).toBe("¥");
    expect(currencyToSymbol("KRW")).toBe("₩");
    expect(currencyToSymbol("ILS")).toBe("₪");
    expect(currencyToSymbol("NGN")).toBe("₦");
    expect(currencyToSymbol("PHP")).toBe("₱");
    expect(currencyToSymbol("VND")).toBe("₫");
    expect(currencyToSymbol("TRY")).toBe("₺");
    expect(currencyToSymbol("BTC")).toBe("₿");
    expect(currencyToSymbol("SAR")).toBe("﷼");
  });

  it("should convert text-based currency codes to symbols", () => {
    expect(currencyToSymbol("BRL")).toBe("R$");
    expect(currencyToSymbol("CAD")).toBe("C$");
    expect(currencyToSymbol("AUD")).toBe("A$");
    expect(currencyToSymbol("SGD")).toBe("S$");
    expect(currencyToSymbol("HKD")).toBe("HK$");
    expect(currencyToSymbol("NZD")).toBe("NZ$");
    expect(currencyToSymbol("SEK")).toBe("kr");
    expect(currencyToSymbol("NOK")).toBe("kr");
    expect(currencyToSymbol("DKK")).toBe("kr");
    expect(currencyToSymbol("PLN")).toBe("zł");
    expect(currencyToSymbol("CZK")).toBe("Kč");
    expect(currencyToSymbol("HUF")).toBe("Ft");
    expect(currencyToSymbol("BGN")).toBe("лв");
    expect(currencyToSymbol("THB")).toBe("฿");
    expect(currencyToSymbol("CHF")).toBe("CHF");
  });

  it("should be case insensitive", () => {
    expect(currencyToSymbol("eur")).toBe("€");
    expect(currencyToSymbol("gbp")).toBe("£");
    expect(currencyToSymbol("usd")).toBe("$");
    expect(currencyToSymbol("Eur")).toBe("€");
    expect(currencyToSymbol("GbP")).toBe("£");
  });

  it("should handle null/undefined/empty inputs", () => {
    expect(currencyToSymbol(null)).toBe("€");
    expect(currencyToSymbol(undefined)).toBe("€");
    expect(currencyToSymbol("")).toBe("€");
    expect(currencyToSymbol("   ")).toBe("€");
  });

  it("should handle unknown currencies with fallback", () => {
    expect(currencyToSymbol("XYZ")).toBe("€");
    expect(currencyToSymbol("ABC")).toBe("€");
    expect(currencyToSymbol("INVALID")).toBe("€");
  });

  it("should handle non-string inputs", () => {
    expect(currencyToSymbol(123 as any)).toBe("€");
    expect(currencyToSymbol({} as any)).toBe("€");
    expect(currencyToSymbol([] as any)).toBe("€");
  });

  it("should trim whitespace around codes", () => {
    expect(currencyToSymbol(" EUR ")).toBe("€");
    expect(currencyToSymbol("  USD  ")).toBe("$");
    expect(currencyToSymbol("\tGBP\n")).toBe("£");
  });
});

describe("Currency conversion bidirectional tests", () => {
  it("should work bidirectionally for common currencies", () => {
    // Symbol -> Code -> Symbol
    expect(currencyToSymbol(symbolToCurrency("€"))).toBe("€");
    expect(currencyToSymbol(symbolToCurrency("£"))).toBe("£");
    expect(currencyToSymbol(symbolToCurrency("$"))).toBe("$");
    expect(currencyToSymbol(symbolToCurrency("¥"))).toBe("¥");

    // Code -> Symbol -> Code
    expect(symbolToCurrency(currencyToSymbol("EUR"))).toBe("EUR");
    expect(symbolToCurrency(currencyToSymbol("GBP"))).toBe("GBP");
    expect(symbolToCurrency(currencyToSymbol("USD"))).toBe("USD");
    expect(symbolToCurrency(currencyToSymbol("JPY"))).toBe("JPY");
  });
});

describe("isNilTextOrEmpty", () => {
  it("should return true for null/undefined/empty string", () => {
    expect(isNilTextOrEmpty(null)).toBe(true);
    expect(isNilTextOrEmpty(undefined)).toBe(true);
    expect(isNilTextOrEmpty("")).toBe(true);
  });
  it("should return true for textual 'null'/'undefined' (any case)", () => {
    expect(isNilTextOrEmpty("null")).toBe(true);
    expect(isNilTextOrEmpty("NULL")).toBe(true);
    expect(isNilTextOrEmpty("undefined")).toBe(true);
    expect(isNilTextOrEmpty(" UNDEFINED ")).toBe(true);
  });
  it("should return false for other strings and values", () => {
    expect(isNilTextOrEmpty("abc")).toBe(false);
    expect(isNilTextOrEmpty(0)).toBe(false);
    expect(isNilTextOrEmpty(false)).toBe(false);
    expect(isNilTextOrEmpty([])).toBe(false);
  });
  it("deprecated alias isNullUndefinedOrEmptyEnforced behaves the same", () => {
    expect(isNullUndefinedOrEmptyEnforced("null")).toBe(true);
    expect(isNullUndefinedOrEmptyEnforced("abc")).toBe(false);
  });
});

describe("delay", () => {
  it("should resolve after specified milliseconds", async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    expect(end - start).toBeLessThan(200);
  });

  it("should handle zero delay", async () => {
    const start = Date.now();
    await delay(0);
    const end = Date.now();
    expect(end - start).toBeLessThan(50);
  });

  it("should handle negative values as zero", async () => {
    const start = Date.now();
    await delay(-100);
    const end = Date.now();
    expect(end - start).toBeLessThan(50);
  });

  it("should return a promise", () => {
    const result = delay(10);
    expect(result).toBeInstanceOf(Promise);
  });
});

// Deprecated aliases tests
import {
  isNullOrUndefined,
  isNullOrUndefinedTextInc,
  isNullUndefinedOrEmpty,
  isNullOrUndefinedInArray,
  isNullOrUndefinedEmptyOrZero,
  isNullUndefinedOrZero,
  isNullOrUndefinedOrNaN,
  humanFileSize,
  getStringSimilarity,
  addSpaceBetweenNumbers,
} from "../src/utils/func";

describe("Deprecated aliases", () => {
  it("isNullOrUndefined behaves like isNil", () => {
    expect(isNullOrUndefined(null)).toBe(true);
    expect(isNullOrUndefined(undefined)).toBe(true);
    expect(isNullOrUndefined(0)).toBe(false);
  });

  it("isNullOrUndefinedTextInc behaves like isNilText", () => {
    expect(isNullOrUndefinedTextInc("null")).toBe(true);
    expect(isNullOrUndefinedTextInc("undefined")).toBe(true);
    expect(isNullOrUndefinedTextInc("abc")).toBe(false);
  });

  it("isNullUndefinedOrEmpty behaves like isNilOrEmpty", () => {
    expect(isNullUndefinedOrEmpty(null)).toBe(true);
    expect(isNullUndefinedOrEmpty("")).toBe(true);
    expect(isNullUndefinedOrEmpty("abc")).toBe(false);
  });

  it("isNullOrUndefinedInArray behaves like hasNilOrEmpty", () => {
    expect(isNullOrUndefinedInArray([null, 1])).toBe(true);
    expect(isNullOrUndefinedInArray([1, 2])).toBe(false);
    expect(isNullOrUndefinedInArray("not-an-array")).toBe(true);
  });

  it("isNullOrUndefinedEmptyOrZero behaves like isNilEmptyOrZeroLen", () => {
    expect(isNullOrUndefinedEmptyOrZero(null)).toBe(true);
    expect(isNullOrUndefinedEmptyOrZero("")).toBe(true);
    expect(isNullOrUndefinedEmptyOrZero([])).toBe(true);
    expect(isNullOrUndefinedEmptyOrZero([1])).toBe(false);
  });

  it("isNullUndefinedOrZero behaves like isNilOrZeroLen", () => {
    expect(isNullUndefinedOrZero(null)).toBe(true);
    expect(isNullUndefinedOrZero([])).toBe(true);
    expect(isNullUndefinedOrZero([1])).toBe(false);
  });

  it("isNullOrUndefinedOrNaN behaves like isNilOrNaN", () => {
    expect(isNullOrUndefinedOrNaN(null)).toBe(true);
    expect(isNullOrUndefinedOrNaN(NaN)).toBe(true);
    expect(isNullOrUndefinedOrNaN(123)).toBe(false);
  });

  it("humanFileSize behaves like formatBytes", () => {
    expect(humanFileSize(1024)).toBe("1.0 KiB");
    expect(humanFileSize(1000, true)).toBe("1.0 kB");
  });

  it("getStringSimilarity behaves like stringSimilarity", () => {
    expect(getStringSimilarity("abc", "abc")).toBe(1);
    expect(getStringSimilarity("abc", "xyz")).toBe(0);
  });

  it("addSpaceBetweenNumbers behaves like addThousandsSpace", () => {
    expect(addSpaceBetweenNumbers(1234567)).toBe("1 234 567");
    expect(addSpaceBetweenNumbers("1234567.89")).toBe("1 234 567.89");
  });
});

// Defensive catch coverage tests (force exceptions inside try blocks)
describe("Defensive catch coverage (func.ts)", () => {
  it("hasNilOrEmpty catch via throwing iterator", () => {
    const bad: any = {
      0: 1,
      1: 2,
      2: 3,
      length: 3,
      [Symbol.iterator]() {
        throw new Error("iter boom");
      },
    };
    expect(hasNilOrEmpty(bad)).toBe(true);
  });

  it("isNilEmptyOrZeroLen catch via throwing length getter", () => {
    const obj = Object.defineProperty({}, "length", {
      get() {
        throw new Error("len boom");
      },
    });
    expect(isNilEmptyOrZeroLen(obj)).toBe(true);
  });

  it("isNilOrZeroLen catch via throwing length getter", () => {
    const obj = Object.defineProperty({}, "length", {
      get() {
        throw new Error("len boom");
      },
    });
    expect(isNilOrZeroLen(obj)).toBe(true);
  });

  it("isNilOrNaN catch via valueOf throwing", () => {
    const tricky = {
      valueOf() {
        throw new Error("valueOf boom");
      },
    } as unknown as number;
    expect(isNilOrNaN(tricky)).toBe(true);
  });

  it("addThousandsSpace catch via toString throwing", () => {
    const tricky = {
      toString() {
        throw new Error("toString boom");
      },
    };
    // Function returns the original value (typed as string) in catch
    // We assert it does not throw and returns same reference
    const result = addThousandsSpace(tricky as any);
    expect(result as any).toBe(tricky);
  });

  it("isNilEmptyOrZeroLength catch via throwing length getter", () => {
    const obj = Object.defineProperty({}, "length", {
      get() {
        throw new Error("len boom");
      },
    });
    expect(isNilEmptyOrZeroLength(obj)).toBe(true);
  });

  it("isNilOrZeroLength catch via throwing length getter", () => {
    const obj = Object.defineProperty({}, "length", {
      get() {
        throw new Error("len boom");
      },
    });
    expect(isNilOrZeroLength(obj)).toBe(true);
  });
});
