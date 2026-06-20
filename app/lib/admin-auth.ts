import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "appsale_admin";
const sessionMaxAge = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSession() {
  const expiresAt = Date.now() + sessionMaxAge * 1000;
  const payload = String(expiresAt);

  return `${payload}.${sign(payload)}`;
}

export function isAdminSession(value?: string) {
  const secret = getSecret();
  if (!secret || !value) return false;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || Number(payload) < Date.now()) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function getAdminCookieName() {
  return cookieName;
}

export function getAdminSessionMaxAge() {
  return sessionMaxAge;
}
