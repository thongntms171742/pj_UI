/**
 * AddressContext — global state for the buyer's address book.
 *
 * Behaviour (mirrors `App.tsx` `addresses` + `refreshAddresses` in the web):
 *   - Hydrate from `GET /api/users/me/addresses` whenever the user has a
 *     session. Cleared on logout.
 *   - Expose `defaultAddress` (memoized) so CheckoutScreen can auto-fill
 *     name/phone/address without a second lookup.
 *   - `addAddress` / `updateAddress` / `removeAddress` / `setDefault` do
 *     optimistic local updates + backend PATCH/POST/DELETE; on failure
 *     they re-throw and surface a toast.
 *
 * Scope: BE 2026-10-03 (CAS Address Kit proxy + address snapshot fields).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addressApi, type ApiAddressInput } from '../api/endpoints';
import { ApiError } from '../api/client';
import { adaptAddress } from '../adapters';
import { STORAGE_KEYS, setStoredJSON } from '../utils/storage';
import type { Address } from '../types';
import { useAuth } from './AuthContext';

interface AddressContextValue {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  defaultAddress: Address | null;
  refresh: () => Promise<void>;
  addAddress: (input: ApiAddressInput) => Promise<Address | null>;
  updateAddress: (
    id: string,
    patch: Partial<ApiAddressInput>,
  ) => Promise<Address | null>;
  removeAddress: (id: string) => Promise<boolean>;
  setDefault: (id: string) => Promise<Address | null>;
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const { session, showToast } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session?.token) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await addressApi.list();
      const list = (res.addresses || []).map(adaptAddress);
      setAddresses(list);
      // Persist a thin shadow so a hot reload doesn't blank the list.
      await setStoredJSON(STORAGE_KEYS.addresses, list);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Không tải được sổ địa chỉ';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  // Hydrate whenever a session becomes available; clear on logout.
  useEffect(() => {
    if (session?.token) {
      refresh();
    } else {
      setAddresses([]);
    }
  }, [session?.token, refresh]);

  const defaultAddress = useMemo<Address | null>(() => {
    const explicit = addresses.find((a) => a.isDefault);
    return explicit ?? addresses[0] ?? null;
  }, [addresses]);

  const addAddress = useCallback(
    async (input: ApiAddressInput): Promise<Address | null> => {
      try {
        const res = await addressApi.create(input);
        const created = adaptAddress(res.address);
        setAddresses((prev) => {
          // If the new one is default, demote the previous default locally
          // so the UI is consistent before the next refresh.
          const next = created.isDefault
            ? prev.map((a) => ({ ...a, isDefault: false }))
            : prev.slice();
          // Keep the list sorted with default first for readability.
          const updated = [...next, created];
          return updated.sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
          );
        });
        return created;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Không thể thêm địa chỉ';
        showToast(`⚠️ ${msg}`);
        return null;
      }
    },
    [showToast],
  );

  const updateAddress = useCallback(
    async (id: string, patch: Partial<ApiAddressInput>): Promise<Address | null> => {
      try {
        const res = await addressApi.update(id, patch);
        const updated = adaptAddress(res.address);
        setAddresses((prev) =>
          prev.map((a) => (a.id === id ? updated : updated.isDefault ? { ...a, isDefault: false } : a)),
        );
        return updated;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Không thể cập nhật địa chỉ';
        showToast(`⚠️ ${msg}`);
        return null;
      }
    },
    [showToast],
  );

  const removeAddress = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await addressApi.remove(id);
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        return true;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Không thể xóa địa chỉ';
        showToast(`⚠️ ${msg}`);
        return false;
      }
    },
    [showToast],
  );

  /**
   * Promote an address to default. BE accepts `isDefault: true` via PATCH;
   * the controller should clear the flag elsewhere — but if it doesn't, we
   * also patch the previous default to `false` to keep local state
   * consistent.
   */
  const setDefault = useCallback(
    async (id: string): Promise<Address | null> => {
      const prev = addresses;
      // Optimistic local flip so the UI feels instant.
      setAddresses((cur) =>
        cur.map((a) => ({ ...a, isDefault: a.id === id })),
      );
      try {
        await addressApi.update(id, { isDefault: true });
        // Refresh in background to reconcile with the canonical BE state.
        refresh();
        return prev.find((a) => a.id === id) ?? null;
      } catch (e) {
        // Roll back on failure.
        setAddresses(prev);
        const msg = e instanceof ApiError ? e.message : 'Không thể đặt mặc định';
        showToast(`⚠️ ${msg}`);
        return null;
      }
    },
    [addresses, refresh, showToast],
  );

  const value = useMemo<AddressContextValue>(
    () => ({
      addresses,
      loading,
      error,
      defaultAddress,
      refresh,
      addAddress,
      updateAddress,
      removeAddress,
      setDefault,
    }),
    [
      addresses,
      loading,
      error,
      defaultAddress,
      refresh,
      addAddress,
      updateAddress,
      removeAddress,
      setDefault,
    ],
  );

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}

export function useAddress(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddress must be used within AddressProvider');
  return ctx;
}