import { describe, it, expect } from "vitest";
import { slugify, fill, deburr } from "../src/utils/string";
import { sanitize } from "../src/utils/string";

describe("slugify", () => {
  it("should convert string to slug", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});

describe("fill", () => {
  it("should fill string with values", () => {
    expect(fill("Hello {name}", { name: "World" })).toBe("Hello World");
    expect(fill("Value: {v}, Other: {o}", { v: 10, o: "abc" })).toBe(
      "Value: 10, Other: abc"
    );
  });
});

describe("deburr", () => {
  it("should remove diacritics and normalize string", () => {
    expect(deburr("ação")).toBe("acao");
    expect(deburr("coração")).toBe("coracao");
    expect(deburr("áéíóú")).toBe("aeiou");
    expect(deburr("ç")).toBe("c");
    expect(deburr("normal")).toBe("normal");
  });
  it("should return input as-is if normalization fails", () => {
    expect(deburr("")).toBe("");
  });
});

describe("sanitize", () => {
  it("should remove HTML tags and scripts", () => {
    expect(sanitize("<b>Hello</b> <script>alert(1)</script>")).toBe("Hello");
    expect(sanitize("<style>body{}</style>Text")).toBe("Text");
    expect(sanitize('<iframe src="x"></iframe>Safe')).toBe("Safe");
  });
  it("should remove dangerous URL schemes", () => {
    expect(sanitize("javascript:alert(1) data:text vbscript:foo file:bad ftp:bad2")).toBe("alert(1) text foo bad bad2");
  });
  it("should remove event handler attributes", () => {
    expect(sanitize('<img src="x" onerror="alert(1)">Test')).toBe("Test");
    expect(sanitize('<div onclick="doSomething()">Click</div>')).toBe("Click");
  });
  it("should remove CSS expressions", () => {
    expect(sanitize('<div style="width:100px;expression(alert(1))">Expr</div>')).toBe("Expr");
  });
  it("should remove dangerous HTML entities", () => {
    expect(sanitize('&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;Safe')).toBe("Safe");
  });
  it("should keep letters, numbers, spaces and basic punctuation", () => {
    expect(sanitize("Hello! @2025 #test &more%")).toBe(
      "Hello! @2025 #test &more%"
    );
  });
  it("should strip control characters", () => {
    expect(sanitize("Hello\u0000World")).toBe("HelloWorld");
  });
  it("should apply maxLength if provided", () => {
    expect(sanitize("This is a long text.", 7)).toBe("This is");
  });
  it("should trim whitespace", () => {
    expect(sanitize("   Hello   ")).toBe("Hello");
  });
  it("should return empty string for non-string input", () => {
    expect(sanitize(null)).toBe("");
    expect(sanitize(undefined)).toBe("");
    expect(sanitize(123)).toBe("");
  });
});
