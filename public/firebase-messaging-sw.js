importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCq-j90-OUMIqRYGOSv6JiFVIpMz7z6qkQ",
  authDomain: "anonymousme-90e67.firebaseapp.com",
  projectId: "anonymousme-90e67",
  storageBucket: "anonymousme-90e67.firebasestorage.app",
  messagingSenderId: "1057738338232",
  appId: "1:1057738338232:web:b6b37d8b414e803013694d",
  measurementId: "G-MSK5HLY671"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});