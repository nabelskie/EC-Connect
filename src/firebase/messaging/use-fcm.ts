
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
    if (!messaging || !user || !db) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // IMPORTANT: Replace with your actual VAPID key from Firebase Console
          const token = await getToken(messaging, {
            vapidKey: 'YOUR_VAPID_KEY_HERE' 
          });

          if (token) {
            setFcmToken(token);
            // Update the user profile with the token for background notifications
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { fcmToken: token });
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // You can implement custom toast notifications here for foreground messages
    });

    return () => unsubscribe();
  }, [messaging, user, db]);

  return { fcmToken };
}
