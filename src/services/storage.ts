import { Platform } from 'react-native';

export interface StorageService {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  getNumber: (key: string) => number | undefined;
  setNumber: (key: string, value: number) => void;
  getBoolean: (key: string) => boolean | undefined;
  setBoolean: (key: string, value: boolean) => void;
  delete: (key: string) => void;
  clearAll: () => void;
}

// Lazy initialization for native MMKV to avoid errors on web
let mmkvStorage: any;
if (Platform.OS !== 'web') {
  try {
    const { createMMKV } = require('react-native-mmkv');
    mmkvStorage = createMMKV();
  } catch (error) {
    console.warn('MMKV not available:', error);
  }
}

export const storageService: StorageService = {
  getString: (key: string) => {
    if (Platform.OS === 'web') {
      return (window as any).localStorage.getItem(key) || undefined;
    }
    return mmkvStorage?.getString(key);
  },
  setString: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      (window as any).localStorage.setItem(key, value);
    } else {
      mmkvStorage?.set(key, value);
    }
  },
  getNumber: (key: string) => {
    if (Platform.OS === 'web') {
      const value = (window as any).localStorage.getItem(key);
      return value ? parseFloat(value) : undefined;
    }
    return mmkvStorage?.getNumber(key);
  },
  setNumber: (key: string, value: number) => {
    if (Platform.OS === 'web') {
      (window as any).localStorage.setItem(key, value.toString());
    } else {
      mmkvStorage?.set(key, value);
    }
  },
  getBoolean: (key: string) => {
    if (Platform.OS === 'web') {
      const value = (window as any).localStorage.getItem(key);
      return value === 'true' ? true : value === 'false' ? false : undefined;
    }
    return mmkvStorage?.getBoolean(key);
  },
  setBoolean: (key: string, value: boolean) => {
    if (Platform.OS === 'web') {
      (window as any).localStorage.setItem(key, value.toString());
    } else {
      mmkvStorage?.set(key, value);
    }
  },
  delete: (key: string) => {
    if (Platform.OS === 'web') {
      (window as any).localStorage.removeItem(key);
    } else {
      mmkvStorage?.delete(key);
    }
  },
  clearAll: () => {
    if (Platform.OS === 'web') {
      (window as any).localStorage.clear();
    } else {
      mmkvStorage?.clearAll();
    }
  },
};
