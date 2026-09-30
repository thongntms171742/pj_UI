import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { ThriftLogo } from '../../components/ThriftLogo';
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif } from '../../theme/colors';

interface Props {
  navigation: { goBack: () => void };
}

export function RegisterScreen({ navigation }: Props) {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
    } catch {
      // toast already shown in context
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LINEN }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <ChevronLeft size={22} color={COFFEE} />
          </TouchableOpacity>
          <ThriftLogo size={28} />
          <Text style={[styles.headerTitle, serif]}>Đăng ký</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={[styles.title, serif]}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>
              Tham gia thrift it! để mua và bán đồ vintage chỉ trong vài giây.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={COFFEE + '88'}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ban@email.com"
              placeholderTextColor={COFFEE + '88'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor={COFFEE + '88'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={COFFEE + '88'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
              onSubmitEditing={onSubmit}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={onSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={LINEN} />
              ) : (
                <Text style={styles.btnText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.terms}>
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Text style={styles.link}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.link}>Chính sách bảo mật</Text> của thrift it!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: MUTED,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ESPRESSO,
    fontStyle: 'italic',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: MUTED,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: ESPRESSO,
    marginBottom: 6,
  },
  subtitle: {
    color: COFFEE,
    fontSize: 13,
    marginBottom: 16,
  },
  label: {
    color: COFFEE,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: SOFT,
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: ESPRESSO,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  btn: {
    backgroundColor: T,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: LINEN,
    fontSize: 15,
    fontWeight: '700',
  },
  terms: {
    color: COFFEE,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  link: {
    color: T,
    textDecorationLine: 'underline',
  },
});