import { describe, expect, it } from "vitest";
import { parseMoneyToken, parseReceiptText } from "./parseReceiptText";

const TODAY = new Date(2026, 8, 9);
const cats = [
  { id: "c-groc", name: "Groceries" },
  { id: "c-dine", name: "Dining" },
  { id: "c-trans", name: "Transport" },
  { id: "c-health", name: "Health" },
];

const WHOLE_FOODS = `
WHOLE FOODS MARKET
601 N Main St
Providence RI 02904
(401) 555-0142
09/07/2026 6:42 PM     Store #10432
ORGANIC BANANAS           3.49
OAT MILK                  5.99
SOURDOUGH LOAF            7.50
SALMON FILLET            18.99
MISC GROCERIES           43.10
SUBTOTAL                 79.07
TAX                       5.13
TOTAL                   $84.20
VISA **** 4021  APPROVED
Thank you for shopping with us
`;

describe("parseMoneyToken", () => {
  it("handles US, EU and thousands-only formats", () => {
    expect(parseMoneyToken("84.20")).toBe(84.2);
    expect(parseMoneyToken("1,234.56")).toBe(1234.56);
    expect(parseMoneyToken("23,45")).toBe(23.45);
    expect(parseMoneyToken("1.234,56")).toBe(1234.56);
    expect(parseMoneyToken("12,500")).toBe(12500);
    expect(parseMoneyToken("12.500")).toBe(12500);
    expect(parseMoneyToken("7")).toBe(7);
  });
});

describe("parseReceiptText", () => {
  it("reads a US grocery receipt", () => {
    const r = parseReceiptText(WHOLE_FOODS, { today: TODAY, categories: cats, ocrConfidence: 88 });
    expect(r.is_receipt).toBe(true);
    expect(r.merchant_name).toBe("Whole Foods Market");
    expect(r.amount).toBe(84.2);
    expect(r.currency).toBe("USD");
    expect(r.transaction_date).toBe("2026-09-07");
    expect(r.category_id).toBe("c-groc");
    expect(r.payment_method).toBe("Visa •••• 4021");
    expect(r.items?.map((i) => i.name)).toEqual(["Organic Bananas", "Oat Milk", "Sourdough Loaf", "Salmon Fillet", "Misc Groceries"]);
    expect(r.items?.[3].amount).toBe(18.99);
    expect(r.uncertain_fields).not.toContain("amount");
    expect(r.uncertain_fields).not.toContain("transaction_date");
    expect((r.confidence as number) > 0.8).toBe(true);
  });

  it("prefers the grand total over subtotal and tip on a cafe receipt", () => {
    const text = `Blue State Coffee
84 Thayer St
Table 4   Server: Ana
Latte            4.50
Bagel            3.25
Subtotal        7.75
Tip             2.00
Total          9.75
Sep 8, 2026 9:12 AM
Paid by Apple Pay`;
    const r = parseReceiptText(text, { today: TODAY, categories: cats });
    expect(r.amount).toBe(9.75);
    expect(r.merchant_name).toBe("Blue State Coffee");
    expect(r.transaction_date).toBe("2026-09-08");
    expect(r.category_id).toBe("c-dine");
    expect(r.payment_method).toBe("Apple Pay");
    expect(r.uncertain_fields).toContain("currency"); // no symbol printed
  });

  it("handles European decimals and day-first dates", () => {
    const text = `Bäckerei Müller
Hauptstraße 12
07.09.2026 08:15
Brezel            1,20
Kaffee            2,80
Gesamt        4,00 EUR
MwSt 7%          0,26
Danke für Ihren Einkauf`;
    const r = parseReceiptText(text, { today: TODAY, defaultCurrency: "EUR" });
    expect(r.amount).toBe(4);
    expect(r.currency).toBe("EUR");
    expect(r.transaction_date).toBe("2026-09-07");
    expect(r.category).toBe("Dining"); // bakery keyword, no user categories → bucket label
    expect(r.category_id).toBeNull();
  });

  it("handles zero-decimal currencies with thousands separators", () => {
    const text = `SIMBA SUPERMARKET
KN 4 Ave, Kigali
Date: 2026-09-05
Rice 5kg          RWF 6,500
Cooking oil       RWF 6,000
TOTAL             RWF 12,500
MTN Mobile Money`;
    const r = parseReceiptText(text, { today: TODAY, defaultCurrency: "RWF", categories: cats });
    expect(r.amount).toBe(12500);
    expect(r.currency).toBe("RWF");
    expect(r.transaction_date).toBe("2026-09-05");
    expect(r.merchant_name).toBe("Simba Supermarket");
    expect(r.category_id).toBe("c-groc");
    expect(r.payment_method).toMatch(/Mtn|Mobile Money/);
  });

  it("falls back to the largest amount when no total keyword exists, and flags it", () => {
    const text = `Shell
Pump 4 Regular
12.345 gal
$45.67
09/01/26`;
    const r = parseReceiptText(text, { today: TODAY, categories: cats });
    expect(r.amount).toBe(45.67);
    expect(r.uncertain_fields).toContain("amount");
    expect(r.transaction_date).toBe("2026-09-01");
    expect(r.category_id).toBe("c-trans");
  });

  it("rejects future dates and non-receipt text", () => {
    const r = parseReceiptText("Meeting notes\nDiscuss roadmap 12/25/2026\nAction items", { today: TODAY });
    expect(r.is_receipt).toBe(false);
    expect(r.amount).toBeNull();
    expect(r.transaction_date).toBeNull();
  });
});
