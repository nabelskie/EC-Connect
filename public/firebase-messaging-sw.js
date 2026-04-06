
// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: These should match your client-side config, but are usually safe as placeholders
// since FCM mainly needs the app to be initialized to register the service worker.
firebase.initializeApp({
  apiKey: "AIzaSyB8q6Tf9GH2UKekY_jgEf3s5EE5ydU4tSE",
  authDomain: "studio-7284655464-82114.firebaseapp.com",
  projectId: "studio-7284655464-82114",
  messagingSenderId: "216338507130",
  appId: "1:216338507130:web:9ff77c86fe89f97bfc62c3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
