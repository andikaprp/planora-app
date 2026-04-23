import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return canUseLocalStorage() ? window.localStorage.getItem(key) : null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    if (canUseLocalStorage()) {
      window.localStorage.removeItem(key);
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
