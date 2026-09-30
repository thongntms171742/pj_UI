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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ThriftLogo } from '../../components/ThriftLogo';
import { T, ESPRESSO, COFFEE, LINEN, CARD, MUTED, SOFT, serif, error } from '../../theme/colors';

interface Props {
  navigation: {
    navigate: (screen: 'Register') => void;
  };
}

export function LoginScreen({ navigation }: Props) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch {
      // toast already shown in context
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LINEN }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SafeAreaView edges={['top']}>
          <View style={styles.hero}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=1080&fit=crop&auto=format',
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroBrand}>
                <ThriftLogo size={42} textColor={LINEN} />
                <Text style={[styles.heroBrandText, serif]}>thrift it!</Text>
              </View>
              <Text style={[styles.heroTitle, serif]}>
                Thời trang cũ, giá trị mới 🌿
              </Text>
              <Text style={styles.heroSubtitle}>
                Khám phá hàng ngàn món đồ vintage độc đáo từ các shop uy tín khắp Việt Nam.
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <ThriftLogo size={48} />
            <Text style={[styles.brandText, serif]}>thrift it!</Text>
            <Text style={styles.brandSubtitle}>Chào mừng bạn trở lại</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, error && !email ? styles.inputInvalid : null]}
            placeholder="ban@email.com"
            placeholderTextColor={COFFEE + '88'}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={[styles.input, error && !password ? styles.inputInvalid : null]}
            placeholder="••••••••"
            placeholderTextColor={COFFEE + '88'}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError('');
            }}
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
              <Text style={styles.btnText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOutlineText}>Đăng ký tài khoản mới</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Text style={styles.link}>Điều khoản sử dụng</Text>
          </Text>

          <View style={styles.testAccounts}>
            <Text style={styles.testTitle}>Tài khoản test:</Text>
            <Text style={styles.testLine}>• buyer: linh.nguyen@gmail.com / 123456</Text>
            <Text style={styles.testLine}>• admin: admin@thriftit.vn / admin</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    height: 260,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(58,35,18,0.55)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroBrandText: {
    color: LINEN,
    fontSize: 22,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  heroTitle: {
    color: LINEN,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#E8D5BC',
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: CARD,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandText: {
    color: ESPRESSO,
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    marginTop: 4,
  },
  brandSubtitle: {
    color: COFFEE,
    fontSize: 13,
    marginTop: 2,
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
  inputInvalid: {
    borderColor: '#EF4444',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    color: error,
    fontSize: 13,
  },
  btn: {
    backgroundColor: T,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: LINEN,
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: MUTED,
  },
  dividerText: {
    color: COFFEE,
    fontSize: 12,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: MUTED,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: COFFEE,
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    color: COFFEE,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
  link: {
    color: T,
    textDecorationLine: 'underline',
  },
  testAccounts: {
    marginTop: 24,
    padding: 12,
    backgroundColor: SOFT,
    borderRadius: 10,
  },
  testTitle: {
    color: ESPRESSO,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  testLine: {
    color: COFFEE,
    fontSize: 11,
    marginVertical: 1,
  },
});