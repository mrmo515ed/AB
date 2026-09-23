import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with bounded multi-tab client cache and the exact firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Cloud Messaging conditionally if supported by the browser environment
export async function getMessagingSafe() {
  try {
    const supported = await isMessagingSupported();
    if (supported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn('[FCM] Messaging not supported in this runtime environment:', err);
  }
  return null;
}

export { firebaseConfig };
