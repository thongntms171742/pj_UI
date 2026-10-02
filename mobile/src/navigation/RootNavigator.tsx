import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuth } from '../context/AuthContext';
import { LINEN, T, MUTED, ESPRESSO, CARD } from '../theme/colors';
import { subscribeToast } from '../utils/toast';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Floating toast that subscribes to the global toast bus.
 * Renders outside the NavigationContainer so it's never clipped by screens.
 */
function GlobalToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToast(setMsg);
  }, []);

  if (!msg) return null;

  const isError = msg.startsWith('⚠️');
  return (
    <TouchableOpacity
      style={[styles.toast, isError ? styles.toastError : styles.toastOk]}
      onPress={() => setMsg(null)}
      activeOpacity={0.9}
      accessibilityRole="alert"
    >
      <Text style={styles.toastText}>{msg}</Text>
    </TouchableOpacity>
  );
}

export function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={T} />
      </View>
    );
  }

  // 2026-10-03 (mobile parity with FE): browsing the marketplace
  // (Home/Search/ProductDetail/Cart/Account) no longer requires the user to
  // be logged in. The `Auth` stack is still registered as a screen so we
  // can deep-link into Login/Register when a buyer action needs an
  // identity (place order, view orders, address book CRUD).
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <GlobalToast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LINEN,
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  toastOk: { backgroundColor: ESPRESSO },
  toastError: { backgroundColor: '#C0392B' },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
