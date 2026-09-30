/**
 * Shared, in-session "buyer has reviewed this item" store.
 *
 * The backend does not yet expose a per-product "hasReviewed" flag for the
 * current buyer, so we keep a lightweight in-memory cache that survives
 * navigation between screens. Both AccountScreen and OrderDetailScreen read
 * from this cache to decide whether to show the "Đánh giá" button, and
 * ReviewScreen writes to it via the `onReviewed` route callback after a
 * successful POST.
 *
 * Limitations:
 *   - Module-level state only lives for the current JS bundle instance.
 *     Killing and reopening the app resets the cache — the button reappears
 *     but the backend will then reject duplicates with 409 REVIEW_ALREADY_EXISTS
 *     and ReviewScreen surfaces that as a friendly toast.
 *   - For a permanent fix the backend should expose `hasReviewed` (or a
 *     `GET /api/me/reviews?productIds=...` endpoint) so the mobile can
 *     rehydrate the cache on mount.
 */
import { useSyncExternalStore } from 'react';

const keys = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

export const reviewedStore = {
  has(key: string): boolean {
    return keys.has(key);
  },
  add(key: string): void {
    if (keys.has(key)) return;
    keys.add(key);
    notify();
  },
  clear(): void {
    if (keys.size === 0) return;
    keys.clear();
    notify();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return version;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Hook returning whether the given key has been marked as reviewed.
 * Re-renders the consumer whenever the store mutates.
 */
export function useReviewed(key: string | undefined): boolean {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!key) return false;
  return reviewedStore.has(key);
}
