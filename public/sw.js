importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain:        "collegepanel-1027b.firebaseapp.com",
  projectId:         "collegepanel-1027b",
  storageBucket:     "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: "335340683871",
  appId:             "1:335340683871:web:106aa90d6d30c9c25bd1ea",
});

const messaging = firebase.messaging();

const showNotif = (title, body, data = {}) => {
  return self.registration.showNotification(title, {
    body,
    icon:    "/icon-192.png",
    badge:   "/icon-192.png",
    data,
    vibrate: [200, 100, 200],
    tag:     "college-panel-notif",
    renotify: true,
    requireInteraction: false,
  });
};

// Background FCM message (app closed / tab not focused)
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title || "New Notification";
  const body  = payload.data?.body  || payload.notification?.body  || "";
  showNotif(title, body, payload.data || {});
});

// Raw push event — foreground mein bhi kaam kare
self.addEventListener("push", (event) => {
  let title = "New Notification";
  let body  = "";
  let data  = {};

  if (event.data) {
    try {
      const json = event.data.json();
      // FCM data-only payload
      title = json.data?.title || json.notification?.title || title;
      body  = json.data?.body  || json.notification?.body  || body;
      data  = json.data || {};
    } catch {
      body = event.data.text();
    }
  }

  // Agar foreground mein client open hai to usse message bhejo
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Foreground client ko message bhejo taaki wo bhi update ho sake
      clientList.forEach((client) => {
        client.postMessage({ type: "FCM_PUSH", title, body, data });
      });
      // Notification hamesha show karo
      return showNotif(title, body, data);
    })
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client)
          return client.focus();
      }
      return clients.openWindow("/");
    })
  );
});

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
