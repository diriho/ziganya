/**
 * App-wide constants. Prefer this over repeating env access across pages.
 */

export const CURRENT_USER_ID = import.meta.env.VITE_TEST_USER ?? "";
export const USERID = import.meta.env.VITE_USER_ID ?? "";