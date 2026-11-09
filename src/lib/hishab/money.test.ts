import { describe, it, expect } from "vitest";
import { parseAmount, takaToPaisa } from "./money.ts";

describe("parseAmount", () => {
  it("parses English digits", () => {
    expect(parseAmount("500")).toBe(500);
    expect(parseAmount("15.50")).toBe(15.5);
    expect(parseAmount("0")).toBe(0);
  });

  it("parses Bangla digits", () => {
    expect(parseAmount("৫০০")).toBe(500);
    expect(parseAmount("১৫.৫০")).toBe(15.5);
    expect(parseAmount("০")).toBe(0);
  });

  it("ignores surrounding whitespace", () => {
    expect(parseAmount("  ৫০০  ")).toBe(500);
  });

  it("returns NaN for non-numeric input", () => {
    expect(Number.isNaN(parseAmount(""))).toBe(true);
    expect(Number.isNaN(parseAmount("abc"))).toBe(true);
    expect(Number.isNaN(parseAmount("৫০abc"))).toBe(true);
  });

  it("converts to paisa correctly", () => {
    expect(parseAmount("৫০০")).toBe(500);
    expect(parseAmount("১৫.৫০")).toBe(15.5);
    expect(takaToPaisa(parseAmount("৫০০"))).toBe(50000);
  });
});
