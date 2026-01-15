import { Platform, Linking } from 'react-native';
// Lazy load native modules
let RNPermissions: any;
let notifee: any;
let AuthorizationStatus: any;

if (Platform.OS !== 'web') {
  try {
    RNPermissions = require('react-native-permissions');
    const notifeeModule = require('@notifee/react-native');
    notifee = notifeeModule.default;
    AuthorizationStatus = notifeeModule.AuthorizationStatus;
  } catch (error) {
    console.warn('Native modules for permissions not available:', error);
  }
}

// Declare web-only globals
declare global {
  interface Navigator {
    permissions?: {
      query(permissionDesc: { name: string }): Promise<{ state: string }>;
    };
    mediaDevices?: {
      getUserMedia(constraints: {
        video?: boolean;
        audio?: boolean;
      }): Promise<MediaStream>;
    };
  }
  interface MediaStream {
    getTracks(): Array<{ stop(): void }>;
  }
  interface Window {
    Notification?: {
      permission: 'granted' | 'denied' | 'default';
      requestPermission(): Promise<'granted' | 'denied' | 'default'>;
    };
    localStorage: {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
      removeItem(key: string): void;
    };
  }
  const Notification: {
    permission: 'granted' | 'denied' | 'default';
    requestPermission(): Promise<'granted' | 'denied' | 'default'>;
  };
  const localStorage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  type PermissionName =
    | 'camera'
    | 'microphone'
    | 'geolocation'
    | 'notifications'
    | 'persistent-storage'
    | 'midi'
    | 'push'
    | 'background-fetch'
    | 'periodic-background-sync'
    | 'accelerometer'
    | 'gyroscope'
    | 'magnetometer'
    | 'ambient-light-sensor';
  type PermissionState = 'granted' | 'denied' | 'prompt';
}

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'limited';

class PermissionsService {
  /**
   * Check camera permission status
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      // Web: Use both MediaDevices API and Permissions API
      const nav = typeof window !== 'undefined' && (window as any).navigator;
      if (nav?.permissions?.query) {
        try {
          const result = await nav.permissions.query({ name: 'camera' });
          return this.mapWebPermissionState(result.state);
        } catch (error) {
          // Fallback to MediaDevices check if permissions API fails
          if (nav.mediaDevices?.getUserMedia) {
            return 'denied'; // Can't determine without requesting
          }
        }
      } else if (nav?.mediaDevices?.getUserMedia) {
        // Browser supports camera but not permissions query
        return 'denied'; // Need to request to know actual status
      }
      return 'unavailable';
    }

    // Mobile: Use react-native-permissions
    const permission =
      Platform.OS === 'ios'
        ? RNPermissions.PERMISSIONS.IOS.CAMERA
        : RNPermissions.PERMISSIONS.ANDROID.CAMERA;
    const result = await RNPermissions.check(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      const nav = typeof window !== 'undefined' && (window as any).navigator;
      if (nav?.mediaDevices?.getUserMedia) {
        try {
          const stream = await nav.mediaDevices.getUserMedia({ video: true });
          // Stop the stream immediately after getting permission
          stream.getTracks().forEach((track: any) => track.stop());
          return 'granted';
        } catch (error: any) {
          if (
            error.name === 'NotAllowedError' ||
            error.name === 'PermissionDeniedError'
          ) {
            return 'blocked';
          }
          return 'denied';
        }
      }
      return 'unavailable';
    }

    // Mobile: Request permission
    const permission =
      Platform.OS === 'ios'
        ? RNPermissions.PERMISSIONS.IOS.CAMERA
        : RNPermissions.PERMISSIONS.ANDROID.CAMERA;
    const result = await RNPermissions.request(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Check notification permission status
   */
  async checkNotificationPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      // Web: Use Permissions API with fallback to Notification API
      try {
        const nav = typeof window !== 'undefined' && (window as any).navigator;
        if (nav?.permissions?.query) {
          const result = await nav.permissions.query({
            name: 'notifications',
          });
          return this.mapWebPermissionState(result.state);
        }
      } catch (error) {
        // Ignore and fall back
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = Notification.permission;
        if (permission === 'granted') return 'granted';
        if (permission === 'denied') return 'blocked';
        return 'denied';
      }
      return 'unavailable';
    }

    // Mobile: Notifications are handled by notifee
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED)
      return 'granted';
    if (settings.authorizationStatus === AuthorizationStatus.DENIED)
      return 'denied';
    return 'unavailable';
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') return 'granted';
          if (permission === 'denied') return 'blocked';
          return 'denied';
        } catch (error) {
          return 'denied';
        }
      }
      return 'unavailable';
    }

    // Mobile: handled by notifee
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED)
      return 'granted';
    if (settings.authorizationStatus === AuthorizationStatus.DENIED)
      return 'denied';
    return 'unavailable';
  }

  /**
   * Check calendar permission status
   */
  async checkCalendarPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      // Web: Use localStorage to track calendar permission preference
      if (typeof window !== 'undefined' && window.localStorage) {
        const permission = localStorage.getItem('calendar-permission');
        if (permission === 'granted') return 'granted';
        return 'denied';
      }
      return 'unavailable';
    }

    // Mobile: Use react-native-permissions
    const permission =
      Platform.OS === 'ios'
        ? RNPermissions.PERMISSIONS.IOS.CALENDARS
        : RNPermissions.PERMISSIONS.ANDROID.WRITE_CALENDAR;
    const result = await RNPermissions.check(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Request calendar permission
   */
  async requestCalendarPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'web') {
      // Web: Store permission preference in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('calendar-permission', 'granted');
          return 'granted';
        } catch (error) {
          return 'denied';
        }
      }
      return 'unavailable';
    }

    // Mobile: Request permission
    const permission =
      Platform.OS === 'ios'
        ? RNPermissions.PERMISSIONS.IOS.CALENDARS
        : RNPermissions.PERMISSIONS.ANDROID.WRITE_CALENDAR;
    const result = await RNPermissions.request(permission);
    return this.mapNativePermissionStatus(result);
  }

  /**
   * Map web permission state to our PermissionStatus
   */
  private mapWebPermissionState(state: PermissionState): PermissionStatus {
    switch (state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'blocked';
      case 'prompt':
        return 'denied';
      default:
        return 'denied';
    }
  }

  /**
   * Map native permission status to our PermissionStatus
   */
  private mapNativePermissionStatus(status: string): PermissionStatus {
    switch (status) {
      case RNPermissions.RESULTS.GRANTED:
        return 'granted';
      case RNPermissions.RESULTS.DENIED:
        return 'denied';
      case RNPermissions.RESULTS.BLOCKED:
        return 'blocked';
      case RNPermissions.RESULTS.LIMITED:
        return 'limited';
      case RNPermissions.RESULTS.UNAVAILABLE:
        return 'unavailable';
      default:
        return 'denied';
    }
  }

  async openAppSettings(): Promise<void> {
    if (Platform.OS === 'web') {
      require('./globalNotificationService').globalNotificationService.show({
        title: 'Permissions',
        message: 'Please check your browser settings to manage permissions.',
        type: 'info',
        buttons: [{ text: 'OK', onPress: () => {} }],
      });
      return;
    }

    try {
      await RNPermissions.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }
}

export const permissionsService = new PermissionsService();
