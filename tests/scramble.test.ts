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
    expect(scrambled.status).toBe(true);

    const output = descrambleString(scrambled.data as string, secret);
    expect(output.status).toBe(true);

    expect(output.data).toBe(input);
  });

  it("should produce different outputs for different secrets", () => {
    const input = "payload";
    const out1 = scrambleString(input, "secret1");
    const out2 = scrambleString(input, "secret2");

    expect(out1.status).toBe(true);
    expect(out2.status).toBe(true);
    expect(out1.data).not.toBe(out2.data);
  });

  it("should return status false for invalid inputs", () => {
    const badValue = scrambleString(123 as any, "secret");
    const badSecret = scrambleString("value", "");
    const badDescrambleValue = descrambleString(123 as any, "secret");
    const badDescrambleSecret = descrambleString("value", "");

    expect(badValue.status).toBe(false);
    expect(badSecret.status).toBe(false);
    expect(badDescrambleValue.status).toBe(false);
    expect(badDescrambleSecret.status).toBe(false);
  });
});

describe("encodeObject/decodeObject", () => {
  it("should round-trip an object with the same secret", () => {
    const secret = "key";
    const input = { id: 1, name: "Ana", active: true };

    const encoded = encodeObject(input, secret);
    expect(encoded.status).toBe(true);

    const decoded = decodeObject(encoded.data as string, secret);
    expect(decoded.status).toBe(true);

    expect(decoded.data).toEqual(input);
  });

  it("should handle arrays as input", () => {
    const secret = "key";
    const input = [1, "two", { three: 3 }];

    const encoded = encodeObject(input as any, secret);
    expect(encoded.status).toBe(true);

    const decoded = decodeObject(encoded.data as string, secret);
    expect(decoded.status).toBe(true);

    expect(decoded.data).toEqual(input);
  });

  it("should return status false for invalid inputs", () => {
    const badInput = encodeObject(null as any, "secret");
    const badType = encodeObject("bad" as any, "secret");
    const badSecret = encodeObject({}, "");
    const badDecodeValue = decodeObject(123 as any, "secret");
    const badDecodeSecret = decodeObject("value", "");

    expect(badInput.status).toBe(false);
    expect(badType.status).toBe(false);
    expect(badSecret.status).toBe(false);
    expect(badDecodeValue.status).toBe(false);
    expect(badDecodeSecret.status).toBe(false);
  });

  it("should fail to decode with the wrong secret", () => {
    const input = { a: 1 };
    const encoded = encodeObject(input, "secret");
    expect(encoded.status).toBe(true);

    const decoded = decodeObject(encoded.data as string, "wrong");
    expect(decoded.status).toBe(false);
  });
});
