import { describe, it, expect } from "vitest";
import { isPTTaxId, isValidPTTaxId } from "../src/utils/validations";

// Helper: generate a valid Portuguese tax ID for given prefix + middle body
function buildValidNIF(prefix: string, middle: string) {
  const base = (prefix + middle).slice(0, 8); // garantir 8
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(base[i], 10) * (9 - i);
  }
  const mod11 = sum % 11;
  const check = mod11 < 2 ? 0 : 11 - mod11;
  return base + String(check);
}

const generated = [
  buildValidNIF("1", "2345678"),
  buildValidNIF("2", "0000000"),
  buildValidNIF("5", "9876543"),
];

describe("isPTTaxId", () => {
  it("accepts generated valid Portuguese tax IDs", () => {
    for (const nif of generated) {
      expect(isPTTaxId(nif)).toBe(true);
    }
  });

  it("rejects incorrect length", () => {
    expect(isPTTaxId("123")).toBe(false);
    expect(isPTTaxId("1234567890")).toBe(false);
  });

  it("rejects non-numeric characters", () => {
    expect(isPTTaxId("12345678A")).toBe(false);
  });

  it("rejects repeated-digit sequences", () => {
    expect(isPTTaxId("000000000")).toBe(false);
    expect(isPTTaxId("111111111")).toBe(false);
  });

  it("rejects disallowed prefix (no override supported)", () => {
    const tx = buildValidNIF("4", "1234567");
    expect(isPTTaxId(tx)).toBe(false);
  });

  it("rejects wrong check digit", () => {
    const valid = generated[0];
    const tampered = valid.slice(0, 8) + ((parseInt(valid[8], 10) + 1) % 10);
    expect(isPTTaxId(tampered)).toBe(false);
  });

  it("accepts input with separators", () => {
    const nif = generated[1];
    const withSpaces =
      nif.slice(0, 3) + " " + nif.slice(3, 6) + "-" + nif.slice(6);
    expect(isPTTaxId(withSpaces)).toBe(true);
  });

  it("alias isValidPTTaxId still works (deprecated)", () => {
    const sample = generated[0];
    expect(isValidPTTaxId(sample)).toBe(true);
    expect(isValidPTTaxId(sample)).toBe(isPTTaxId(sample));
  });
});
