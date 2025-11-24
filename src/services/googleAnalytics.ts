import { Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';
// For web, we'll import dynamically or use a conditional require to avoid native crashes
// import { getAnalytics, logEvent as logEventWeb } from 'firebase/analytics';

let webAnalytics: any;

// Initialize Web Analytics (This should be called after Firebase App is initialized)
export const initWebAnalytics = (app: any) => {
    if (Platform.OS === 'web') {
        try {
            const { getAnalytics } = require('firebase/analytics');
            webAnalytics = getAnalytics(app);
            console.log('Google Analytics initialized for Web');
        } catch (error) {
            console.warn('Failed to initialize Web Analytics:', error);
        }
    }
};

export const googleAnalytics = {
    logEvent: async (name: string, params?: { [key: string]: any }) => {
        try {
            if (Platform.OS === 'web') {
                if (webAnalytics) {
                    const { logEvent } = require('firebase/analytics');
                    logEvent(webAnalytics, name, params);
                } else {
                    console.log('[Web Analytics] (Not Initialized) Event:', name, params);
                }
            } else {
                await analytics().logEvent(name, params);
            }
        } catch (error) {
            console.warn('Error logging event:', error);
        }
    },

    logScreenView: async (screenName: string, screenClass: string = screenName) => {
        try {
            if (Platform.OS === 'web') {
                if (webAnalytics) {
                    const { logEvent } = require('firebase/analytics');
                    logEvent(webAnalytics, 'screen_view', {
                        firebase_screen: screenName,
                        firebase_screen_class: screenClass,
                    });
                }
            } else {
                await analytics().logScreenView({
                    screen_name: screenName,
                    screen_class: screenClass,
                });
            }
        } catch (error) {
            console.warn('Error logging screen view:', error);
        }
    },

    setUserProperty: async (name: string, value: string) => {
        try {
            if (Platform.OS === 'web') {
                if (webAnalytics) {
                    const { setUserProperties } = require('firebase/analytics');
                    setUserProperties(webAnalytics, { [name]: value });
                }
            } else {
                await analytics().setUserProperty(name, value);
            }
        } catch (error) {
            console.warn('Error setting user property:', error);
        }
    },

    setUserId: async (userId: string | null) => {
        try {
            if (Platform.OS === 'web') {
                if (webAnalytics) {
                    const { setUserId } = require('firebase/analytics');
                    setUserId(webAnalytics, userId);
                }
            } else {
                await analytics().setUserId(userId);
            }
        } catch (error) {
            console.warn('Error setting user ID:', error);
        }
    },
};
