// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: These values match your project configuration
firebase.initializeApp({
  apiKey: "AIzaSyB8q6Tf9GH2UKekY_jgEf3s5EE5ydU4tSE",
  authDomain: "studio-7284655464-82114.firebaseapp.com",
  projectId: "studio-7284655464-82114",
  messagingSenderId: "216338507130",
  appId: "1:216338507130:web:9ff77c86fe89f97bfc62c3"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'New Message';
  const notificationOptions = {
    body: payload.notification.body || 'You have received a new update from ElderCare Connect.',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
