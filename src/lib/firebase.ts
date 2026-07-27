import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA9lmj12Shiphb0sZLm-QmVUVYHOukElEs",
  authDomain: "indralok-cloth-market.firebaseapp.com",
  projectId: "indralok-cloth-market",
  storageBucket: "indralok-cloth-market.firebasestorage.app",
  messagingSenderId: "647810314949",
  appId: "1:647810314949:web:5112d07f8552b881e776ac",
  measurementId: "G-CKX3240LJV"
};

// Initialize Firebase App, Cloud Firestore & Cloud Storage
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
