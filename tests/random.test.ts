import { describe, it, expect, vi } from "vitest";
import {
  createToken,
  random,
  randFromArray,
  randIntFromInterval,
  shuffleArray,
  shuffleArrayMutate,
  shuffleString,
  generateRandomId,
} from "../src/utils/random";

describe("random utils: createToken", () => {
  const baseAlphabet =
    "ABCDEFGHIJKLMOPQRSTUVWXYZ" +
    "abcdefghijklmopqrstuvwxyz" +
    "0123456789";

  const assertAllCharsIn = (value: string, alphabet: string) => {
    for (const ch of value) {
      expect(alphabet.includes(ch)).toBe(true);
    }
  };

  it("should generate a token with default length", () => {
    const token = createToken();
    expect(token.length).toBe(64);
    assertAllCharsIn(token, baseAlphabet);
  });

  it("should respect custom length", () => {
    const token = createToken({ length: 12 });
    expect(token.length).toBe(12);
    assertAllCharsIn(token, baseAlphabet);
  });

  it("should floor non-integer length", () => {
    const token = createToken({ length: 8.7 });
    expect(token.length).toBe(8);
  });

  it("should return empty string for non-positive length", () => {
    expect(createToken({ length: 0 })).toBe("");
    expect(createToken({ length: -5 })).toBe("");
  });

  it("should return empty string when alphabet resolves to empty", () => {
    const token = createToken({
      withUppercase: false,
      withLowercase: false,
      withNumbers: false,
      withSymbols: false,
    });
    expect(token).toBe("");
  });

  it("should use custom alphabet", () => {
    const token = createToken({ length: 20, alphabet: "ABC" });
    expect(token.length).toBe(20);
    assertAllCharsIn(token, "ABC");
  });

  it("should honor lowercase-only flag", () => {
    const token = createToken({
      length: 16,
      withUppercase: false,
      withNumbers: false,
      withSymbols: false,
    });
    expect(token.length).toBe(16);
    assertAllCharsIn(token, "abcdefghijklmopqrstuvwxyz");
  });
});

describe("random utils: helpers", () => {
  it("random should proxy Math.random", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.42);
    expect(random()).toBe(0.42);
    spy.mockRestore();
  });

  it("randFromArray should pick a deterministic element", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.0);
    expect(randFromArray(["a", "b", "c"])).toBe("a");
    spy.mockRestore();
  });

  it("randIntFromInterval should stay within bounds", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randIntFromInterval(10, 20)).toBe(15);
    spy.mockRestore();
  });

  it("shuffleArrayMutate should shuffle in place", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.0);
    const input = [1, 2, 3];
    const result = shuffleArrayMutate(input);
    expect(result).toBe(input);
    expect(result).toEqual([2, 3, 1]);
    spy.mockRestore();
  });

  it("shuffleArray should return a new array", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.0);
    const input = [1, 2, 3];
    const result = shuffleArray(input);
    expect(result).not.toBe(input);
    expect(result).toEqual([2, 3, 1]);
    expect(input).toEqual([1, 2, 3]);
    spy.mockRestore();
  });

  it("shuffleString should shuffle characters deterministically", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.0);
    expect(shuffleString("abc")).toBe("bca");
    spy.mockRestore();
  });

  it("generateRandomId should return id prefix and 10 chars", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.1);
    const id = generateRandomId();
    expect(id).toMatch(/^id-[a-z0-9]{10}$/);
    spy.mockRestore();
  });
});
