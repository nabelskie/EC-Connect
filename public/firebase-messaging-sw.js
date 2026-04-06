
// This script runs in the background to handle push notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// IMPORTANT: These values must match your src/firebase/config.ts
firebase.initializeApp({
  "projectId": "studio-7284655464-82114",
  "appId": "1:216338507130:web:9ff77c86fe89f97bfc62c3",
  "apiKey": "AIzaSyB8q6Tf9GH2UKekY_jgEf3s5EE5ydU4tSE",
  "authDomain": "studio-7284655464-82114.firebaseapp.com",
  "messagingSenderId": "216338507130"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Or a custom icon URL
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
