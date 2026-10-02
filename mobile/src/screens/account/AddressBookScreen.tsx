/**
 * AddressBookScreen — full CRUD UI for the buyer's Address Book tab.
 * Mirrors FE `AddressBookTab` in `frontend/src/pages/account/AccountScreen.tsx`.
 *
 * The CAS catalog (provinces + communes) is loaded once via
 * `useAddressCatalog`. The address list + CRUD mutations come from
 * `AddressContext` so this screen is purely presentational.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAddress } from '../../context/AddressContext';
import { useAddressCatalog } from '../../hooks/useAddressCatalog';
import { AddressBookCard } from '../../components/AddressBookCard';
import {
  AddressFormFields,
  type AddressFormValue,
} from '../../components/AddressFormFields';
import type { Address } from '../../types';
import { T, ESPRESSO, COFFEE, LINEN, MUTED, CARD, serif } from '../../theme/colors';
import type { AccountStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AccountStackParamList>;

const PHONE_RE = /^\d{10,11}$/;

export function AddressBookScreen() {
  const navigation = useNavigation<Nav>();
  const {
    addresses,
    loading,
    refresh,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
  } = useAddress();
  const {
    provinces,
    communesByProvince,
    loadingProvinces,
    loadingCommunes,
    error: catalogError,
    refresh: refreshCatalog,
  } = useAddressCatalog();

  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<AddressFormValue>({
    name: '',
    phone: '',
    detail: '',
    provinceId: '',
    wardId: '',
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft({
      name: '',
      phone: '',
      detail: '',
      provinceId: '',
      wardId: '',
      isDefault: addresses.length === 0,
    });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (a: Address) => {
    setEditing(a);
    setDraft({
      name: a.name,
      phone: a.phone,
      detail: a.address,
      provinceId: a.provinceId ?? '',
      wardId: a.wardId ?? '',
      isDefault: a.isDefault,
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    if (!draft.name.trim()) return setFormError('Vui lòng nhập họ tên');
    if (!PHONE_RE.test(draft.phone.trim()))
      return setFormError('Số điện thoại phải có 10–11 chữ số');
    if (!draft.provinceId) return setFormError('Vui lòng chọn tỉnh/thành');
    if (!draft.wardId) return setFormError('Vui lòng chọn phường/xã');
    if (draft.detail.trim().length < 3)
      return setFormError('Vui lòng nhập số nhà, tên đường');

    setSubmitting(true);
    try {
      const payload = {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.detail.trim(),
        provinceId: draft.provinceId,
        wardId: draft.wardId,
        isDefault: draft.isDefault,
      };
      const created = editing
        ? await updateAddress(editing.id, payload)
        : await addAddress(payload);
      if (created) closeForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể lưu địa chỉ';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = (a: Address) => {
    Alert.alert(
      'Xóa địa chỉ',
      `Xóa địa chỉ của ${a.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            removeAddress(a.id);
          },
        },
      ],
    );
  };

  const onSetDefault = (a: Address) => {
    setDefault(a.id);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color={ESPRESSO} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, serif]}>Sổ địa chỉ</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={T}
          />
        }
      >
        {showForm ? (
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, serif]}>
              {editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>

            {catalogError ? (
              <View style={styles.catalogError}>
                <Text style={styles.catalogErrorText}>
                  ⚠️ Không tải được danh mục đỉa chỉ.
                </Text>
                <TouchableOpacity onPress={refreshCatalog}>
                  <Text style={styles.retryLink}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <AddressFormFields
              value={draft}
              onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
              provinces={provinces}
              communesByProvince={communesByProvince}
              loadingProvinces={loadingProvinces}
              loadingCommunes={loadingCommunes}
              showDefaultToggle={addresses.length > 0}
              hideDefaultWhenNoAddresses={addresses.length === 0}
            />

            {formError ? (
              <View style={styles.formErrorBox}>
                <Text style={styles.formErrorText}>⚠️ {formError}</Text>
              </View>
            ) : null}

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={closeForm}
                disabled={submitting}
                activeOpacity={0.85}
              >
                <Text style={styles.btnCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={submit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color={LINEN} />
                ) : (
                  <Text style={styles.btnPrimaryText}>
                    {editing ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCard}
            onPress={openCreate}
            activeOpacity={0.85}
          >
            <Plus size={16} color={T} />
            <Text style={styles.addCardText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        )}

        {addresses.length === 0 && !loading ? (
          <View style={styles.empty}>
            <MapPin size={40} color={MUTED} />
            <Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text>
            <Text style={styles.emptySubtitle}>
              Thêm địa chỉ để tiết kiệm thời gian khi đặt hàng.
            </Text>
          </View>
        ) : null}

        {addresses.map((a) => (
          <AddressBookCard
            key={a.id}
            address={a}
            onEdit={() => openEdit(a)}
            onDelete={() => onDelete(a)}
            onSetDefault={() => onSetDefault(a)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LINEN,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: MUTED,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ESPRESSO,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: T,
    borderStyle: 'dashed',
    backgroundColor: T + '05',
    marginBottom: 16,
  },
  addCardText: {
    color: T,
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 16,
  },
  emptyTitle: {
    color: ESPRESSO,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: COFFEE,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: MUTED,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ESPRESSO,
    marginBottom: 8,
  },
  catalogError: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catalogErrorText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  retryLink: {
    color: T,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  formErrorBox: {
    backgroundColor: '#FDEDEC',
    borderWidth: 1,
    borderColor: '#FADBD8',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  formErrorText: {
    color: '#E74C3C',
    fontSize: 12,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    minWidth: 110,
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