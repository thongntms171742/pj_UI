/**
 * ConfirmDialog — cross-platform confirmation modal.
 *
 * React Native's `Alert.alert` does not work on web (it is a no-op outside
 * iOS/Android). This component renders a real `<Modal>` so the dialog shows
 * up identically on iOS, Android, and the Expo web bundle.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     visible={open}
 *     title="Đăng xuất"
 *     message="Bạn có chắc muốn đăng xuất?"
 *     confirmText="Đăng xuất"
 *     cancelText="Hủy"
 *     destructive
 *     onConfirm={() => { setOpen(false); doLogout(); }}
 *     onCancel={() => setOpen(false)}
 *   />
 */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { LINEN, ESPRESSO, MUTED, ERROR_COLOR, T as ACCENT } from '../theme/colors';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** Red confirm button. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.btnCancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                destructive ? styles.btnDanger : styles.btnPrimary,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text
                style={
                  destructive ? styles.btnDangerText : styles.btnPrimaryText
                }
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: LINEN,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ESPRESSO,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#E0D5C0',
  },
  btnCancelText: {
    color: ESPRESSO,
    fontWeight: '600',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: ACCENT,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDanger: {
    backgroundColor: ERROR_COLOR,
  },
  btnDangerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});