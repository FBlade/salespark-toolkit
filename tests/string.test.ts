import { describe, it, expect } from "vitest";
import {
  slugify,
  fill,
  deburr,
  capitalizeFirst,
  capitalizeWords,
  sentenceCase,
  sanitize,
} from "../src/utils/string";

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

describe("capitalizeFirst", () => {
  it("should capitalize only the first letter and lower the rest by default", () => {
    expect(capitalizeFirst("hELLO world")).toBe("Hello world");
  });

  it("should keep the rest as-is when lowerRest is false", () => {
    expect(capitalizeFirst("hELLO world", { lowerRest: false })).toBe(
      "HELLO world"
    );
  });

  it("should return empty string for non-string or empty input", () => {
    expect(capitalizeFirst(123 as unknown as string)).toBe("");
    expect(capitalizeFirst("")).toBe("");
  });
});

describe("capitalizeWords", () => {
  it("should capitalize each word with default options", () => {
    expect(capitalizeWords("hello world from toolkit")).toBe(
      "Hello World From Toolkit"
    );
  });

  it("should preserve spacing and hyphens by default", () => {
    expect(capitalizeWords("  e-mail   marketing guide ")).toBe(
      "  E-mail   Marketing Guide "
    );
  });

  it("should treat hyphen as separator when requested", () => {
    expect(
      capitalizeWords("e-mail marketing", { treatHyphenAsSeparator: true })
    ).toBe("E-Mail Marketing");
  });

  it("should keep inner casing when lowerRest is false", () => {
    expect(capitalizeWords("jOhn dOE", { lowerRest: false })).toBe("JOhn DOE");
  });

  it("should return empty string for non-string or empty input", () => {
    expect(capitalizeWords(undefined as unknown as string)).toBe("");
    expect(capitalizeWords("")).toBe("");
  });
});

describe("sentenceCase", () => {
  it("should capitalize the beginning of sentences", () => {
    expect(sentenceCase("hello world. this is great! new test?")).toBe(
      "Hello world. This is great! New test?"
    );
  });

  it("should keep inner casing when lowerRest is false", () => {
    expect(sentenceCase("hELLO. sECOND sentence", { lowerRest: false })).toBe(
      "HELLO. SECOND sentence"
    );
  });

  it("should handle extra spaces between sentences", () => {
    expect(sentenceCase("hello.   another one")).toBe("Hello.   Another one");
  });

  it("should return empty string for non-string or empty input", () => {
    expect(sentenceCase(null as unknown as string)).toBe("");
    expect(sentenceCase("")).toBe("");
  });
});

describe("sanitize", () => {
  it("should remove HTML tags and scripts", () => {
    expect(sanitize("<b>Hello</b> <script>alert(1)</script>")).toBe("Hello");
    expect(sanitize("<style>body{}</style>Text")).toBe("Text");
    expect(sanitize('<iframe src="x"></iframe>Safe')).toBe("Safe");
  });
  it("should remove dangerous URL schemes", () => {
    expect(
      sanitize("javascript:alert(1) data:text vbscript:foo file:bad ftp:bad2")
    ).toBe("alert(1) text foo bad bad2");
  });
  it("should remove event handler attributes", () => {
    expect(sanitize('<img src="x" onerror="alert(1)">Test')).toBe("Test");
    expect(sanitize('<div onclick="doSomething()">Click</div>')).toBe("Click");
  });
  it("should remove CSS expressions", () => {
    expect(
      sanitize('<div style="width:100px;expression(alert(1))">Expr</div>')
    ).toBe("Expr");
  });
  it("should remove dangerous HTML entities", () => {
    expect(sanitize("&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;Safe")).toBe(
      "Safe"
    );
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
