/**
 * AddressFormFields — shared form for adding/editing an address with the
 * CAS 2-level picker (Tỉnh/Thành ➜ Phường/Xã). Mirrors FE
 * `frontend/src/components/common/AddressBook.tsx` `AddressFormFields`
 * (BE 2026-10-03).
 *
 * The consumer owns the form state and passes it down via `value` + `onChange`.
 * The catalog (provinces / communesByProvince) is loaded externally so the
 * same catalog can be shared across the picker modal and the Address Book
 * tab.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { ChevronDown, MapPin, Check } from 'lucide-react-native';
import { COFFEE, LINEN, ESPRESSO, MUTED, SOFT, CARD, T } from '../theme/colors';
import type { ApiProvince, ApiCommune } from '../api/endpoints';

export interface AddressFormValue {
  name: string;
  phone: string;
  detail: string;
  provinceId: string;
  wardId: string;
  isDefault: boolean;
}

interface Props {
  value: AddressFormValue;
  onChange: (next: Partial<AddressFormValue>) => void;
  provinces: ApiProvince[];
  communesByProvince: Map<string, ApiCommune[]>;
  loadingProvinces?: boolean;
  loadingCommunes?: boolean;
  /** Whether to show the "set as default" checkbox (Buyer book only). */
  showDefaultToggle?: boolean;
  /** Hide checkbox when only one address exists (it must be default). */
  hideDefaultWhenNoAddresses?: boolean;
}

export function AddressFormFields({
  value,
  onChange,
  provinces,
  communesByProvince,
  loadingProvinces = false,
  loadingCommunes = false,
  showDefaultToggle = true,
  hideDefaultWhenNoAddresses = false,
}: Props) {
  const [openDropdown, setOpenDropdown] = useState<'province' | 'ward' | null>(null);

  const wardsForProvince = useMemo(
    () => (value.provinceId ? communesByProvince.get(value.provinceId) || [] : []),
    [communesByProvince, value.provinceId],
  );

  const selectedProvince = provinces.find((p) => p.id === value.provinceId);
  const selectedWard = wardsForProvince.find((w) => w.id === value.wardId);

  // Close a dropdown — takes an optional delay so the onPress handler
  // that triggered the open still fires before we collapse.
  const closeDropdown = (which: 'province' | 'ward') => {
    if (openDropdown === which) setOpenDropdown(null);
  };
  const toggleDropdown = (which: 'province' | 'ward') => {
    setOpenDropdown((cur) => (cur === which ? null : which));
  };

  // When province changes, clear ward selection and collapse ward dropdown.
  const handleProvinceSelect = (provinceId: string) => {
    onChange({ provinceId, wardId: '' });
    setOpenDropdown(null);
  };

  const handleWardSelect = (wardId: string) => {
    onChange({ wardId });
    setOpenDropdown(null);
  };

  return (
    <View style={styles.wrap}>
      {/* Name + phone */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            value={value.name}
            onChangeText={(t) => onChange({ name: t })}
            placeholder="Nguyễn Văn A"
            placeholderTextColor={MUTED}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            value={value.phone}
            onChangeText={(t) => onChange({ phone: t })}
            placeholder="0987654321"
            placeholderTextColor={MUTED}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Province dropdown */}
      <Text style={styles.label}>Tỉnh / Thành phố *</Text>
      <NativeDropdown
        placeholder={loadingProvinces ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}
        displayValue={selectedProvince?.name}
        disabled={loadingProvinces}
        open={openDropdown === 'province'}
        onToggle={() => toggleDropdown('province')}
        onClose={() => closeDropdown('province')}
        zIndex={200}
      >
        <ScrollView
          style={styles.dropdownScroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {provinces.map((p) => {
            const active = p.id === value.provinceId;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                onPress={() => handleProvinceSelect(p.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                  {p.name}
                </Text>
                {active ? <Check size={14} color={T} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </NativeDropdown>

      {/* Ward dropdown */}
      <Text style={styles.label}>Phường / Xã *</Text>
      <NativeDropdown
        placeholder={
          !value.provinceId
            ? 'Vui lòng chọn Tỉnh/Thành trước'
            : loadingCommunes
            ? 'Đang tải...'
            : wardsForProvince.length === 0
            ? 'Không có dữ liệu'
            : '-- Chọn phường/xã --'
        }
        displayValue={selectedWard?.name}
        disabled={!value.provinceId || loadingCommunes}
        open={openDropdown === 'ward'}
        onToggle={() => toggleDropdown('ward')}
        onClose={() => closeDropdown('ward')}
        zIndex={150}
      >
        <ScrollView
          style={styles.dropdownScroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {wardsForProvince.map((w) => {
            const active = w.id === value.wardId;
            return (
              <TouchableOpacity
                key={w.id}
                style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                onPress={() => handleWardSelect(w.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                  {w.name}
                </Text>
                {active ? <Check size={14} color={T} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </NativeDropdown>

      {/* Detail */}
      <Text style={styles.label}>Số nhà, ngõ, tên đường *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={value.detail}
        onChangeText={(t) => onChange({ detail: t })}
        placeholder="VD: 120/5 Phổ Quang"
        placeholderTextColor={MUTED}
        multiline
      />

      {/* Default toggle */}
      {showDefaultToggle && !hideDefaultWhenNoAddresses ? (
        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => onChange({ isDefault: !value.isDefault })}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, value.isDefault && styles.checkboxOn]}>
            {value.isDefault ? <MapPin size={12} color={LINEN} /> : null}
          </View>
          <Text style={styles.defaultText}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── NativeDropdown — a true collapsible dropdown for React Native.
//
// Props:
//   `open` + `onToggle` + `onClose` — make this a controlled component so
//     the parent (AddressFormFields) can enforce single-open behaviour and
//     close one dropdown when the other opens.
//   `placeholder` / `displayValue` — mirror a real TextInput.
//   `disabled` — dims the field and prevents toggling.
//   `children` — the ScrollView of items rendered inside when open.
function NativeDropdown({
  placeholder,
  displayValue,
  disabled,
  open,
  onToggle,
  onClose,
  zIndex = 100,
  children,
}: {
  placeholder: string;
  displayValue?: string;
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  /**
   * Stacking priority. Use higher values for dropdowns rendered first in the
   * form (e.g. Province) so their panel paints above later dropdowns (Ward)
   * when both are technically open during a state transition.
   */
  zIndex?: number;
  children: React.ReactNode;
}) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      // Mount first, then animate to full size.
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Collapse: animate first, then unmount after the animation finishes.
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setShouldRender(false);
      });
    }
  }, [open, animatedHeight, animatedOpacity]);

  const maxDropdownHeight = 220;

  return (
    <View style={[styles.dropdownOuter, { zIndex }]}>
      {/* Tappable header — always visible, toggles open/close. */}
      <TouchableOpacity
        style={[styles.dropdownWrap, disabled && styles.dropdownDisabled]}
        onPress={disabled ? undefined : onToggle}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownHeaderText,
            !displayValue && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <ChevronDown size={16} color={COFFEE} />
        </Animated.View>
      </TouchableOpacity>

      {/* In-flow animated panel: takes real layout space when open, then
          unmounts after the close animation completes. This eliminates
          any overlap with the next form field (Ward / Detail). */}
      {shouldRender && (
        <Animated.View
          style={[
            styles.dropdownPanel,
            {
              opacity: animatedOpacity,
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, maxDropdownHeight],
              }),
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  label: {
    color: COFFEE,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: SOFT,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: ESPRESSO,
    fontSize: 14,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // ── NativeDropdown ──────────────────────────────────────────────────────
  dropdownOuter: {
    position: 'relative',
    zIndex: 1,
  },
  dropdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  dropdownDisabled: {
    opacity: 0.55,
  },
  dropdownHeaderText: {
    color: ESPRESSO,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholder: {
    color: MUTED,
  },
  // In-flow panel for the list of items. Position is relative so the
  // panel takes real layout space and pushes the next form row down
  // — this guarantees no overlap with the Ward dropdown below.
  dropdownPanel: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: MUTED + '44',
  },
  dropdownItemActive: {
    backgroundColor: T + '12',
  },
  dropdownItemText: {
    color: ESPRESSO,
    fontSize: 14,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: T,
    fontWeight: '700',
  },
  // ──────────────────────────────────────────────────────────────────────

  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COFFEE,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: T,
    borderColor: T,
  },
  defaultText: {
    color: ESPRESSO,
    fontSize: 13,
    fontWeight: '600',
  },
});
