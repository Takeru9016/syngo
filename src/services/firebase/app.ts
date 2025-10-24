import { initializeApp, getApps } from 'firebase/app';
import Constants from 'expo-constants';

const cfg = Constants.expoConfig?.extra?.firebase as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(cfg);