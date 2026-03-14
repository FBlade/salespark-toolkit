import { describe, it, expect } from "vitest";
import { smsLength } from "../src/utils/sms";

describe("smsLength", () => {
  it("should calculate GSM 7-bit length for basic text", () => {
    const result = smsLength("hello");
    expect(result.encoding).toBe("GSM_7BIT");
    expect(result.length).toBe(5);
    expect(result.messages).toBe(1);
    expect(result.remaining).toBe(155);
  });

  it("should account for GSM extended characters", () => {
    const result = smsLength("^");
    expect(result.encoding).toBe("GSM_7BIT_EXT");
    expect(result.length).toBe(2);
    expect(result.messages).toBe(1);
    expect(result.remaining).toBe(158);
  });

  it("should detect UTF16 when needed", () => {
    const result = smsLength("😄");
    expect(result.encoding).toBe("UTF16");
    expect(result.length).toBe(2);
  });

  it("should handle multi-part messages", () => {
    const result = smsLength("a".repeat(161));
    expect(result.encoding).toBe("GSM_7BIT");
    expect(result.characterPerMessage).toBe(153);
    expect(result.messages).toBe(2);
    expect(result.inCurrentMessage).toBe(8);
  });

  it("should return defaults for empty input", () => {
    const result = smsLength("");
    expect(result.encoding).toBe("GSM_7BIT");
    expect(result.length).toBe(0);
    expect(result.messages).toBe(0);
    expect(result.remaining).toBe(160);
  });

  it("should allow custom segment overrides", () => {
    const result = smsLength("hello", { GSM_7BIT: 10 }, { GSM_7BIT: 5 });
    expect(result.characterPerMessage).toBe(10);
    expect(result.messages).toBe(1);
    expect(result.remaining).toBe(5);
  });
});
