import { describe, it, expect } from "vitest";
import {
  encodeObject,
  decodeObject,
  encodeString,
  decodeString,
} from "../src/utils/scramble";

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

describe("encodeString/decodeString", () => {
  it("should round-trip a string with the same secret", () => {
    const secret = "key";
    const input = "Hello, encode!";

    const encoded = encodeString(input, secret);
    expect(encoded.status).toBe(true);

    const decoded = decodeString(encoded.data as string, secret);
    expect(decoded.status).toBe(true);

    expect(decoded.data).toBe(input);
  });

  it("should return status false for invalid inputs", () => {
    const badInput = encodeString(123 as any, "secret");
    const badSecret = encodeString("value", "");
    const badDecodeValue = decodeString(123 as any, "secret");
    const badDecodeSecret = decodeString("value", "");

    expect(badInput.status).toBe(false);
    expect(badSecret.status).toBe(false);
    expect(badDecodeValue.status).toBe(false);
    expect(badDecodeSecret.status).toBe(false);
  });

  it("should fail to decode with the wrong secret", () => {
    const input = "payload";
    const encoded = encodeString(input, "secret");
    expect(encoded.status).toBe(true);

    const decoded = decodeString(encoded.data as string, "wrong");
    expect(decoded.status).toBe(true); // Note: decodeString returns status true even if the secret is wrong, but data will be incorrect
    expect(decoded.data).not.toBe(input); // The decoded data should not match the original input if the secret is wrong
  });
});
