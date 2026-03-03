import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 Your REAL Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA1DH9Ucen4Gxz7Z9lrcXu0HWDAucHjBXo",
  authDomain: "billify-37eba.firebaseapp.com",
  projectId: "billify-37eba",
  storageBucket: "billify-37eba.firebasestorage.app",
  messagingSenderId: "142514767464",
  appId: "1:142514767464:web:f04ee859395cc7eb941ddd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;