/**
 * AsyncStorage helpers — JSON-aware thin wrapper.
 * Mirrors the localStorage helpers in frontend/src/lib/theme.ts so we can
 * port logic 1:1 from web to mobile.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  session: 'thriftit_session',
  likedProducts: 'thriftit_likedProducts',
  cart: 'thriftit_cart',
  userRole: 'thriftit_userRole',
} as const;

export async function getStoredJSON<T>(key: string): Promise<T | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export async function setStoredJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — AsyncStorage may fail in some edge cases (e.g. quota)
  }
}

export async function getStoredString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setStoredString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export async function removeStored(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}