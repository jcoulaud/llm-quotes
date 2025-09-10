const STORAGE_KEY = 'favorite_quotes_v1';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getFavoriteSet(): Set<string> {
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

export function getFavorites(): string[] {
  return Array.from(getFavoriteSet());
}

function persist(set: Set<string>): void {
  const ls = getStorage();
  if (!ls) return;
  ls.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  // Notify listeners within this tab
  try {
    const event = new CustomEvent('favorites-changed', { detail: Array.from(set) });
    window.dispatchEvent(event);
  } catch {
    // noop
  }
}

export function isFavorite(slug: string): boolean {
  return getFavoriteSet().has(slug);
}

export function addFavorite(slug: string): void {
  const set = getFavoriteSet();
  if (!set.has(slug)) {
    set.add(slug);
    persist(set);
  }
}

export function removeFavorite(slug: string): void {
  const set = getFavoriteSet();
  if (set.delete(slug)) {
    persist(set);
  }
}

export function toggleFavorite(slug: string): boolean {
  const set = getFavoriteSet();
  let nowFav = false;
  if (set.has(slug)) {
    set.delete(slug);
    nowFav = false;
  } else {
    set.add(slug);
    nowFav = true;
  }
  persist(set);
  return nowFav;
}

export function clearFavorites(): void {
  const ls = getStorage();
  if (!ls) return;
  ls.removeItem(STORAGE_KEY);
  try {
    const event = new CustomEvent('favorites-changed', { detail: [] });
    window.dispatchEvent(event);
  } catch {}
}

export function onFavoritesChange(handler: (slugs: string[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => {
    const ce = e as CustomEvent<string[]>;
    handler(ce.detail || getFavorites());
  };
  window.addEventListener('favorites-changed', listener as EventListener);
  return () => window.removeEventListener('favorites-changed', listener as EventListener);
}

