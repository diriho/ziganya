import { describe, expect, it } from "vitest";
import { formatCurrency, formatRelativeDay, formatSignedAmount, initialsOf, titleCase } from "../format";

describe("format", () => {
  it("formats currency with sign handling and compact notation", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(-42)).toBe("-$42.00");
    expect(formatCurrency(42, "USD", { signed: true })).toBe("+$42.00");
    expect(formatCurrency(4200, "USD", { compact: true })).toBe("$4.2K");
    expect(formatCurrency(Number.NaN)).toBe("$0.00");
    expect(formatCurrency(10, "EUR")).toBe("€10.00");
  });

  it("signs transaction amounts by type", () => {
    expect(formatSignedAmount(20, true)).toBe("-$20.00");
    expect(formatSignedAmount(20, false)).toBe("+$20.00");
  });

  it("describes nearby days relatively", () => {
    const today = new Date(2026, 8, 8);
    expect(formatRelativeDay("2026-09-08", today)).toBe("Today");
    expect(formatRelativeDay("2026-09-09", today)).toBe("Tomorrow");
    expect(formatRelativeDay("2026-09-07", today)).toBe("Yesterday");
    expect(formatRelativeDay("2026-09-12", today)).toBe("In 4 days");
    expect(formatRelativeDay("2026-09-01", today)).toBe("7 days ago");
    expect(formatRelativeDay("2026-01-01", today)).toBe("Jan 1");
  });

  it("builds initials and title case", () => {
    expect(initialsOf("Don Destin Iriho")).toBe("DI");
    expect(initialsOf("ada")).toBe("A");
    expect(initialsOf("")).toBe("U");
    expect(titleCase("bank_transfer")).toBe("Bank Transfer");
  });
});
