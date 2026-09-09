import { describe, expect, it } from "vitest";
import { dateKeyOf, eachDayKey, parseDateKey, resolveRange, toDateKey } from "../dates";

describe("dates", () => {
  it("round-trips a date key through local parsing", () => {
    const d = new Date(2026, 0, 31);
    expect(toDateKey(d)).toBe("2026-01-31");
    expect(toDateKey(parseDateKey("2026-01-31"))).toBe("2026-01-31");
  });

  it("keeps date-only strings as-is and converts timestamps to local dates", () => {
    expect(dateKeyOf("2026-09-08")).toBe("2026-09-08");
    const local = new Date(2026, 8, 8, 23, 30);
    expect(dateKeyOf(local.toISOString())).toBe("2026-09-08");
    expect(dateKeyOf(null)).toBeNull();
    expect(dateKeyOf("nonsense")).toBeNull();
  });

  it("resolves presets to adjacent, equally sized windows", () => {
    const today = new Date(2026, 8, 8);
    const r = resolveRange("30d", today);
    expect(toDateKey(r.to)).toBe("2026-09-08");
    expect(toDateKey(r.from)).toBe("2026-08-10");
    expect(toDateKey(r.prevTo)).toBe("2026-08-09");
    expect(toDateKey(r.prevFrom)).toBe("2026-07-11");
    expect(eachDayKey(r.from, r.to)).toHaveLength(30);
    expect(eachDayKey(r.prevFrom, r.prevTo)).toHaveLength(30);
    expect(resolveRange("7d", today).bucket).toBe("day");
    expect(resolveRange("3m", today).bucket).toBe("week");
  });
});
