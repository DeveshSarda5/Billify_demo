import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const firebaseConfig = {
  apiKey: "AIzaSyCJuGEBwmZZEkUVzNMSMAyDZ57WDeFye2w",
  authDomain: "billify-37eba.firebaseapp.com",
  projectId: "billify-37eba",
  storageBucket: "billify-37eba.firebasestorage.app",
  messagingSenderId: "142514767464",
  appId: "1:142514767464:web:f04ee859395cc7eb941ddd"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;