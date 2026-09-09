/**
 * Convenience aliases over the generated Supabase types.
 * Keep hand-written aliases here so `npm run db:types` can overwrite
 * `database.types.ts` without losing them.
 */
import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];

export type Transaction = Tables["transactions"]["Row"];
export type TransactionInsert = Tables["transactions"]["Insert"];
export type TransactionUpdate = Tables["transactions"]["Update"];

export type Category = Tables["categories"]["Row"];
export type CategoryInsert = Tables["categories"]["Insert"];

export type Merchant = Tables["merchants"]["Row"];
export type MerchantInsert = Tables["merchants"]["Insert"];

export type Subscription = Tables["subscriptions"]["Row"];
export type SubscriptionInsert = Tables["subscriptions"]["Insert"];
export type SubscriptionUpdate = Tables["subscriptions"]["Update"];

export type Budget = Tables["budgets"]["Row"];
export type BudgetInsert = Tables["budgets"]["Insert"];
export type BudgetUpdate = Tables["budgets"]["Update"];

export type Upload = Tables["uploads"]["Row"];
export type UploadInsert = Tables["uploads"]["Insert"];

export type UserRow = Tables["users"]["Row"];
export type UserInsert = Tables["users"]["Insert"];
export type UserUpdate = Tables["users"]["Update"];

export type { User, Session } from "@supabase/supabase-js";
export type { Database };
