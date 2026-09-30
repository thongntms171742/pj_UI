/**
 * Custom hooks for data fetching. Each hook owns its loading/error state and
 * exposes a `refresh` callback for pull-to-refresh.
 */
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { productApi, sellerApi, orderApi, notificationApi } from '../api/endpoints';
import { adaptProduct, adaptSeller, adaptOrder, adaptNotification } from '../adapters';
import type { Product, Seller, Order, Notification } from '../types';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Re-fetch every time the screen regains focus so the list stays in sync
  // with mutations performed on a detail screen (status update, review, …).
  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  );

  return { data, loading, error, refresh };
}

// ── Products ──
export function useProducts(params?: { status?: string }): QueryState<Product[]> {
  return useQuery<Product[]>(async () => {
    const res = await productApi.list(params);
    return res.products.map((p) => adaptProduct(p, new Set()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.status]);
}

export function useProduct(id: string | undefined): QueryState<Product> {
  return useQuery<Product>(
    async () => {
      if (!id) throw new Error('Missing id');
      const res = await productApi.byId(id);
      return adaptProduct(res.product, new Set());
    },
    [id],
  );
}

// ── Sellers ──
export function useSellers(): QueryState<Seller[]> {
  return useQuery<Seller[]>(async () => {
    const res = await sellerApi.list();
    return res.sellers.map(adaptSeller);
  }, []);
}

export function useSeller(handle: string | undefined): QueryState<Seller> {
  return useQuery<Seller>(
    async () => {
      if (!handle) throw new Error('Missing handle');
      const res = await sellerApi.byHandle(handle);
      return adaptSeller(res.seller);
    },
    [handle],
  );
}

// ── Orders ──
export function useOrders(): QueryState<Order[]> {
  return useQuery<Order[]>(async () => {
    const res = await orderApi.list();
    return res.orders.map(adaptOrder);
  }, []);
}

// ── Notifications ──
export function useNotifications(): QueryState<Notification[]> {
  return useQuery<Notification[]>(async () => {
    const res = await notificationApi.list();
    return res.notifications.map(adaptNotification);
  }, []);
}