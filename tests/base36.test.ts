import { describe, it, expect } from "vitest";
import {
  decodeBase36Code,
  encodeBase36Code,
  type EncodeDecodeConfig,
} from "../src/utils/base36";

describe("base36 encode/decode utils", () => {
  const secret = "super-long-secret-123";

  it("should encode and decode the same identifier", () => {
    const identifier = "AB12CD34";

    const encoded = encodeBase36Code(identifier, { secret });
    expect(encoded.status).toBe(true);
    expect((encoded.data as { code: string }).code).toMatch(/^[a-z0-9]+$/);

    const decoded = decodeBase36Code((encoded.data as { code: string }).code, {
      secret,
    });
    expect(decoded.status).toBe(true);
    expect((decoded.data as { identifier: string }).identifier).toBe(
      identifier,
    );
  });

  it("should normalize decoded identifier to upper-case", () => {
    const encoded = encodeBase36Code("abc123", { secret });
    expect(encoded.status).toBe(true);

    const decoded = decodeBase36Code((encoded.data as { code: string }).code, {
      secret,
    });

    expect(decoded.status).toBe(true);
    expect((decoded.data as { identifier: string }).identifier).toBe("ABC123");
  });

  it("should support custom configuration", () => {
    const config: EncodeDecodeConfig = {
      secret,
      bitSize: 96,
      rotateBits: 21,
      addConstant: "0x9f4c2b1a7d",
    };

    const encoded = encodeBase36Code("ZZ99", config);
    expect(encoded.status).toBe(true);

    const decoded = decodeBase36Code(
      (encoded.data as { code: string }).code,
      config,
    );
    expect(decoded.status).toBe(true);
    expect((decoded.data as { identifier: string }).identifier).toBe("ZZ99");
  });

  it("should reject invalid inputs and weak secret", () => {
    const weakSecretConfig = { secret: "short" };

    const badSecret = encodeBase36Code("ABC123", weakSecretConfig);
    expect(badSecret.status).toBe(false);

    const badIdentifier = encodeBase36Code("ABC-123", { secret });
    expect(badIdentifier.status).toBe(false);

    const badCode = decodeBase36Code("abc-123", { secret });
    expect(badCode.status).toBe(false);
  });

  it("should reject invalid config values", () => {
    const badConfig = {
      secret,
      bitSize: 0,
    };

    const encoded = encodeBase36Code("ABC123", badConfig);
    expect(encoded.status).toBe(false);

    const decoded = decodeBase36Code("abc123", badConfig);
    expect(decoded.status).toBe(false);
  });
});
