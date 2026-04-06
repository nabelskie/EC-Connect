
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser, useFirestore } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Hook to initialize Firebase Cloud Messaging and handle token registration.
 */
export function useFcm() {
  const { messaging } = useFirebase();
  const { user } = useUser();
  const db = useFirestore();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client and if all services are available
    if (typeof window === 'undefined' || !messaging || !user || !db) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // STEP 7: Replace 'YOUR_VAPID_KEY_HERE' with the key from your Firebase Console
          // Project Settings > Cloud Messaging > Web Push certificates
          const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY_HERE' 
          });

          if (token) {
            setFcmToken(token);
            // Update the user profile with the token so the backend knows where to send notifications
            const userRef = doc(db, 'users', user.uid);
            // We use updateDoc to only update the token field
            await updateDoc(userRef, { fcmToken: token });
            console.log('FCM Token registered:', token);
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        } else {
          console.warn('Notification permission denied.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermission();

    // Listen for foreground messages (when the user has the app open)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      // Foreground messages don't automatically show a system notification
      // You could trigger a custom UI toast here if desired.
    });

    return () => unsubscribe();
  }, [messaging, user, db]);

  return { fcmToken };
}
