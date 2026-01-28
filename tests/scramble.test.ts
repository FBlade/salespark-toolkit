import { describe, it, expect } from "vitest";
import {
  scrambleString,
  descrambleString,
  encodeObject,
  decodeObject,
} from "../src/utils/scramble";

describe("scrambleString/descrambleString", () => {
  it("should round-trip a string with the same secret", () => {
    const secret = "s3cr3t";
    const input = "Hello, world!";

    const scrambled = scrambleString(input, secret);
    const output = descrambleString(scrambled, secret);

    expect(output).toBe(input);
  });

  it("should produce different outputs for different secrets", () => {
    const input = "payload";
    const out1 = scrambleString(input, "secret1");
    const out2 = scrambleString(input, "secret2");

    expect(out1).not.toBe(out2);
  });

  it("should throw for invalid inputs", () => {
    expect(() => scrambleString(123 as any, "secret")).toThrow(TypeError);
    expect(() => scrambleString("value", "")).toThrow(TypeError);
    expect(() => descrambleString(123 as any, "secret")).toThrow(TypeError);
    expect(() => descrambleString("value", "")).toThrow(TypeError);
  });
});

describe("encodeObject/decodeObject", () => {
  it("should round-trip an object with the same secret", () => {
    const secret = "key";
    const input = { id: 1, name: "Ana", active: true };

    const encoded = encodeObject(input, secret);
    const decoded = decodeObject(encoded, secret);

    expect(decoded).toEqual(input);
  });

  it("should handle arrays as input", () => {
    const secret = "key";
    const input = [1, "two", { three: 3 }];

    const encoded = encodeObject(input as any, secret);
    const decoded = decodeObject(encoded, secret);

    expect(decoded).toEqual(input);
  });

  it("should throw for invalid inputs", () => {
    expect(() => encodeObject(null as any, "secret")).toThrow(TypeError);
    expect(() => encodeObject("bad" as any, "secret")).toThrow(TypeError);
    expect(() => encodeObject({}, "")).toThrow(TypeError);
    expect(() => decodeObject(123 as any, "secret")).toThrow(TypeError);
    expect(() => decodeObject("value", "")).toThrow(TypeError);
  });

  it("should fail to decode with the wrong secret", () => {
    const input = { a: 1 };
    const encoded = encodeObject(input, "secret");
    expect(() => decodeObject(encoded, "wrong")).toThrow();
  });
});
