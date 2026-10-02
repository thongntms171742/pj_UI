import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AddressProvider } from './src/context/AddressContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/Toast';

function AppShell() {
  const { toastMsg } = useAuth();
  return (
    <>
      <RootNavigator />
      <Toast message={toastMsg} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthProvider>
          <AddressProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </AddressProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}