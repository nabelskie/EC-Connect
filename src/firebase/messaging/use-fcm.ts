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
          // VAPID Key provided by the user
          const token = await getToken(messaging, {
            vapidKey: 'BHh38CGgZpJ89x0p6OUhva-ODJu37Gw9EY-2P3uwkDuuo_K5AOVlD51PmV6dwqEAZDJlR7zdDyZIPZzqSXsUb1k' 
          });

          if (token) {
            setFcmToken(token);
            // Update the user profile with the token so the system knows where to send notifications
            const userRef = doc(db, 'users', user.uid);
            // Using updateDoc to update only the token field to avoid overwriting other data
            await updateDoc(userRef, { fcmToken: token });
            console.log('FCM Token registered successfully');
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        } else {
          console.warn('Notification permission denied by user.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token: ', err);
      }
    };

    requestPermission();

    // Listen for foreground messages (when the user has the app open)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
      // Foreground messages are handled here. You can add a toast notification if needed.
    });

    return () => unsubscribe();
  }, [messaging, user, db]);

  return { fcmToken };
}
