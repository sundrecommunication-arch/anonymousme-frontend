import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCq-j90-OUMIqRYGOSv6JiFVIpMz7z6qkQ",
  authDomain: "anonymousme-90e67.firebaseapp.com",
  projectId: "anonymousme-90e67",
  storageBucket: "anonymousme-90e67.firebasestorage.app",
  messagingSenderId: "1057738338232",
  appId: "1:1057738338232:web:b6b37d8b414e803013694d",
  measurementId: "G-MSK5HLY671"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BIdTdcj8wz3q0ian8V6U1tNwZG7reqZMGCqigCYVpbkarLh8JWWEEHeV8re4zT0luN7emWQoIATi6UQEM0YNoQE'
      });
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default messaging;