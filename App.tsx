import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';

const App = () => {
  useEffect(() => {
    // Initialize notifications (native only)
    // Note: MMKV storage is ready to use immediately, no initialization needed
    const initialize = async () => {
      try {
        // Only initialize native modules on iOS/Android
        if (Platform.OS !== 'web') {
          await notificationService.initialize();
          console.log('App initialized successfully');
        } else {
          console.log('Running on web - MMKV storage ready via localStorage');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
