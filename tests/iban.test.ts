import { describe, it, expect } from "vitest";
import { isValidIBAN } from "../src/utils/iban";

describe("isValidIBAN", () => {
  it("accepts valid IBANs from various countries", () => {
    const validIBANs = [
      "NL91ABNA0417164300", // Netherlands
      "GB29NWBK60161331926819", // United Kingdom
      "DE89370400440532013000", // Germany
      "FR1420041010050500013M02606", // France
      "IT60X0542811101000000123456", // Italy
      "ES9121000418450200051332", // Spain
      "CH9300762011623852957", // Switzerland
      "BE68539007547034", // Belgium
      "AT611904300234573201", // Austria
      "PT50000201231234567890154", // Portugal
    ];

    for (const iban of validIBANs) {
      expect(isValidIBAN(iban)).toBe(true);
    }
  });

  it("accepts valid IBANs with formatting", () => {
    const formattedIBANs = [
      "NL91 ABNA 0417 1643 00",
      "GB29 NWBK 6016 1331 9268 19",
      "DE89 3704 0044 0532 0130 00",
      "FR14-2004-1010-0505-0001-3M02-606",
    ];

    for (const iban of formattedIBANs) {
      expect(isValidIBAN(iban)).toBe(true);
    }
  });

  it("rejects invalid IBANs with wrong checksums", () => {
    const invalidIBANs = [
      "NL91ABNA0417164301", // Wrong last digit
      "GB29NWBK60161331926818", // Wrong last digit
      "DE89370400440532013001", // Wrong last digit
      "FR1420041010050500013M02607", // Wrong last digit
    ];

    for (const iban of invalidIBANs) {
      expect(isValidIBAN(iban)).toBe(false);
    }
  });

  it("rejects IBANs with invalid country codes", () => {
    expect(isValidIBAN("XX1234567890123456")).toBe(false);
    expect(isValidIBAN("ZZ9876543210987654")).toBe(false);
  });

  it("rejects IBANs with incorrect length", () => {
    expect(isValidIBAN("NL91ABNA041716430")).toBe(false); // Too short
    expect(isValidIBAN("NL91ABNA04171643000")).toBe(false); // Too long
    expect(isValidIBAN("GB29NWBK60161331926819123")).toBe(false); // Too long
  });

  it("rejects IBANs with invalid BBAN format", () => {
    expect(isValidIBAN("NL91ABCD0417164300")).toBe(false); // Invalid bank code format
    expect(isValidIBAN("DE89ABCD00440532013000")).toBe(false); // Letters where numbers expected
  });

  it("rejects IBANs with invalid check digits", () => {
    expect(isValidIBAN("NL**ABNA0417164300")).toBe(false); // Non-numeric check digits
    expect(isValidIBAN("NLAB ABNA0417164300")).toBe(false); // Letters in check digits
  });

  it("rejects null, undefined, and non-string inputs", () => {
    expect(isValidIBAN(null as any)).toBe(false);
    expect(isValidIBAN(undefined as any)).toBe(false);
    expect(isValidIBAN("")).toBe(false);
    expect(isValidIBAN(12345 as any)).toBe(false);
  });

  it("handles edge cases gracefully", () => {
    expect(isValidIBAN("A")).toBe(false); // Too short
    expect(isValidIBAN("AB")).toBe(false); // Too short
    expect(isValidIBAN("AB12")).toBe(false); // Too short
    expect(isValidIBAN("   ")).toBe(false); // Only spaces
    expect(isValidIBAN("NL91")).toBe(false); // Only country + check
  });

  it("validates specific country BBAN rules", () => {
    // Belgian IBAN with specific BBAN validation
    expect(isValidIBAN("BE68539007547034")).toBe(true);
    expect(isValidIBAN("BE68539007547035")).toBe(false); // Invalid Belgian checksum
    
    // Norwegian IBAN with MOD-11 validation
    expect(isValidIBAN("NO9386011117947")).toBe(true);
    expect(isValidIBAN("NO9386011117948")).toBe(false); // Invalid Norwegian checksum
  });

  it("handles case insensitive input", () => {
    expect(isValidIBAN("nl91abna0417164300")).toBe(true);
    expect(isValidIBAN("GB29nwbk60161331926819")).toBe(true);
    expect(isValidIBAN("de89370400440532013000")).toBe(true);
  });

  it("validates SEPA and non-SEPA countries", () => {
    // SEPA countries
    expect(isValidIBAN("FR1420041010050500013M02606")).toBe(true);
    expect(isValidIBAN("IT60X0542811101000000123456")).toBe(true);
    
    // Non-SEPA countries
    expect(isValidIBAN("BR9700360305000010009795493P1")).toBe(true); // Brazil
    expect(isValidIBAN("JO94CBJO0010000000000131000302")).toBe(true); // Jordan
  });
});