import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';

type SessionPayload = {
  sub: string; // username
  iat: number; // issued at (seconds)
  exp: number; // expiry (seconds)
  nonce: string;
};

function getSecret(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET or NEXTAUTH_SECRET');
  }
  return Buffer.from(secret, 'utf8');
}

function b64url(input: Buffer | string): string {
  const b64 = (Buffer.isBuffer(input) ? input : Buffer.from(input))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return b64;
}

function hmac(data: string, key: Buffer): string {
  return b64url(crypto.createHmac('sha256', key).update(data).digest());
}

export function createSessionToken(username: string, ttlSeconds = 60 * 60 * 6): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: nowSec,
    exp: nowSec + ttlSeconds,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const json = JSON.stringify(payload);
  const data = b64url(Buffer.from(json));
  const sig = hmac(data, getSecret());
  return `${data}.${sig}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [data, sig] = token.split('.') as [string, string];
  if (!data || !sig) return null;
  const expected = hmac(data, getSecret());
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.exp !== 'number') return null;
    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

