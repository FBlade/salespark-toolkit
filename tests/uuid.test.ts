import { describe, it, expect } from "vitest";
import { uuidv4 } from "../src/utils/uuid";

describe("uuid utils", () => {
  it("should generate a RFC 4122 v4 uuid", () => {
    const value = uuidv4();

    expect(typeof value).toBe("string");
    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should generate unique values across calls", () => {
    const first = uuidv4();
    const second = uuidv4();

    expect(first).not.toBe(second);
  });
});
