export const USER_ID = "11111111-1111-4111-8111-111111111111";

export function sessionUser() {
  return { id: USER_ID, aud: "authenticated", role: "authenticated", email: "don@example.com", email_confirmed_at: "2026-01-12T00:00:00Z", app_metadata: { provider: "google", providers: ["google"] }, user_metadata: { full_name: "Don Iriho", avatar_url: null }, created_at: "2026-01-12T00:00:00Z", last_sign_in_at: new Date(Date.now() - 86400e3).toISOString(), updated_at: new Date().toISOString(), identities: [] };
}

export function session() {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER_ID, role: "authenticated", aud: "authenticated", exp, email: "don@example.com" })}.sig`;
  return { access_token: token, token_type: "bearer", expires_in: 3600 * 24 * 30, expires_at: exp, refresh_token: "mock-refresh", user: sessionUser() };
}
