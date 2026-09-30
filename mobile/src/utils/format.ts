/**
 * Currency / number formatter — mirrors frontend/src/lib/theme.ts `fmt`.
 */

export function fmt(n: number): string {
  return n.toLocaleString('vi-VN') + '₫';
}

/**
 * Relative time formatter — kept simple (V1). For more elaborate formatting,
 * swap in `date-fns` (already used by the web app).
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString('vi-VN');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
}

/**
 * Deterministic positive 31-bit hash from id string.
 * Mirrors hashId in frontend/src/lib/adapters.ts so the same MongoDB _id
 * produces the same numeric id across web and mobile.
 */
export function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}