import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

let NetInfo: any;
if (Platform.OS !== 'web') {
  try {
    NetInfo = require('@react-native-community/netinfo').default;
  } catch (error) {
    console.warn('NetInfo not available:', error);
  }
}

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(
    Platform.OS === 'web'
      ? typeof window !== 'undefined'
        ? (window as any)['navigator']?.onLine
        : true
      : true,
  );
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;

      const windowObj = window as any;
      const handleOnline = () => setIsConnected(true);
      const handleOffline = () => setIsConnected(false);

      windowObj.addEventListener('online', handleOnline);
      windowObj.addEventListener('offline', handleOffline);

      return () => {
        windowObj.removeEventListener('online', handleOnline);
        windowObj.removeEventListener('offline', handleOffline);
      };
    } else if (NetInfo) {
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        setIsConnected(state.isConnected);
        setIsInternetReachable(state.isInternetReachable);
      });

      return () => unsubscribe();
    }
  }, []);

  return {
    isConnected,
    isInternetReachable:
      Platform.OS === 'web' ? isConnected : isInternetReachable,
    isOffline: isConnected === false,
  };
};

// Check network status once
export const checkNetworkStatus = async () => {
  if (Platform.OS === 'web') {
    const online =
      typeof window !== 'undefined'
        ? (window as any)['navigator']?.onLine
        : true;
    return {
      isConnected: online,
      isInternetReachable: online,
    };
  }

  if (NetInfo) {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
    };
  }

  return { isConnected: true, isInternetReachable: true };
};
