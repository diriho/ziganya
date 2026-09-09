# SDK

Everything that talks to Supabase lives here so UI components never import the client directly.

| Folder      | What it holds                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `db/`       | `dbClient` (typed Supabase client), generated `database.types.ts`, hand-written aliases in `types.ts` |
| `auth/`     | Sign-in / sign-up / sign-out / delete-account, `AuthProvider`, `useAuth()`, `useCurrentUser()`        |
| `storage/`  | Receipt uploads to the `receipts` bucket + `uploads` row                                              |
| `requests/` | TanStack Query hooks per table (`useTransactions`, `useSubscriptions`, `useBudgets`, …)               |

Conventions

- Every hook takes `userId` first and scopes the query with `.eq("user_id", userId)`; mutations always set `user_id` server-side of the payload so callers cannot change ownership.
- Query keys start with the table name and `userId` (e.g. `["transactions", userId, ...]`) so `invalidateQueries({ queryKey: ["transactions", userId] })` refreshes every view of that table.
- Regenerate types with `npm run db:types` (needs `SUPABASE_PROJECT_ID`). Do not hand-edit `database.types.ts`; put aliases in `db/types.ts`.
