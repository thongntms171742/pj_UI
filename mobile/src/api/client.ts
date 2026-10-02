/**
 * Thin fetch wrapper that:
 *   - prepends /api to the base URL
 *   - injects JWT from AsyncStorage when present
 *   - parses JSON
 *   - throws ApiError with a useful message on non-2xx
 *
 * Mirrors frontend/src/lib/api.ts so porting call sites is 1:1.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

function resolveBaseUrl(): string {
  // EXPO_PUBLIC_* vars are inlined at build time by Expo.
  let url = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  if (!url) {
    // Fallback to app.json extra (works in dev)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appJson = require('../../app.json');
    url = (appJson?.expo?.extra?.apiUrl || '').trim();
  }
  // Strip trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);
  return `${url}/api`;
}

const BASE = resolveBaseUrl();
const TOKEN_KEY = 'thriftit_token';
const SESSION_KEY = 'thriftit_session';

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const direct = await AsyncStorage.getItem(TOKEN_KEY);
    if (direct) return direct;
    const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      return parsed?.token || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

interface RequestInitJson extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** When true, swallow non-2xx and return null instead of throwing. */
  softFail?: boolean;
}

async function request<T>(path: string, init: RequestInitJson = {}): Promise<T> {
  const { body, headers, softFail, ...rest } = init;

  const token = await getToken();
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${BASE}${cleanPath}`, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined || body === null
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) {
      await setToken(null);
    }
    let details: unknown = null;
    try {
      details = await res.json();
    } catch {
      try {
        details = await res.text();
      } catch {
        // ignore
      }
    }
    if (softFail) return null as unknown as T;
    let msg = `Request failed (${res.status})`;
    if (details && typeof details === 'object') {
      if ('error' in details) {
        const errVal = (details as { error: unknown }).error;
        msg = typeof errVal === 'string' ? errVal : JSON.stringify(errVal);
      } else if ('message' in details) {
        const msgVal = (details as { message: unknown }).message;
        msg = typeof msgVal === 'string' ? msgVal : JSON.stringify(msgVal);
      } else {
        msg = JSON.stringify(details);
      }
    }
    throw new ApiError(msg, res.status, details);
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// ── Public helpers ──
export const api = {
  get: <T,>(path: string, init?: RequestInitJson) =>
    request<T>(path, { ...init, method: 'GET' }),
  post: <T,>(path: string, body?: unknown, init?: RequestInitJson) =>
    request<T>(path, { ...init, method: 'POST', body }),
  put: <T,>(path: string, body?: unknown, init?: RequestInitJson) =>
    request<T>(path, { ...init, method: 'PUT', body }),
  patch: <T,>(path: string, body?: unknown, init?: RequestInitJson) =>
    request<T>(path, { ...init, method: 'PATCH', body }),
  delete: <T,>(path: string, init?: RequestInitJson) =>
    request<T>(path, { ...init, method: 'DELETE' }),
  baseUrl: BASE,
};

// ── Typed wrappers matching backend response shapes ──

export type ApiProduct = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  condition: number;
  size: string;
  quantity: number;
  status: 'pending' | 'active' | 'reserved' | 'sold' | 'archived';
  reservedUntil?: string | null;
  reservedByOrderId?: string | null;
  coverImage: string;
  views: number;
  likes: number;
  location?: string;
  seller?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerId: {
    _id: string;
    handle: string;
    shopName: string;
    avatarUrl?: string;
    rating?: number;
  };
  categoryId?: { _id: string; name: string; slug: string };
};

export type ApiSeller = {
  _id: string;
  shopName: string;
  handle: string;
  description?: string;
  avatarUrl?: string;
  coverImages: string[];
  rating: number;
  totalTransactions: number;
  totalRevenue?: number;
  commissionRate?: number;
  status?: 'active' | 'pending_approval' | 'suspended';
  // BE 2026-10-03: profile fields forwarded by the Shop screen so we
  // don't need a second roundtrip. All optional — older API versions
  // just won't populate them.
  joinedAt?: string;
  responseRate?: number;
  followers?: number;
};

export type ApiCartItem = {
  _id: string;
  cartId: string;
  productId: ApiProduct;
  quantity: number;
  priceSnapshot: number;
  checked: boolean;
};

export type ApiOrderItem = {
  productId: string;
  sellerId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  conditionSnapshot?: number;
  sellerAmount: number;
};

export type ApiOrderStatusEvent = {
  status: string;
  by: string;
  at: string;
  reason?: string;
};

export type ApiOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PACKING'
  | 'SHIPPING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCEL_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export type ApiOrder = {
  _id: string;
  orderCode: string;
  buyerId: string;
  items: ApiOrderItem[];
  subtotal: number;
  shippingFee: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  sellerAmount: number;
  discount: number;
  totalAmount: number;
  status: ApiOrderStatus;
  statusHistory?: ApiOrderStatusEvent[];
  paymentMethod?: string;
  paymentId?: string;
  paidAt?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  /** BE 2026-10-03: address snapshot (province/commune ids + names) so the
   * historical record of an order does not change when CAS data updates. */
  shippingProvinceId?: string;
  shippingProvinceName?: string;
  shippingCommuneId?: string;
  shippingCommuneName?: string;
  /** Effective date used when resolving the snapshot (CAS proxy). */
  addressEffectiveDate?: string;
  trackingNumber?: string;
  shippingProvider?: string;
  idempotencyKey?: string;
  cancelReason?: string;
  cancelRequestedAt?: string;
  createdAt: string;
};

export type ApiNotification = {
  _id: string;
  userId: string;
  type: 'order' | 'chat' | 'promo' | 'system' | 'review';
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
};

export type ApiSessionUser = {
  id: string;
  email: string;
  name: string;
  roles: ('buyer' | 'seller' | 'admin')[];
};