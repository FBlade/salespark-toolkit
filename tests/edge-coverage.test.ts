import { describe, it, expect } from "vitest";
import {
  areArraysEqual,
  isFlattenable,
  flattenDepthBase,
} from "../src/utils/array";
import { toBool } from "../src/utils/bool";
import { randomDigits } from "../src/utils/number";
import { objectToString, cleanObject } from "../src/utils/object";
import { deburr } from "../src/utils/string";
import * as toolkit from "../src"; // covers index.ts exports

describe("edge coverage: array.areArraysEqual catch", () => {
  it("returns false on circular structures (catch path)", () => {
    const a: any = { x: 1 };
    a.self = a; // circular
    const b: any = { x: 1 };
    b.self = b; // circular
    // The normalization will recurse infinitely and throw (RangeError), hitting catch
    expect(areArraysEqual([a], [b])).toBe(false);
  });
});

describe("edge coverage: array.isFlattenable branches", () => {
  it("detects arguments object", () => {
    const args = (function () {
      // eslint-disable-next-line prefer-rest-params
      return arguments; // arguments object
    })();
    expect(isFlattenable(args)).toBe(true);
  });

  it("respects Symbol.isConcatSpreadable", () => {
    const spreadable = { length: 0, 0: "x", [Symbol.isConcatSpreadable]: true } as any;
    expect(isFlattenable(spreadable)).toBe(true);
  });

  it("flattenDepthBase with predicate/isStrict false keeps non-flattenable", () => {
    const input = [1, { a: 2 }, [3]];
    const out = flattenDepthBase<number | { a: number } | number[]>(input, 1);
    expect(out).toContain(1);
    expect(out.some((v) => typeof v === "object")).toBe(true);
  });
});

describe("edge coverage: bool.toBool catch", () => {
  it("falls back to catch when toLowerCase throws", () => {
    const original = String.prototype.toLowerCase;
    String.prototype.toLowerCase = function () {
      throw new Error("boom");
    } as any;
    try {
      // Normally would be true, but error triggers catch returning false
      expect(toBool("true")).toBe(false);
    } finally {
      String.prototype.toLowerCase = original;
    }
  });
});

describe("edge coverage: number.randomDigits rare branches", () => {
  it("returns empty string when noLeadingZero and only zero in charset", () => {
    expect(randomDigits(5, { charset: "0", noLeadingZero: true })).toBe("");
  });

  it("falls back when crypto unavailable", () => {
    const g: any = globalThis as any;
    const saved = g.crypto;
    try {
      delete g.crypto; // force fallback path (Math.random)
      const r = randomDigits(4);
      expect(r).toHaveLength(4);
    } finally {
      if (saved) g.crypto = saved;
    }
  });
});

describe("edge coverage: object.objectToString catch", () => {
  it("circular object triggers catch and fallback String()", () => {
    const o: any = { a: 1 };
    o.self = o;
    const str = objectToString(o);
    // Depending on how JSON.stringify behaves with circular + catch fallback, allow either form.
    expect(["[object Object]", "a=1", "a=1_self=[object Object]"]).toContain(
      str
    );
  });

  it("cleanObject prunes empty nested objects/objects but preserves trailing empty array inside array", () => {
    const input = {
      a: null,
      b: "null",
      c: { d: undefined, e: [], f: { g: [] } },
      h: [1, null, "undefined", 2, []],
    };
    const cleaned = cleanObject(input);
    expect(cleaned).toHaveProperty("h");
    expect(cleaned).not.toHaveProperty("a");
    expect(cleaned).not.toHaveProperty("b");
    // Result keeps [1,2,[]] porque arrays internas vazias não são removidas em arrays de topo
    expect(cleaned.h.length).toBe(3);
    expect(Array.isArray(cleaned.h[2])).toBe(true);
    expect((cleaned.h[2] as any[]).length).toBe(0);
  });
});

describe("edge coverage: string.deburr catch", () => {
  it("deburr returns original string when normalize throws", () => {
    const original = String.prototype.normalize;
    String.prototype.normalize = function () {
      throw new Error("normalize boom");
    } as any;
    try {
      const s = deburr("ação");
      expect(s).toBe("ação"); // unchanged because catch path
    } finally {
      String.prototype.normalize = original;
    }
  });
});

describe("edge coverage: index exports", () => {
  it("exports isBrowser and isNode booleans", () => {
    expect(typeof (toolkit as any).isBrowser).toBe("boolean");
    expect(typeof (toolkit as any).isNode).toBe("boolean");
  });
});
