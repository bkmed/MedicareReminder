import { Platform } from 'react-native';

// Platform-specific analytics instances
let webAnalytics: any = null;

// Auto-initialize web analytics
if (Platform.OS === 'web') {
    try {
        // Import Firebase modules for web
        const { getAnalytics } = require('firebase/analytics');
        const { app } = require('../config/firebase');

        if (app) {
            webAnalytics = getAnalytics(app);
            console.log('Google Analytics initialized for Web');
        }
    } catch (error) {
        console.warn('Failed to initialize Web Analytics:', error);
    }
}

export const googleAnalytics = {
    logEvent: async (name: string, params?: { [key: string]: any }) => {
        try {
            if (Platform.OS === 'web') {
                if (webAnalytics) {
                    const { logEvent } = require('firebase/analytics');
                    logEvent(webAnalytics, name, params);
                    console.log('[Web Analytics] Event logged:', name, params);
                } else {
                    console.log('[Web Analytics] (Not Initialized) Event:', name, params);
                }
            } else {
                // Only require native analytics on native platforms
                const analytics = require('@react-native-firebase/analytics').default;
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
                    console.log('[Web Analytics] Screen view logged:', screenName);
                }
            } else {
                const analytics = require('@react-native-firebase/analytics').default;
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
                const analytics = require('@react-native-firebase/analytics').default;
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
                const analytics = require('@react-native-firebase/analytics').default;
                await analytics().setUserId(userId);
            }
        } catch (error) {
            console.warn('Error setting user ID:', error);
        }
    },
};
