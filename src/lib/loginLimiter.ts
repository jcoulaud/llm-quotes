type Entry = {
  count: number;
  resetAt: number; // epoch ms
};

// Simple in-memory IP limiter (best-effort; resets per instance)
const store = new Map<string, Entry>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 20; // per window

export function checkLoginLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    const fresh: Entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, fresh);
    return { allowed: true, remaining: MAX_ATTEMPTS, resetAt: fresh.resetAt };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, resetAt: entry.resetAt };
}

export function recordLoginAttempt(ip: string) {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

