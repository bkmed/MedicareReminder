/**
 * Redux Store Configuration with MMKV Persistence
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { storageService } from '../../services/storage';
import appReducer from './slices/appSlice';
import medicationReducer from './slices/medicationSlice';
import appointmentReducer from './slices/appointmentSlice';
import doctorReducer from './slices/doctorSlice';
import prescriptionReducer from './slices/prescriptionSlice';

import analyticsReducer from './slices/analyticsSlice';

// Create Redux Persist storage adapter using MMKV
const reduxPersistMMKVStorage = {
  setItem: (key: string, value: string) => {
    storageService.setString(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storageService.getString(key);
    return Promise.resolve(value || null);
  },
  removeItem: (key: string) => {
    storageService.delete(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: reduxPersistMMKVStorage,
  whitelist: [
    'app',
    'medications',
    'appointments',
    'doctors',
    'prescriptions',
    'analytics',
  ],
};

const rootReducer = combineReducers({
  app: appReducer,
  medications: medicationReducer,
  appointments: appointmentReducer,
  doctors: doctorReducer,
  prescriptions: prescriptionReducer,
  analytics: analyticsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
