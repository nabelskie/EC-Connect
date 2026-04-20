'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Hook to initialize Firebase Cloud Messaging and handle token registration.
 * It handles both Web and Native (Android/iOS) registration using Capacitor.
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
    // Only run on client and if user and profile are available
    if (typeof window === 'undefined' || !user || !db || !profile) return;

    // Only proceed if notifications are explicitly enabled in the profile
    if (profile.notificationsEnabled === false) {
      setFcmToken(null);
      return;
    }

    const isNative = Capacitor.isNativePlatform();

    const registerNativeNotifications = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('Push notification permissions denied by user.');
          return;
        }

        // Register with Apple / Google for a device token
        await PushNotifications.register();

        // Listen for the specific FCM token
        PushNotifications.addListener('registration', async (token) => {
          const newToken = token.value;
          setFcmToken(newToken);
          
          // Only update if it's different to save writes
          if (profile.fcmToken !== newToken) {
            await updateDoc(doc(db, 'users', user.uid), { 
              fcmToken: newToken,
              notificationsEnabled: true 
            });
          }
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('FCM Registration error: ', err.error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received in foreground: ', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ', notification);
        });

      } catch (err) {
        console.warn('Native Push registration failed:', err);
      }
    };

    const registerWebNotifications = async () => {
      if (!messaging) return;
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
        console.warn('Web FCM registration failed:', err);
      }
    };

    if (isNative) {
      registerNativeNotifications();
    } else {
      registerWebNotifications();
    }

    // Foreground listener for Web
    let unsubscribeWeb: any = null;
    if (!isNative && messaging) {
      unsubscribeWeb = onMessage(messaging, (payload) => {
        console.log('Foreground web message received: ', payload);
      });
    }

    return () => {
      if (isNative) {
        PushNotifications.removeAllListeners();
      }
      if (unsubscribeWeb) unsubscribeWeb();
    };
  }, [messaging, user, db, profile]);

  return { fcmToken };
}