import type { Transaction } from "@sdk/db";

function escapeCsv(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\r\n");
}

export function transactionsToCsv(transactions: Transaction[], categoryNames: Map<string, string> = new Map()): string {
  const headers = ["Date", "Type", "Merchant", "Category", "Amount", "Currency", "Source", "Description", "Notes", "Verified"];
  const rows = transactions.map((t) => [
    t.transaction_date?.slice(0, 10) ?? "",
    t.type ?? "",
    t.merchant_name ?? "",
    t.category_id ? categoryNames.get(t.category_id) ?? "" : "",
    Number(t.amount).toFixed(2),
    t.currency ?? "USD",
    t.source ?? "",
    t.description ?? "",
    t.notes ?? "",
    t.is_verified ? "yes" : "no",
  ]);
  return toCsv(headers, rows);
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["﻿", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
