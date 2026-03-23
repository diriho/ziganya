/**
 * App-wide constants. Prefer this over repeating env access across pages.
 * Don note: update this becauase accross all over the reqeurst that you will be making in the future,
 *  you will be using the same user over and over again
 */

export const CURRENT_USER_ID = import.meta.env.VITE_TEST_USER ?? "";
export const USERID = import.meta.env.VITE_USER_ID ?? "";