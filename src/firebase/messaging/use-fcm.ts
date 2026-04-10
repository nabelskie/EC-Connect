
'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Hook to initialize Firebase Cloud Messaging and handle token registration.
 * It respects the user's notification settings in their Firestore profile.
 */
export function useFcm() {
  const { messaging } = useFirebase();
  const { user } = useUser();
  const db = useFirestore();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    // Only run on client and if messaging, user, and profile are available
    if (typeof window === 'undefined' || !messaging || !user || !db || !profile) return;

    // Only proceed if notifications are explicitly enabled in the profile
    if (profile.notificationsEnabled === false) {
      setFcmToken(null);
      return;
    }

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BHh38CGgZpJ89x0p6OUhva-ODJu37Gw9EY-2P3uwkDuuo_K5AOVlD51PmV6dwqEAZDJlR7zdDyZIPZzqSXsUb1k' 
          });

          if (token) {
            setFcmToken(token);
            // Only update if it's different to save writes
            if (profile.fcmToken !== token) {
              await updateDoc(doc(db, 'users', user.uid), { 
                fcmToken: token,
                notificationsEnabled: true 
              });
            }
          }
        }
      } catch (err) {
        console.warn('FCM registration failed:', err);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received: ', payload);
    });

    return () => unsubscribe();
  }, [messaging, user, db, profile]);

  return { fcmToken };
}
