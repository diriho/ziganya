// Minimal PostgREST / GoTrue / Storage look-alike with seeded demo data.
// Lets you run the UI without a Supabase project: `npm run dev:mock`, then sign in
// with ANY email/password. Data lives in memory and resets on restart.
import http from "node:http";
import { URL } from "node:url";
import { USER_ID, session, sessionUser } from "./session.mjs";

const PORT = Number(process.env.MOCK_PORT ?? 54321);

// ---- deterministic PRNG ----
let seed = 20260908;
const rnd = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = Math.floor(rnd() * 16); return (c === "x" ? r : (r & 3) | 8).toString(16); });
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = new Date(); today.setHours(0, 0, 0, 0);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ---- seed ----
const categories = ["Groceries", "Dining", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health"].map((name) => ({
  id: uuid(), name, color: null, icon: null, is_default: true, user_id: null, created_at: "2026-01-01T00:00:00Z",
}));
const cat = (n) => categories.find((c) => c.name === n).id;
const merchants = {
  Groceries: ["Whole Foods", "Trader Joe's", "Stop & Shop"],
  Dining: ["Blue State Coffee", "Chipotle", "Den Den", "Bagel Gourmet"],
  Transport: ["RIPTA", "Uber", "Shell"],
  Utilities: ["National Grid", "Verizon"],
  Entertainment: ["AMC Theatres", "Steam", "Bandcamp"],
  Shopping: ["Amazon", "Target", "Uniqlo"],
  Health: ["CVS Pharmacy", "Brown Health"],
};
const ranges = { Groceries: [18, 140], Dining: [4, 48], Transport: [2, 60], Utilities: [40, 160], Entertainment: [8, 60], Shopping: [12, 220], Health: [6, 90] };

const transactions = [];
const pushTx = (d, over) => transactions.push({
  id: uuid(), user_id: USER_ID, transaction_date: key(d), created_at: `${key(d)}T12:00:00Z`, currency: "USD",
  is_verified: true, confidence: null, merchant_id: null, notes: null, description: null, category_id: null, type: "expense", source: "manual", amount: 0, merchant_name: null, ...over,
});
for (let i = 200; i >= 0; i--) {
  const d = addDays(today, -i);
  if (d.getDate() === 1) {
    pushTx(d, { type: "income", amount: 3200, merchant_name: "Employer Inc.", source: "bank_transfer" });
    pushTx(d, { amount: 1400, merchant_name: "Landlord", category_id: cat("Rent"), source: "bank_transfer" });
  }
  if (d.getDate() === 15) pushTx(d, { type: "income", amount: 3200, merchant_name: "Employer Inc.", source: "bank_transfer" });
  const n = rnd() < 0.25 ? 0 : rnd() < 0.6 ? 1 : rnd() < 0.85 ? 2 : 3;
  for (let k = 0; k < n; k++) {
    const c = pick(["Groceries", "Dining", "Dining", "Transport", "Entertainment", "Shopping", "Health", "Utilities"]);
    const [lo, hi] = ranges[c];
    const weekendBoost = d.getDay() === 0 || d.getDay() === 6 ? 1.35 : 1;
    pushTx(d, { amount: Math.round((lo + rnd() * (hi - lo)) * weekendBoost * 100) / 100, merchant_name: pick(merchants[c]), category_id: cat(c), source: pick(["manual", "receipt", "credit_card", "screenshot"]) });
  }
}
// a couple of uncategorized ones
pushTx(addDays(today, -2), { amount: 23.5, merchant_name: "Farmers Market", source: "cash" });

const sub = (name, amount, cycle, next, status = "active") => ({ id: uuid(), user_id: USER_ID, name, amount, billing_cycle: cycle, next_billing_date: key(next), status, currency: "USD", billing_day: null, category_id: null, merchant_id: null, created_at: "2026-02-01T00:00:00Z" });
const subscriptions = [
  sub("Netflix", 15.99, "monthly", addDays(today, 2)),
  sub("iCloud+", 2.99, "monthly", addDays(today, 1)),
  sub("Spotify", 9.99, "monthly", addDays(today, 4)),
  sub("NYT", 4, "weekly", addDays(today, 3)),
  sub("Planet Fitness", 24.99, "monthly", addDays(today, 12)),
  sub("Adobe CC", 239.88, "yearly", addDays(today, 56)),
  sub("Renters insurance", 42, "quarterly", addDays(today, 23)),
  sub("HBO Max", 15.99, "monthly", addDays(today, -40), "cancelled"),
];
const budgets = [{ id: uuid(), user_id: USER_ID, amount: 2500, period: "monthly", category_id: null, alert_enabled: true, alert_threshold: 80, created_at: "2026-03-01T00:00:00Z" }];
const users = [{ id: 1, user_id: USER_ID, email: "don@example.com", username: "Don Iriho", total_balance: 12480.5, savings_goal: 20000, created_at: "2026-01-12T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" }];
const uploads = [
  { id: uuid(), user_id: USER_ID, type: "image", file_name: "whole-foods-receipt.jpg", file_path: `${USER_ID}/a.jpg`, status: "processed", error_message: null, raw_text: null, created_at: addDays(today, -1).toISOString() },
  { id: uuid(), user_id: USER_ID, type: "pdf", file_name: "verizon-sept.pdf", file_path: `${USER_ID}/b.pdf`, status: "pending", error_message: null, raw_text: null, created_at: new Date(Date.now() - 3600e3).toISOString() },
];
const tables = { transactions, subscriptions, budgets, users, uploads, categories, merchants: [] };

// ---- PostgREST-ish filtering ----
function matches(row, params) {
  for (const [k, v] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
    if (k === "or") {
      const parts = v.slice(1, -1).split(",");
      if (!parts.some((p) => { const [col, op, ...rest] = p.split("."); return cmp(row[col], op, rest.join(".")); })) return false;
      continue;
    }
    const [op, ...rest] = v.split(".");
    if (!cmp(row[k], op, rest.join("."))) return false;
  }
  return true;
}
function cmp(a, op, b) {
  switch (op) {
    case "eq": return String(a) === b;
    case "neq": return String(a) !== b;
    case "gte": return a != null && String(a) >= b;
    case "lte": return a != null && String(a) <= b;
    case "gt": return a != null && String(a) > b;
    case "lt": return a != null && String(a) < b;
    case "is": return b === "null" ? a == null : String(a) === b;
    case "in": return b.slice(1, -1).split(",").map((s) => s.replace(/^"|"$/g, "")).includes(String(a));
    default: return true;
  }
}
function applyOrderLimit(rows, params) {
  const order = params.get("order");
  if (order) {
    const specs = order.split(",").map((s) => s.split("."));
    rows.sort((x, y) => {
      for (const [col, dir] of specs) {
        const a = x[col], b = y[col];
        if (a === b) continue;
        if (a == null) return 1; if (b == null) return -1;
        const r = a < b ? -1 : 1;
        return dir === "desc" ? -r : r;
      }
      return 0;
    });
  }
  const offset = Number(params.get("offset") ?? 0);
  const limit = params.get("limit") ? Number(params.get("limit")) : rows.length;
  return rows.slice(offset, offset + limit);
}

const send = (res, status, body, extra = {}) => {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS,HEAD",
    "Access-Control-Expose-Headers": "*",
    "Content-Type": "application/json",
    ...extra,
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
};
// Reads a JSON body; binary or malformed bodies resolve to null instead of crashing the server.
const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      if (!text) return resolve(null);
      try { resolve(JSON.parse(text)); } catch { resolve(null); }
    });
    req.on("error", () => resolve(null));
  });

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "OPTIONS") return send(res, 204);
  const wantsObject = (req.headers.accept ?? "").includes("pgrst.object");
  const log = `${req.method} ${url.pathname}${url.search}`;

  if (url.pathname.startsWith("/auth/v1/user")) return send(res, 200, sessionUser());
  if (url.pathname.startsWith("/auth/v1/token") || url.pathname.startsWith("/auth/v1/signup")) {
    await readBody(req).catch(() => null);
    return send(res, 200, session());
  }
  if (url.pathname.startsWith("/auth/v1/logout")) return send(res, 204);
  if (url.pathname.startsWith("/auth/v1/authorize")) {
    // Behave like GoTrue when a provider is misconfigured: bounce back to the app with an error.
    const back = url.searchParams.get("redirect_to") ?? "http://localhost:5173/";
    const params = new URLSearchParams({ error: "server_error", error_code: "provider_disabled", error_description: "Unsupported provider: provider is not enabled (mock mode — use email sign-in)" });
    res.writeHead(302, { Location: `${back}#${params.toString()}`, "Access-Control-Allow-Origin": "*" });
    return res.end();
  }
  if (url.pathname.startsWith("/functions/v1/extract-receipt")) {
    const body = (await readBody(req).catch(() => null)) ?? {};
    await new Promise((r) => setTimeout(r, 1200)); // feel like a real model call
    const groceries = categories.find((c) => c.name === "Groceries");
    if (body.uploadId) {
      const u = uploads.find((x) => x.id === body.uploadId);
      if (u) { u.status = "processed"; u.raw_text = JSON.stringify({ mock: true }); }
    }
    return send(res, 200, {
      extraction: {
        is_receipt: true,
        merchant_name: "Whole Foods Market",
        amount: 84.2,
        currency: body.defaultCurrency ?? "USD",
        transaction_date: key(addDays(today, -1)),
        category: "Groceries",
        category_id: groceries?.id ?? null,
        payment_method: "Visa •••• 4021",
        items: [{ name: "Organic bananas", amount: 3.49 }, { name: "Oat milk", amount: 5.99 }, { name: "Sourdough loaf", amount: 7.5 }, { name: "Salmon fillet", amount: 18.99 }],
        confidence: 0.91,
        uncertain_fields: ["transaction_date"],
        notes: "Mock extraction (dev only)",
      },
      model: "mock",
      usage: { input_tokens: 0, output_tokens: 0 },
    });
  }
  if (url.pathname.startsWith("/storage/v1/object/")) {
    await readBody(req).catch(() => null);
    return send(res, 200, { Key: url.pathname.replace("/storage/v1/object/", ""), Id: uuid() });
  }
  const m = url.pathname.match(/^\/rest\/v1\/(\w+)$/);
  if (!m) { console.log("404", log); return send(res, 404, { message: "not found" }); }
  const table = m[1];
  const rows = tables[table];
  if (!rows) return send(res, 404, { message: `table ${table} missing` });
  console.log(log);

  if (req.method === "GET") {
    const out = applyOrderLimit(rows.filter((r) => matches(r, url.searchParams)), url.searchParams);
    if (wantsObject) return out.length ? send(res, 200, out[0]) : send(res, 406, { code: "PGRST116", details: "The result contains 0 rows", message: "JSON object requested, multiple (or no) rows returned" });
    return send(res, 200, out, { "Content-Range": `0-${Math.max(0, out.length - 1)}/*` });
  }
  if (req.method === "POST") {
    const body = await readBody(req);
    const list = Array.isArray(body) ? body : [body];
    const created = list.map((b) => {
      const existing = url.searchParams.get("on_conflict") ? rows.find((r) => r[url.searchParams.get("on_conflict")] === b[url.searchParams.get("on_conflict")]) : null;
      if (existing) { Object.assign(existing, b); return existing; }
      const row = { id: uuid(), created_at: new Date().toISOString(), ...b };
      rows.push(row); return row;
    });
    return send(res, 201, wantsObject ? created[0] : created);
  }
  if (req.method === "PATCH") {
    const body = await readBody(req);
    const hit = rows.filter((r) => matches(r, url.searchParams));
    hit.forEach((r) => Object.assign(r, body));
    return send(res, 200, wantsObject ? hit[0] ?? null : hit);
  }
  if (req.method === "DELETE") {
    const hit = rows.filter((r) => matches(r, url.searchParams));
    hit.forEach((r) => rows.splice(rows.indexOf(r), 1));
    return send(res, 200, wantsObject ? hit[0] ?? null : hit);
  }
  send(res, 405, { message: "method" });
}).listen(PORT, () => console.log(`[mock] Supabase look-alike on http://localhost:${PORT} — ${transactions.length} transactions, ${subscriptions.length} subscriptions seeded`));
