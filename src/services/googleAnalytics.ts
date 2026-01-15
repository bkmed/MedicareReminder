import { Platform } from 'react-native';

// Typing for analytics objects
interface AnalyticsService {
  logEvent: (name: string, params?: { [key: string]: any }) => Promise<void>;
  logScreenView: (screenName: string, screenClass?: string) => Promise<void>;
  setUserProperty: (name: string, value: string) => Promise<void>;
  setUserId: (userId: string | null) => Promise<void>;
}

let nativeAnalytics: any;
let webAnalytics: any;
let firebaseWeb: any;

if (Platform.OS !== 'web') {
  try {
    nativeAnalytics = require('@react-native-firebase/analytics').default;
  } catch (error) {
    console.warn('Native Analytics not available:', error);
  }
} else {
  try {
    const {
      getAnalytics,
      logEvent,
      setUserProperties,
      setUserId,
    } = require('firebase/analytics');
    const { app } = require('../config/firebase');
    if (app) {
      webAnalytics = getAnalytics(app);
      firebaseWeb = { logEvent, setUserProperties, setUserId };
    }
  } catch (error) {
    console.warn('Web Analytics not available:', error);
  }
}

export const googleAnalytics: AnalyticsService = {
  logEvent: async (name: string, params?: { [key: string]: any }) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics && firebaseWeb) {
          firebaseWeb.logEvent(webAnalytics, name, params);
        }
      } else if (typeof nativeAnalytics === 'function') {
        await nativeAnalytics().logEvent(name, params);
      }
      console.log(`[${Platform.OS} Analytics] Event logged:`, name, params);
    } catch (error) {
      console.warn('Error logging event:', error);
    }
  },

  logScreenView: async (
    screenName: string,
    screenClass: string = screenName,
  ) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics && firebaseWeb) {
          firebaseWeb.logEvent(webAnalytics, 'screen_view', {
            firebase_screen: screenName,
            firebase_screen_class: screenClass,
          });
        }
      } else if (typeof nativeAnalytics === 'function') {
        await nativeAnalytics().logScreenView({
          screen_name: screenName,
          screen_class: screenClass,
        });
      }
      console.log(`[${Platform.OS} Analytics] Screen view logged:`, screenName);
    } catch (error) {
      console.warn('Error logging screen view:', error);
    }
  },

  setUserProperty: async (name: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics && firebaseWeb) {
          firebaseWeb.setUserProperties(webAnalytics, { [name]: value });
        }
      } else if (typeof nativeAnalytics === 'function') {
        await nativeAnalytics().setUserProperty(name, value);
      }
    } catch (error) {
      console.warn('Error setting user property:', error);
    }
  },

  setUserId: async (userId: string | null) => {
    try {
      if (Platform.OS === 'web') {
        if (webAnalytics && firebaseWeb) {
          firebaseWeb.setUserId(webAnalytics, userId);
        }
      } else if (typeof nativeAnalytics === 'function') {
        await nativeAnalytics().setUserId(userId);
      }
    } catch (error) {
      console.warn('Error setting user ID:', error);
    }
  },
};
