/**
 * AddressBookCard — read-only display card used in AccountScreen's Address
 * Book list. Mirrors FE
 * `frontend/src/components/common/AddressBook.tsx` `AddressBookCard`.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Star, Pencil, Trash2 } from 'lucide-react-native';
import { COFFEE, ESPRESSO, CARD, MUTED, SOFT, T, LINEN } from '../theme/colors';
import type { Address } from '../types';
import { buildShippingAddressString } from '../adapters';

interface Props {
  address: Address;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export function AddressBookCard({ address, onEdit, onDelete, onSetDefault }: Props) {
  const summary = buildShippingAddressString(address);
  return (
    <View
      style={[
        styles.card,
        address.isDefault && { borderColor: T, backgroundColor: T + '08' },
      ]}
    >
      <View style={styles.iconWrap}>
        <MapPin size={18} color={address.isDefault ? T : COFFEE} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{address.name}</Text>
          <Text style={styles.phone}>· {address.phone}</Text>
          {address.isDefault ? (
            <View style={styles.defaultPill}>
              <Text style={styles.defaultPillText}>Mặc định</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.summary} numberOfLines={2}>
          {summary}
        </Text>
        <View style={styles.actions}>
          {!address.isDefault && onSetDefault ? (
            <TouchableOpacity onPress={onSetDefault} activeOpacity={0.7}>
              <View style={styles.actionLeft}>
                <Star size={12} color={T} />
                <Text style={[styles.actionText, { color: T }]}>
                  Đặt làm mặc định
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {onEdit ? (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
              <Text style={[styles.actionText, { color: COFFEE, marginLeft: 12 }]}>
                Sửa
              </Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              onPress={onDelete}
              activeOpacity={0.7}
              style={styles.deleteBtn}
            >
              <Trash2 size={12} color="#E74C3C" />
              <Text style={[styles.actionText, { color: '#E74C3C', marginLeft: 4 }]}>
                Xoá
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: MUTED,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    color: ESPRESSO,
    fontSize: 14,
    fontWeight: '700',
  },
  phone: {
    color: COFFEE,
    fontSize: 12,
  },
  defaultPill: {
    backgroundColor: T + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 4,
  },
  defaultPillText: {
    color: T,
    fontSize: 10,
    fontWeight: '700',
  },
  summary: {
    color: COFFEE,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 4,
  },
});