import { Platform } from 'react-native';

// Platform-specific storage implementation
let storage: any = null;

if (Platform.OS !== 'web') {
    // Only import MMKV on native platforms
    const { MMKV } = require('react-native-mmkv');
    storage = new MMKV();
}

// Web-compatible storage using localStorage
const webStorage = {
    getString: (key: string): string | undefined => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key) || undefined;
        }
        return undefined;
    },
    setString: (key: string, value: string): void => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    },
    getNumber: (key: string): number | undefined => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const value = window.localStorage.getItem(key);
            return value ? parseFloat(value) : undefined;
        }
        return undefined;
    },
    setNumber: (key: string, value: number): void => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value.toString());
        }
    },
    getBoolean: (key: string): boolean | undefined => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const value = window.localStorage.getItem(key);
            return value === 'true' ? true : value === 'false' ? false : undefined;
        }
        return undefined;
    },
    setBoolean: (key: string, value: boolean): void => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value.toString());
        }
    },
    delete: (key: string): void => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    },
    clearAll: (): void => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
        }
    },
};

export const storageService = {
    getString: (key: string) => Platform.OS === 'web' ? webStorage.getString(key) : storage?.getString(key),
    setString: (key: string, value: string) => Platform.OS === 'web' ? webStorage.setString(key, value) : storage?.set(key, value),
    getNumber: (key: string) => Platform.OS === 'web' ? webStorage.getNumber(key) : storage?.getNumber(key),
    setNumber: (key: string, value: number) => Platform.OS === 'web' ? webStorage.setNumber(key, value) : storage?.set(key, value),
    getBoolean: (key: string) => Platform.OS === 'web' ? webStorage.getBoolean(key) : storage?.getBoolean(key),
    setBoolean: (key: string, value: boolean) => Platform.OS === 'web' ? webStorage.setBoolean(key, value) : storage?.set(key, value),
    delete: (key: string) => Platform.OS === 'web' ? webStorage.delete(key) : storage?.delete(key),
    clearAll: () => Platform.OS === 'web' ? webStorage.clearAll() : storage?.clearAll(),
};
