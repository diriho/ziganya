import { describe, expect, it } from "vitest";
import { normalizeExtraction } from "./normalize";

const TODAY = new Date(2026, 8, 8);
const cats = [
  { id: "c-groc", name: "Groceries" },
  { id: "c-dine", name: "Dining" },
];

describe("normalizeExtraction", () => {
  it("passes a clean extraction through and maps the category by name", () => {
    const out = normalizeExtraction(
      {
        is_receipt: true,
        merchant_name: "  Whole Foods Market ",
        amount: 84.2,
        currency: "usd",
        transaction_date: "2026-09-07",
        category: "groceries",
        items: [{ name: "Bananas", amount: 3.49 }, { name: "", amount: 1 }],
        confidence: 0.91,
        uncertain_fields: ["transaction_date", "bogus"],
      },
      { today: TODAY, categories: cats }
    );
    expect(out.merchantName).toBe("Whole Foods Market");
    expect(out.amount).toBe(84.2);
    expect(out.currency).toBe("USD");
    expect(out.transactionDate).toBe("2026-09-07");
    expect(out.categoryId).toBe("c-groc");
    expect(out.items).toEqual([{ name: "Bananas", amount: 3.49 }]);
    expect(out.confidence).toBe(0.91);
    expect(out.uncertainFields).toEqual(["transaction_date"]);
    expect(out.isReceipt).toBe(true);
  });

  it("nulls implausible values and flags them for review", () => {
    const out = normalizeExtraction(
      {
        merchant_name: null,
        amount: "-$1,234.56",
        currency: "dollars",
        transaction_date: "2026-12-25", // in the future
        category: "Pets",
        confidence: 140,
      },
      { today: TODAY, defaultCurrency: "EUR", categories: cats }
    );
    expect(out.merchantName).toBeNull();
    expect(out.amount).toBe(1234.56); // sign stripped, thousands separator handled
    expect(out.currency).toBe("EUR");
    expect(out.transactionDate).toBeNull();
    expect(out.categoryId).toBeNull();
    expect(out.confidence).toBe(1);
    expect(out.uncertainFields).toEqual(["merchant_name", "currency", "transaction_date", "category"]);
  });

  it("rejects zero amounts, invalid dates and unknown category ids", () => {
    const out = normalizeExtraction(
      { amount: 0, transaction_date: "2026-02-30", category_id: "nope", category: "Dining" },
      { today: TODAY, categories: cats }
    );
    expect(out.amount).toBeNull();
    expect(out.transactionDate).toBeNull();
    expect(out.categoryId).toBe("c-dine"); // falls back to name match
    expect(out.uncertainFields).toContain("amount");
  });

  it("tolerates a missing payload and timestamps", () => {
    const empty = normalizeExtraction(null, { today: TODAY });
    expect(empty.amount).toBeNull();
    expect(empty.confidence).toBe(0.5);
    expect(empty.uncertainFields.length).toBe(5);
    const ts = normalizeExtraction({ transaction_date: "2026-09-01T14:22:00Z", amount: 12 }, { today: TODAY });
    expect(ts.transactionDate).toBe("2026-09-01");
  });
});
