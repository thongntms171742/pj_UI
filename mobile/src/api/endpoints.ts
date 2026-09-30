/**
 * Typed endpoint helpers — thin wrappers over `api` that enforce types and
 * centralize the URLs. Prefer these over raw `api.get('/...')` calls where
 * practical.
 */
import { api, ApiProduct, ApiSeller, ApiCartItem, ApiOrder, ApiNotification, ApiSessionUser } from './client';

// ── Auth ──
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: ApiSessionUser & { avatarUrl?: string; sellerStatus?: string } }>(
      '/auth/register',
      data,
    ),
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: ApiSessionUser & { avatarUrl?: string; sellerStatus?: string } }>(
      '/auth/login',
      data,
    ),
  updateAvatar: (avatarUrl: string) =>
    api.put<{ avatarUrl: string }>('/auth/me/avatar', { avatarUrl }),
  applySeller: (data: { shopName: string; description?: string }) =>
    api.post<{ user: ApiSessionUser }>('/auth/seller/apply', data),
};

// ── Products ──
export const productApi = {
  list: (params?: { status?: string; category?: string; seller?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.seller) qs.set('seller', params.seller);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return api.get<{ products: ApiProduct[] }>(`/products${suffix}`);
  },
  byId: (id: string) => api.get<{ product: ApiProduct }>(`/products/${id}`),
  reviews: (id: string) => api.get<{ reviews: unknown[] }>(`/products/${id}/reviews`),
  createReview: (
    id: string,
    data: { rating: number; comment?: string; orderId: string },
  ) => api.post<{ review: { _id: string; productId: string; buyerId: string; orderId: string; rating: number; comment: string; createdAt: string } }>(`/products/${id}/reviews`, data),
  mine: () => api.get<{ products: ApiProduct[] }>('/products/mine'),
};

// ── Sellers ──
export const sellerApi = {
  list: () => api.get<{ sellers: ApiSeller[] }>('/sellers'),
  byHandle: (handle: string) => api.get<{ seller: ApiSeller }>(`/sellers/${handle}`),
  products: (handle: string) =>
    api.get<{ products: ApiProduct[] }>(`/sellers/${handle}/products`),
  reviews: (handle: string) =>
    api.get<{ reviews: unknown[] }>(`/sellers/${handle}/reviews`),
};

// ── Cart ──
export const cartApi = {
  get: () => api.get<{ cart: unknown; items: ApiCartItem[] }>('/cart'),
  addItem: (productId: string, quantity: number) =>
    api.post<{ item: ApiCartItem }>('/cart/items', { productId, quantity }),
  updateItem: (
    itemId: string,
    patch: { quantity?: number; checked?: boolean },
  ) => api.patch<{ item: ApiCartItem }>(`/cart/items/${itemId}`, patch),
  deleteItem: (itemId: string) => api.delete<{ ok: true }>(`/cart/items/${itemId}`),
  clear: () => api.delete<{ ok: true }>('/cart/clear'),
  merge: (items: { productId: string; quantity: number }[]) =>
    api.post<{ items: ApiCartItem[] }>('/cart/merge', { items }),
};

// ── Orders ──
export const orderApi = {
  list: () => api.get<{ orders: ApiOrder[] }>('/orders'),
  seller: () => api.get<{ orders: ApiOrder[] }>('/orders/seller'),
  byCode: (code: string) => api.get<{ order: ApiOrder }>(`/orders/${code}`),
  create: (data: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    idempotencyKey: string;
    items: { productId: string; quantity: number }[];
  }) => api.post<{ order: ApiOrder }>('/orders', data),
  updateStatus: (code: string, status: string, reason?: string) =>
    api.patch<{ order: ApiOrder }>(`/orders/${code}/status`, { status, reason }),
  shipment: (code: string) =>
    api.get<{ shipment: unknown }>(`/orders/${code}/shipment`),
};

// ── Payments ──
export const paymentApi = {
  checkout: (data: { orderId: string; method: string; cardLast4?: string }) =>
    api.post<{ order: ApiOrder }>('/payments/checkout', data),
};

// ── Notifications ──
export const notificationApi = {
  list: () => api.get<{ notifications: ApiNotification[] }>('/notifications'),
  markRead: (id: string) => api.patch<{ ok: true }>(`/notifications/${id}/read`),
};