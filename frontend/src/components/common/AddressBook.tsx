import React, { useEffect, useMemo, useState } from "react";
import { X, ChevronDown, MapPin, Plus, Trash2, Star, Check } from "lucide-react";
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, ff } from "../../lib/theme";
import { api } from "../../lib/api";
import type { ApiProvince, ApiCommune, ApiAddress } from "../../lib/api";
import { adaptAddress } from "../../lib/adapters";
import type { Address } from "../../types";

// ── Hook: load provinces & communes from CAS proxy ─────────────────────────
export function useAddressCatalog() {
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [communes, setCommunes] = useState<ApiCommune[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all provinces once.
  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    api
      .get<{ data: ApiProvince[]; effectiveDate: string }>("/addresses/provinces")
      .then((res) => {
        if (!cancelled) setProvinces(res.data || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Không thể tải danh mục tỉnh/thành");
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load all communes once (cheaper than per-province requests for 2-level UI).
  useEffect(() => {
    let cancelled = false;
    setLoadingCommunes(true);
    api
      .get<{ data: ApiCommune[]; effectiveDate: string }>("/addresses/communes")
      .then((res) => {
        if (!cancelled) setCommunes(res.data || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Không thể tải danh mục phường/xã");
      })
      .finally(() => {
        if (!cancelled) setLoadingCommunes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const communesByProvince = useMemo(() => {
    const map = new Map<string, ApiCommune[]>();
    communes.forEach((c) => {
      const pid = (c as any).provinceId;
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
  };
}

// ── Sub-component: address form fields ─────────────────────────────────────
interface AddressFormFieldsProps {
  name: string;
  phone: string;
  detail: string;
  provinceId: string;
  wardId: string;
  isDefault: boolean;
  onChange: (next: Partial<{
    name: string;
    phone: string;
    detail: string;
    provinceId: string;
    wardId: string;
    isDefault: boolean;
  }>) => void;
  provinces: ApiProvince[];
  communesByProvince: Map<string, ApiCommune[]>;
  loadingProvinces: boolean;
  loadingCommunes: boolean;
  /** Whether to show the "set as default" checkbox (Buyer book only). */
  showDefaultToggle?: boolean;
}

export function AddressFormFields({
  name,
  phone,
  detail,
  provinceId,
  wardId,
  isDefault,
  onChange,
  provinces,
  communesByProvince,
  loadingProvinces,
  loadingCommunes,
  showDefaultToggle = true,
}: AddressFormFieldsProps) {
  const wardsForProvince = provinceId ? communesByProvince.get(provinceId) || [] : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: COFFEE, ...ff }}>
            Họ và tên *
          </label>
          <input
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nguyễn Văn A"
            className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-400/40"
            style={{ borderColor: MUTED, backgroundColor: "#FFFFFF", color: ESPRESSO, ...ff }}
          />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1" style={{ color: COFFEE, ...ff }}>
            Số điện thoại *
          </label>
          <input
            value={phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="0987654321"
            className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-400/40"
            style={{ borderColor: MUTED, backgroundColor: "#FFFFFF", color: ESPRESSO, ...ff }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: COFFEE, ...ff }}>
          Tỉnh / Thành phố *
        </label>
        <div className="relative">
          <select
            value={provinceId}
            onChange={(e) => onChange({ provinceId: e.target.value, wardId: "" })}
            disabled={loadingProvinces}
            className="w-full appearance-none px-3 py-2 pr-9 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-400/40"
            style={{
              borderColor: MUTED,
              backgroundColor: "#FFFFFF",
              color: ESPRESSO,
              ...ff,
            }}
          >
            <option value="">{loadingProvinces ? "Đang tải..." : "-- Chọn tỉnh/thành --"}</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: COFFEE }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: COFFEE, ...ff }}>
          Phường / Xã *
        </label>
        <div className="relative">
          <select
            value={wardId}
            onChange={(e) => onChange({ wardId: e.target.value })}
            disabled={!provinceId || loadingCommunes}
            className="w-full appearance-none px-3 py-2 pr-9 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60"
            style={{
              borderColor: MUTED,
              backgroundColor: "#FFFFFF",
              color: ESPRESSO,
              ...ff,
            }}
          >
            <option value="">
              {!provinceId
                ? "Vui lòng chọn Tỉnh/Thành trước"
                : loadingCommunes
                ? "Đang tải..."
                : wardsForProvince.length === 0
                ? "Không có dữ liệu"
                : "-- Chọn phường/xã --"}
            </option>
            {wardsForProvince.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: COFFEE }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold block mb-1" style={{ color: COFFEE, ...ff }}>
          Số nhà, ngõ, tên đường *
        </label>
        <textarea
          value={detail}
          onChange={(e) => onChange({ detail: e.target.value })}
          placeholder="VD: 120/5 Phổ Quang"
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-400/40 resize-none"
          style={{ borderColor: MUTED, backgroundColor: "#FFFFFF", color: ESPRESSO, ...ff }}
        />
      </div>
      {showDefaultToggle && (
        <label className="flex items-center gap-2 select-none cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => onChange({ isDefault: e.target.checked })}
            className="w-4 h-4 accent-[#D27D2D]"
          />
          <span className="text-xs font-semibold" style={{ color: ESPRESSO, ...ff }}>
            Đặt làm địa chỉ mặc định
          </span>
        </label>
      )}
    </div>
  );
}

// ── Address picker modal (Buyer — select existing OR add new) ─────────────
interface AddressPickerModalProps {
  open: boolean;
  addresses: Address[];
  defaultId?: string;
  onClose: () => void;
  onSelect: (address: Address) => void;
  onAddNew: (input: {
    name: string;
    phone: string;
    detail: string;
    provinceId: string;
    wardId: string;
    isDefault: boolean;
  }) => Promise<ApiAddress | null>;
  provinces: ApiProvince[];
  communesByProvince: Map<string, ApiCommune[]>;
  loadingProvinces: boolean;
  loadingCommunes: boolean;
}

export function AddressPickerModal({
  open,
  addresses,
  defaultId,
  onClose,
  onSelect,
  onAddNew,
  provinces,
  communesByProvince,
  loadingProvinces,
  loadingCommunes,
}: AddressPickerModalProps) {
  const [mode, setMode] = useState<"list" | "new">("list");
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    detail: "",
    provinceId: "",
    wardId: "",
    isDefault: addresses.length === 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode("list");
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    setError(null);
    if (!draft.name.trim()) return setError("Vui lòng nhập họ tên");
    if (!/^\d{10,11}$/.test(draft.phone.trim())) return setError("Sĩ lệ thoại phải có 10–11 chữ số");
    if (!draft.provinceId) return setError("Vui lòng chọn tỉnh/thành");
    if (!draft.wardId) return setError("Vui lòng chọn phường/xã");
    if (!draft.detail.trim() || draft.detail.trim().length < 3)
      return setError("Vui lòng nhập số nhà, tên đường");

    setSubmitting(true);
    try {
      const created = await onAddNew(draft);
      if (created) {
        const mapped = adaptAddress(created, "delivery");
        onSelect(mapped);
      }
    } catch (e: any) {
      setError(e?.message || "Không thể lưu địa chỉ");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="rounded-3xl shadow-2xl p-6 max-w-lg w-full border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: LINEN, borderColor: `${MUTED}90` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: `${MUTED}80` }}>
          <h3 className="text-lg font-bold" style={{ ...ff, color: ESPRESSO }}>
            Chọn địa chỉ nhận hàng
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {mode === "list" && (
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="py-6 text-center text-sm" style={{ color: COFFEE, ...ff }}>
                Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
              </div>
            ) : (
              addresses.map((a) => {
                const selected = a.id === (defaultId ?? addresses.find((x) => x.isDefault)?.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className="w-full text-left p-3.5 rounded-2xl border-2 transition-all hover:shadow-md"
                    style={{
                      borderColor: selected ? T : MUTED,
                      backgroundColor: selected ? `${T}0A` : CARD,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0"
                        style={{ color: selected ? T : COFFEE }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: ESPRESSO, ...ff }}>
                            {a.name}
                          </span>
                          <span className="text-xs" style={{ color: COFFEE, ...ff }}>
                            · {a.phone}
                          </span>
                          {a.isDefault && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: `${T}22`, color: T, ...ff }}
                            >
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>
                          {[a.detail, a.ward, a.province].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      {selected && <Check size={18} style={{ color: T }} />}
                    </div>
                  </button>
                );
              })
            )}

            <button
              onClick={() => setMode("new")}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed transition-all hover:bg-stone-50"
              style={{ borderColor: T, color: T, ...ff }}
            >
              <Plus size={16} />
              Thêm địa chỉ mới
            </button>
          </div>
        )}

        {mode === "new" && (
          <div>
            <button
              onClick={() => setMode("list")}
              className="text-xs font-semibold mb-3 inline-flex items-center gap-1 hover:opacity-80"
              style={{ color: COFFEE, ...ff }}
            >
              ← Quay lại danh sách
            </button>

            <AddressFormFields
              name={draft.name}
              phone={draft.phone}
              detail={draft.detail}
              provinceId={draft.provinceId}
              wardId={draft.wardId}
              isDefault={draft.isDefault}
              onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
              provinces={provinces}
              communesByProvince={communesByProvince}
              loadingProvinces={loadingProvinces}
              loadingCommunes={loadingCommunes}
              showDefaultToggle={addresses.length > 0}
            />

            {error && (
              <div
                className="mt-3 p-2.5 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: "#FDEDEC", color: "#E74C3C", ...ff }}
              >
                ⚠️ {error}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setMode("list")}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: MUTED, color: COFFEE, ...ff }}
              >
                Huỷ
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
                style={{ backgroundColor: T, color: LINEN, ...ff }}
              >
                {submitting ? "Đang lưu…" : "Lưu & chọn"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AddressBookCard (Buyer — read-only display in AccountScreen) ──────────
export function AddressBookCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <div
      className="p-4 rounded-2xl border-2 transition-all"
      style={{
        borderColor: address.isDefault ? T : MUTED,
        backgroundColor: address.isDefault ? `${T}08` : CARD,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: address.isDefault ? `${T}22` : SOFT, color: address.isDefault ? T : COFFEE }}
        >
          <MapPin size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: ESPRESSO, ...ff }}>
              {address.name}
            </span>
            <span className="text-xs" style={{ color: COFFEE, ...ff }}>
              · {address.phone}
            </span>
            {address.isDefault && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: `${T}22`, color: T, ...ff }}
              >
                Mặc định
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: COFFEE, ...ff }}>
            {[address.detail, address.ward, address.province].filter(Boolean).join(", ")}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {!address.isDefault && (
              <button
                onClick={onSetDefault}
                className="text-xs font-bold inline-flex items-center gap-1 hover:opacity-80"
                style={{ color: T, ...ff }}
              >
                <Star size={12} />
                Đặt làm mặc định
              </button>
            )}
            <button
              onClick={onEdit}
              className="text-xs font-bold hover:opacity-80"
              style={{ color: COFFEE, ...ff }}
            >
              Sửa
            </button>
            <button
              onClick={onDelete}
              className="text-xs font-bold inline-flex items-center gap-1 hover:opacity-80 ml-auto"
              style={{ color: "#E74C3C", ...ff }}
            >
              <Trash2 size={12} />
              Xoá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}