/* Firebase Cloud Messaging background worker for Maxiel Web.
   Deploy on the same origin as index.html (HTTPS required). */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyDpLdeSgX5Yq2FTzNu3J-pVZUuS0MzA8-g",
  authDomain: "coffee-spark-ai-barista-ed3e0.firebaseapp.com",
  projectId: "coffee-spark-ai-barista-ed3e0",
  storageBucket: "coffee-spark-ai-barista-ed3e0.firebasestorage.app",
  messagingSenderId: "615409624579",
  appId: "1:615409624579:web:02354e3d3f6c6ddd5bd036"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || "Maxiel Web";
  const options = {
    body: payload.notification?.body || payload.data?.body || "Ada pengumuman baru.",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: payload.data?.url || "./" }
  };
  self.registration.showNotification(title, options);
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(windows => {
    for (const client of windows) if (client.url.startsWith(self.location.origin) && "focus" in client) return client.focus();
    return clients.openWindow(url);
  }));
});
