import { describe, it, expect } from "vitest";
import { generatePassword } from "../src/utils/password";

describe("generatePassword", () => {
  it("should generate a sync password with the provided length", () => {
    const result = generatePassword(96, false);
    expect(typeof result).toBe("string");
    expect(result.length).toBe(96);
  });

  it("should generate a memorable sync password", () => {
    const result = generatePassword({
      length: 12,
      memorable: true,
      ignoreSecurityRecommendations: true,
    });
    expect(typeof result).toBe("string");
    expect((result as string).length).toBe(12);
  });

  it("should generate async words password", async () => {
    const result = await generatePassword({ words: 3, ignoreSecurityRecommendations: true });
    expect(typeof result).toBe("string");
    expect(result.split(" ").length).toBe(3);
  });

  it("should generate deterministic output with entropy", async () => {
    const first = await generatePassword({
      length: 24,
      entropy: "seed-123",
      ignoreSecurityRecommendations: true,
    });
    const second = await generatePassword({
      length: 24,
      entropy: "seed-123",
      ignoreSecurityRecommendations: true,
    });

    expect(first).toBe(second);
  });
});
