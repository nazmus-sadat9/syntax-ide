import crypto from "crypto";

const EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const MAX_ATTEMPTS = 5;

const codes = new Map();

export function createCode(email) {
  const code = crypto.randomInt(100000, 1000000).toString();
  codes.set(email, { code, expires: Date.now() + EXPIRY_MS, attempts: 0 });
  return code;
}

export function deleteCode(email) {
  codes.delete(email);
}

// verify otp
export function verifyCode(email, code) {
  const entry = codes.get(email);

  if (!entry) return { ok: false, error: "Request a code first" };

  if (Date.now() > entry.expires) {
    codes.delete(email);
    return { ok: false, error: "Code expired. Request a new one." };
  }
  if (++entry.attempts > MAX_ATTEMPTS) {
    codes.delete(email);
    return { ok: false, error: "Too many attempts. Request a new code." };
  }
  if (String(code) !== entry.code) return { ok: false, error: "Wrong code" };

  codes.delete(email);
  return { ok: true };
}
