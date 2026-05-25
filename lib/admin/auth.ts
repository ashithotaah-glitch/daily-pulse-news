import { cookies } from "next/headers";

export const ADMIN_COOKIE = "flashfeed_admin";

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "admin@flashfeed.blog";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSCODE || "";
}

export function getAdminToken() {
  return process.env.ADMIN_SESSION_TOKEN || getAdminPassword();
}

export function credentialsAreValid(email: string, password: string) {
  return Boolean(getAdminToken()) && email.trim().toLowerCase() === getAdminEmail().toLowerCase() && password === getAdminPassword();
}

export async function adminIsAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(getAdminToken()) && cookieStore.get(ADMIN_COOKIE)?.value === getAdminToken();
}
