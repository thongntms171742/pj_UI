/**
 * useAddressCatalog — hook that loads provinces + communes from the CAS
 * proxy (`GET /api/addresses/provinces` and `GET /api/addresses/communes`)
 * once and exposes them as a `Map<provinceId, ApiCommune[]>` for cheap
 * filtering by the form / picker.
 *
 * Mirrors FE `useAddressCatalog` in
 * `frontend/src/components/common/AddressBook.tsx`. No in-memory cache here
 * because React already keeps the result alive across renders; refetch
 * only happens when the consumer calls `refresh()`.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addressCatalogApi, type ApiCommune, type ApiProvince } from '../api/endpoints';
import { ApiError } from '../api/client';

export interface AddressCatalogState {
  provinces: ApiProvince[];
  communes: ApiCommune[];
  communesByProvince: Map<string, ApiCommune[]>;
  loadingProvinces: boolean;
  loadingCommunes: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAddressCatalog(): AddressCatalogState {
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadingProvinces(true);
    setLoadingCommunes(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        addressCatalogApi.provinces(),
        addressCatalogApi.communes(),
      ]);
      setProvinces(pRes.data || []);
      setCommunes(cRes.data || []);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Không thể tải danh mục địa chỉ';
      setError(msg);
    } finally {
      setLoadingProvinces(false);
      setLoadingCommunes(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const communesByProvince = useMemo(() => {
    const map = new Map<string, ApiCommune[]>();
    communes.forEach((c) => {
      const pid = c.provinceId;
      if (!pid) return;
      const arr = map.get(pid) || [];
      arr.push(c);
      map.set(pid, arr);
    });
    return map;
  }, [communes]);

  return {
    provinces,
    communes,
    communesByProvince,
    loadingProvinces,
    loadingCommunes,
    error,
    refresh,
  };
}