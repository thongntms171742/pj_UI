/**
 * CartContext — single source of truth for cart UI state.
 * Mirrors cartGroups/cartLoading + addOrder logic in web App.tsx.
 *
 * Behaviour:
 *   - On login (session.token changes from null → present): fetch cart
 *     from server, replace local state.
 *   - On logout: clear local cart.
 *   - Mutations: optimistic local update + backend PATCH/POST/DELETE.
 *     Backend is source of truth on next refresh.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi, orderApi, paymentApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { adaptCartItems } from '../adapters';
import { STORAGE_KEYS, setStoredJSON } from '../utils/storage';
import type { CartGroup, OrderItem, Order } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cartGroups: CartGroup[];
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (product: {
    apiId?: string;
    name: string;
    price: number;
    seller: string;
    size: string;
    image: string;
    condition: number;
    quantity: number;
    id: number;
  }, qty?: number) => Promise<void>;
  updateItem: (seller: string, id: number, patch: { qty?: number; checked?: boolean }) => void;
  removeItem: (seller: string, id: number) => void;
  toggleAll: (checked: boolean) => void;
  toggleGroup: (seller: string, checked: boolean) => void;
  clearChecked: () => void;
  placeOrder: (input: {
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    items: OrderItem[];
    total: number;
  }) => Promise<Order | null>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getItemApiId(group: CartGroup, id: number): string | undefined {
  const it = group.items.find((i) => i.id === id);
  return it?.apiId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session, showToast } = useAuth();
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Refresh from server whenever session becomes available
  const refresh = useCallback(async () => {
    if (!session?.token) {
      setCartGroups([]);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.get();
      const { groups } = adaptCartItems(res.items);
      setCartGroups(groups);
      await setStoredJSON(STORAGE_KEYS.cart, groups);
    } catch {
      // best-effort — keep cached state
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Clear cart on logout
  useEffect(() => {
    if (!session) {
      setCartGroups([]);
    }
  }, [session]);

  // ── Optimistic add ──
  const addItem = useCallback(
    async (
      product: {
        apiId?: string;
        name: string;
        price: number;
        seller: string;
        size: string;
        image: string;
        condition: number;
        quantity: number;
        id: number;
      },
      qty = 1,
    ) => {
      let finalApiId = product.apiId;
      if (product.apiId && session?.token) {
        try {
          const res = await cartApi.addItem(product.apiId, qty);
          finalApiId = res.item._id;
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Thêm vào giỏ hàng thất bại';
          showToast(`⚠️ ${msg}`);
          return;
        }
      }

      const stock = product.quantity;
      const productApiId = product.apiId;
      setCartGroups((prev) => {
        const existingGroup = prev.find((g) => g.seller === product.seller);
        if (existingGroup) {
          const existingItem = existingGroup.items.find((i) => i.id === product.id);
          if (existingItem) {
            if (existingItem.qty + qty > stock) {
              showToast(`⚠️ Sản phẩm này chỉ còn ${stock} cái`);
              return prev;
            }
            return prev.map((g) =>
              g.seller === product.seller
                ? {
                    ...g,
                    items: g.items.map((i) =>
                      i.id === product.id
                        ? { ...i, qty: i.qty + qty, apiId: finalApiId, productApiId }
                        : i,
                    ),
                  }
                : g,
            );
          }
          if (qty > stock) {
            showToast(`⚠️ Sản phẩm này chỉ còn ${stock} cái`);
            return prev;
          }
          return prev.map((g) =>
            g.seller === product.seller
              ? {
                  ...g,
                  items: [
                    ...g.items,
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      size: product.size,
                      qty,
                      image: product.image,
                      checked: false,
                      condition: product.condition,
                      apiId: finalApiId,
                      productApiId,
                      stock,
                    },
                  ],
                }
              : g,
          );
        }
        if (qty > stock) {
          showToast(`⚠️ Sản phẩm này chỉ còn ${stock} cái`);
          return prev;
        }
        return [
          ...prev,
          {
            seller: product.seller,
            items: [
              {
                id: product.id,
                name: product.name,
                price: product.price,
                size: product.size,
                qty,
                image: product.image,
                checked: false,
                condition: product.condition,
                apiId: finalApiId,
                productApiId,
                stock,
              },
            ],
          },
        ];
      });

      showToast(`Đã thêm ${qty} x "${product.name}" vào giỏ hàng!`);
    },
    [session?.token, showToast],
  );

  // ── Optimistic update (qty + checked) ──
  const updateItem = useCallback(
    (seller: string, id: number, patch: { qty?: number; checked?: boolean }) => {
      const target = cartGroups.find((g) => g.seller === seller)?.items.find((i) => i.id === id);
      setCartGroups((prev) =>
        prev.map((g) =>
          g.seller !== seller
            ? g
            : {
                ...g,
                items: g.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
              },
        ),
      );
      if (target?.apiId && session?.token) {
        const apiPatch: { quantity?: number; checked?: boolean } = {};
        if (patch.qty !== undefined) apiPatch.quantity = patch.qty;
        if (patch.checked !== undefined) apiPatch.checked = patch.checked;
        cartApi.updateItem(target.apiId, apiPatch).catch(() => {
          // best-effort; rollback via refresh on next mount
        });
      }
    },
    [cartGroups, session?.token],
  );

  const removeItem = useCallback(
    (seller: string, id: number) => {
      const target = cartGroups.find((g) => g.seller === seller)?.items.find((i) => i.id === id);
      setCartGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            items: g.items.filter((i) => !(g.seller === seller && i.id === id)),
          }))
          .filter((g) => g.items.length > 0),
      );
      if (target?.apiId && session?.token) {
        cartApi.deleteItem(target.apiId).catch(() => {
          // best-effort
        });
      }
    },
    [cartGroups, session?.token],
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      setCartGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) => ({ ...i, checked })),
        })),
      );
      if (session?.token) {
        for (const g of cartGroups) {
          for (const i of g.items) {
            if (i.apiId) {
              cartApi.updateItem(i.apiId, { checked }).catch(() => undefined);
            }
          }
        }
      }
    },
    [cartGroups, session?.token],
  );

  const toggleGroup = useCallback(
    (seller: string, checked: boolean) => {
      const group = cartGroups.find((g) => g.seller === seller);
      setCartGroups((prev) =>
        prev.map((g) =>
          g.seller !== seller ? g : { ...g, items: g.items.map((i) => ({ ...i, checked })) },
        ),
      );
      if (group && session?.token) {
        for (const i of group.items) {
          if (i.apiId) {
            cartApi.updateItem(i.apiId, { checked }).catch(() => undefined);
          }
        }
      }
    },
    [cartGroups, session?.token],
  );

  const clearChecked = useCallback(() => {
    const toDelete: string[] = [];
    setCartGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items.filter((i) => {
            if (i.checked && i.apiId) toDelete.push(i.apiId);
            return !i.checked;
          }),
        }))
        .filter((g) => g.items.length > 0),
    );
    if (session?.token) {
      toDelete.forEach((apiId) => {
        cartApi.deleteItem(apiId).catch(() => undefined);
      });
    }
  }, [session?.token]);

  // ── Place order: POST /orders → POST /payments/checkout ──
  const placeOrder = useCallback(
    async (input: {
      fullName: string;
      phone: string;
      address: string;
      paymentMethod: string;
      items: OrderItem[];
      total: number;
    }): Promise<Order | null> => {
      if (!session?.token) {
        showToast('⚠️ Vui lòng đăng nhập để đặt hàng');
        return null;
      }
      const idempotencyKey = `idem-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
      try {
        const res = await orderApi.create({
          shippingName: input.fullName,
          shippingPhone: input.phone,
          shippingAddress: input.address,
          paymentMethod: input.paymentMethod,
          idempotencyKey,
          items: input.items.map((item) => ({
            productId: item.productApiId ?? item.apiId ?? item.id,
            quantity: item.qty,
          })),
        });
        const orderId = res.order.orderCode;
        const orderApiId = res.order._id;
        // Auto-pay (mock) so the state machine advances. V1 always calls
        // /payments/checkout regardless of method; the backend handles COD
        // and card flows identically (mock).
        try {
          await paymentApi.checkout({
            orderId: orderApiId,
            method: input.paymentMethod === 'COD' ? 'COD' : 'card',
            cardLast4: input.paymentMethod === 'COD' ? '' : '0000',
          });
        } catch {
          // Even if checkout fails, the order was created — caller should
          // handle it via toast/redirect.
        }
        // Refresh cart to remove ordered items
        try {
          const fresh = await cartApi.get();
          const { groups } = adaptCartItems(fresh.items);
          setCartGroups(groups);
        } catch {
          // best-effort
        }
        // Build a minimal Order view from the response for the caller
        return {
          id: orderId,
          apiId: orderApiId,
          items: input.items,
          total: input.total,
          status:
            input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PAID',
          createdAt: new Date().toLocaleDateString('vi-VN'),
          paymentMethod: input.paymentMethod,
          shippingName: input.fullName,
          shippingPhone: input.phone,
          shippingAddress: input.address,
        };
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Đặt hàng thất bại';
        showToast(`⚠️ ${msg}`);
        return null;
      }
    },
    [session?.token, showToast],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartGroups,
      loading,
      refresh,
      addItem,
      updateItem,
      removeItem,
      toggleAll,
      toggleGroup,
      clearChecked,
      placeOrder,
    }),
    [
      cartGroups,
      loading,
      refresh,
      addItem,
      updateItem,
      removeItem,
      toggleAll,
      toggleGroup,
      clearChecked,
      placeOrder,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

// Export the helper so screens don't need to recompute
export { getItemApiId };