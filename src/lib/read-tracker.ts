const STORAGE_KEY = 'read_quotes_v1';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getReadSet(): Set<string> {
  const ls = getStorage();
  if (!ls) return new Set();
  const raw = ls.getItem(STORAGE_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function markSeen(slug: string): void {
  const ls = getStorage();
  if (!ls) return;
  const set = getReadSet();
  if (!set.has(slug)) {
    set.add(slug);
    ls.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }
}

export function isSeen(slug: string): boolean {
  return getReadSet().has(slug);
}

// Backward-compatible aliases
export const markRead = markSeen;
export const isRead = isSeen;

export function clearSeen(): void {
  const ls = getStorage();
  if (!ls) return;
  ls.removeItem(STORAGE_KEY);
}
