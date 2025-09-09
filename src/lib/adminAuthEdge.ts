// Edge-compatible verification for admin session tokens
// Uses Web Crypto API (HMAC-SHA-256) available in middleware/edge runtime

export async function verifySessionTokenEdge(token?: string | null): Promise<boolean> {
  try {
    if (!token) return false;
    const [data, sig] = token.split('.') as [string, string];
    if (!data || !sig) return false;
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    const expected = toBase64Url(new Uint8Array(signature));
    if (!timingSafeEqual(sig, expected)) return false;

    const json = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload || typeof payload.exp !== 'number') return false;
    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec <= payload.exp;
  } catch {
    return false;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

