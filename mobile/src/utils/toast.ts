/**
 * Global toast utility.
 *
 * The codebase already has a toast via `useAuth().showToast`, but that
 * requires being inside AuthProvider. This module provides a free function
 * that any screen (including those without access to AuthContext) can call.
 *
 * It is intentionally lightweight — just a singleton setter that the
 * <GlobalToast /> renderer in RootNavigator subscribes to.
 *
 * Usage:
 *   import { showToast } from '../utils/toast';
 *   showToast('✓ Đã lưu');
 */

type Listener = (msg: string) => void;

let current: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

export function showToast(msg: string, durationMs = 3000): void {
  current = msg;
  listeners.forEach((l) => l(msg));
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    listeners.forEach((l) => l(''));
  }, durationMs);
}

export function subscribeToast(l: Listener): () => void {
  listeners.add(l);
  if (current) l(current);
  return () => {
    listeners.delete(l);
  };
}

export function getCurrentToast(): string | null {
  return current;
}