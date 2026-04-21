// 🔥 Firebase imports
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// 🔥 Firebase init
firebase.initializeApp({
  apiKey: "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain: "collegepanel-1027b.firebaseapp.com",
  projectId: "collegepanel-1027b",
  storageBucket: "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: "335340683871",
  appId: "1:335340683871:web:106aa90d6d30c9c25bd1ea",
});

const messaging = firebase.messaging();

// 🔥 CACHE SETUP
const CACHE_NAME = "college-pwa-v2";
const STATIC_ASSETS = ["/", "/index.html", "/offline.html"];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});

// 🔥 FETCH (PWA + API caching)
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open("api-cache").then((cache) => {
            cache.put(event.request, clone);
          });
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return res;
      })
      .catch(() =>
        caches.match(event.request).then(
          (res) => res || caches.match("/offline.html")
        )
      )
  );
});

// 🔔 Notification function
const showNotif = (title, body, data = {}) => {
  return self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data,
    vibrate: [200, 100, 200],
  });
};

// 🔔 Background FCM
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title || "New Notification";
  const body = payload.data?.body || payload.notification?.body || "";
  showNotif(title, body, payload.data || {});
});

// 🔔 Push event
self.addEventListener("push", (event) => {
  let title = "New Notification";
  let body = "";
  let data = {};

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.data?.title || json.notification?.title || title;
      body = json.data?.body || json.notification?.body || body;
      data = json.data || {};
    } catch {
      body = event.data.text();
    }
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      clientsArr.forEach((client) => {
        client.postMessage({ type: "FCM_PUSH", title, body, data });
      });
      return showNotif(title, body, data);
    })
  );
});

// 🔔 Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(self.location.origin)) return client.focus();
      }
      return clients.openWindow("/");
    })
  );
});