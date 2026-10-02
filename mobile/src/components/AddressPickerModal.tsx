/**
 * AddressPickerModal — Buyer-checkout modal that lets the user pick an
 * existing address OR add a new one inline (with the CAS 2-level form).
 * Mirrors FE
 * `frontend/src/components/common/AddressBook.tsx` `AddressPickerModal`.
 *
 * Props:
 *   - `open`: external visibility
 *   - `onClose`: backdrop tap / X
 *   - `addresses` + `defaultAddress`: list (already adapted)
 *   - `onSelect`: called with the chosen `Address` after the user picks
 *     or after inline add+select
 *   - `onAddNew`: forwarded to AddressContext `addAddress` (returns the
 *     created Address or null on failure)
 *
 * CAS catalog is loaded once inside the modal so the form has something to
 * render — passing it in via props is also possible but adds plumbing for
 * every consumer. Keeping it self-contained matches the FE pattern.
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, MapPin, Plus, Check } from 'lucide-react-native';
import { COFFEE, ESPRESSO, LINEN, CARD, MUTED, T, serif } from '../theme/colors';
import type { Address } from '../types';
import {
  AddressFormFields,
  type AddressFormValue,
} from './AddressFormFields';
import { useAddressCatalog } from '../hooks/useAddressCatalog';
import type { ApiAddressInput } from '../api/endpoints';

interface Props {
  open: boolean;
  addresses: Address[];
  defaultAddress: Address | null;
  onClose: () => void;
  onSelect: (address: Address) => void;
  onAddNew: (input: ApiAddressInput) => Promise<Address | null>;
}

type Mode = 'list' | 'new';

const NAME_RE = (s: string) => s.trim().length > 0;
const PHONE_RE = /^\d{10,11}$/;

export function AddressPickerModal({
  open,
  addresses,
  defaultAddress,
  onClose,
  onSelect,
  onAddNew,
}: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [draft, setDraft] = useState<AddressFormValue>({
    name: '',
    phone: '',
    detail: '',
    provinceId: '',
    wardId: '',
    isDefault: addresses.length === 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    provinces,
    communesByProvince,
    loadingProvinces,
    loadingCommunes,
    error: catalogError,
  } = useAddressCatalog();

  // Look up human-readable names from the catalog for the API payload.
  // CAS provides only provinceId + wardId in the form; the contract
  // requires province + ward + district name strings, so we resolve them here.
  const selectedProvince = provinces.find((p) => p.id === draft.provinceId);
  const wardsForProvince = draft.provinceId
    ? communesByProvince.get(draft.provinceId) || []
    : [];
  const selectedWard = wardsForProvince.find((w) => w.id === draft.wardId);

  useEffect(() => {
    if (open) {
      // 2026-10-03: when the buyer has no saved addresses yet, jump
      // straight into the inline "new" form so they don't have to tap
      // an extra button on the empty list. They can still go back to
      // the list view (which is just the empty placeholder + this
      // button) if they want to.
      setMode(addresses.length === 0 ? 'new' : 'list');
      setError(null);
    }
  }, [open, addresses.length]);

  const handleCreate = async () => {
    setError(null);
    if (!NAME_RE(draft.name)) return setError('Vui lòng nhập họ tên');
    if (!PHONE_RE.test(draft.phone.trim()))
      return setError('Số điện thoại phải có 10–11 chữ số');
    if (!draft.provinceId) return setError('Vui lòng chọn tỉnh/thành');
    if (!draft.wardId) return setError('Vui lòng chọn phường/xã');
    if (draft.detail.trim().length < 3)
      return setError('Vui lòng nhập số nhà, tên đường');

    setSubmitting(true);
    try {
      const created = await onAddNew({
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.detail.trim(),
        // 2026-10-03: API contract (API_CONTRACT.md §13) requires province +
        // ward + district name strings. CAS provides provinceId + wardId, so
        // we resolve the human-readable names from the catalog we already loaded.
        provinceId: draft.provinceId,
        province: selectedProvince?.name ?? '',
        wardId: draft.wardId,
        ward: selectedWard?.name ?? '',
        // district: province name in VN admin-hierarchy; optional in the
        // contract but including it improves downstream address parsing.
        district: selectedProvince?.name ?? '',
        isDefault: draft.isDefault,
      });
      if (created) {
        onSelect(created);
      } else {
        setError('Không thể lưu địa chỉ');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể lưu địa chỉ';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const defaultId = defaultAddress?.id;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, serif]}>Chọn địa chỉ nhận hàng</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <X size={20} color={COFFEE} />
            </TouchableOpacity>
          </View>

          {mode === 'list' ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {addresses.length === 0 ? (
                <Text style={styles.empty}>
                  Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
                </Text>
              ) : (
                addresses.map((a) => {
                  const selected = a.id === defaultId;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.addressItem,
                        selected && styles.addressItemActive,
                      ]}
                      onPress={() => onSelect(a)}
                      activeOpacity={0.85}
                    >
                      <MapPin
                        size={18}
                        color={selected ? T : COFFEE}
                        style={{ marginTop: 2 }}
                      />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{a.name}</Text>
                          <Text style={styles.itemPhone}>· {a.phone}</Text>
                          {a.isDefault ? (
                            <View style={styles.defaultPill}>
                              <Text style={styles.defaultPillText}>Mặc định</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.itemAddr} numberOfLines={2}>
                          {[a.address, a.ward, a.province]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      </View>
                      {selected ? <Check size={18} color={T} /> : null}
                    </TouchableOpacity>
                  );
                })
              )}

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setMode('new')}
                activeOpacity={0.85}
              >
                <Plus size={16} color={T} />
                <Text style={styles.addBtnText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.body}
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                onPress={() => setMode('list')}
                activeOpacity={0.7}
              >
                <Text style={styles.backLink}>← Quay lại danh sách</Text>
              </TouchableOpacity>

              {catalogError ? (
                <Text style={styles.catalogError}>
                  ⚠️ Không tải được danh mục tỉnh/thành. Vui lòng thử lại.
                </Text>
              ) : null}

              <AddressFormFields
                value={draft}
                onChange={(next) =>
                  setDraft((d) => ({ ...d, ...next }))
                }
                provinces={provinces}
                communesByProvince={communesByProvince}
                loadingProvinces={loadingProvinces}
                loadingCommunes={loadingCommunes}
                showDefaultToggle={addresses.length > 0}
                hideDefaultWhenNoAddresses={addresses.length === 0}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => setMode('list')}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnCancelText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleCreate}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color={LINEN} />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Lưu & chọn</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: LINEN,
    borderRadius: 18,
    padding: 16,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: MUTED,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: MUTED,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: ESPRESSO,
  },
  body: {
    maxHeight: 480,
  },
  empty: {
    color: COFFEE,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 14,
    backgroundColor: CARD,
    marginBottom: 8,
  },
  addressItemActive: {
    borderColor: T,
    backgroundColor: T + '0A',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  itemName: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '700',
  },
  itemPhone: {
    color: COFFEE,
    fontSize: 12,
  },
  defaultPill: {
    backgroundColor: T + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  defaultPillText: {
    color: T,
    fontSize: 10,
    fontWeight: '700',
  },
  itemAddr: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {
    color: T,
    fontSize: 13,
    fontWeight: '700',
  },
  backLink: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  catalogError: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 8,
  },
  errorBox: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: MUTED,
  },
  btnCancelText: {
    color: ESPRESSO,
    fontWeight: '600',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: T,
  },
  btnPrimaryText: {
    color: LINEN,
    fontWeight: '700',
    fontSize: 13,
  },
});