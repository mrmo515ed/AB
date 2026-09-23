import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessagingSafe, getDb, getAuth, firebaseConfig } from '../config/firebase';
import { observability } from '../services/observability';

export class FCMNotificationManager {
  private static vapidKey = 'BPh...'; // Public VAPID or default FCM key

  /**
   * Request push notification permission and register FCM device token
   */
  public static async requestPermissionAndRegisterToken(): Promise<string | null> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[FCM] Notifications not supported in this browser.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[FCM] Notification permission was not granted:', permission);
        return null;
      }

      const messaging = (await getMessagingSafe()) as any;
      if (!messaging) return null;

      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        // Save FCM token to user document if logged in
        const user = (getAuth() as any).currentUser;
        if (user) {
          const userRef = doc(getDb() as any, 'users', user.uid);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(currentToken),
            lastActive: Date.now()
          }).catch(() => {
            // Ignore if doc creation pending
          });
        }
        return currentToken;
      }

      return null;
    } catch (error) {
      observability.captureError(error, { context: 'fcm_token_registration_failed' });
      return null;
    }
  }

  /**
   * Set up foreground notification listener
   */
  public static async initForegroundListener(onNotification: (payload: any) => void): Promise<(() => void) | null> {
    try {
      const messaging = (await getMessagingSafe()) as any;
      if (!messaging) return null;

      const unsub = onMessage(messaging, (payload) => {
        onNotification(payload);
      });

      return unsub;
    } catch (e) {
      console.warn('[FCM] Foreground listener init skipped:', e);
      return null;
    }
  }
}
