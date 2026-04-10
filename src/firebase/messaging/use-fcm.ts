
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc } from 'firebase/firestore';

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
          // VAPID Key provided for the project
          const token = await getToken(messaging, {
            vapidKey: 'BHh38CGgZpJ89x0p6OUhva-ODJu37Gw9EY-2P3uwkDuuo_K5AOVlD51PmV6dwqEAZDJlR7zdDyZIPZzqSXsUb1k' 
          });

          if (token) {
            setFcmToken(token);
            // Update the user profile with the token using non-blocking set with merge
            // This is safer than updateDoc as it won't fail if the doc is still being provisioned
            const userRef = doc(db, 'users', user.uid);
            setDocumentNonBlocking(userRef, { fcmToken: token }, { merge: true });
          }
        }
      } catch (err) {
        // Silently handle errors for FCM to prevent UI disruption
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
    });

    return () => unsubscribe();
  }, [messaging, user, db]);

  return { fcmToken };
}
