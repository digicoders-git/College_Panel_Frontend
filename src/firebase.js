import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const getOrRegisterSW = async () => {
  // Pehle existing registration dhundo
  const registrations = await navigator.serviceWorker.getRegistrations();
  const existing = registrations.find((r) =>
    r.active?.scriptURL?.includes("firebase-messaging-sw.js")
  );
  if (existing) return existing;

  // Nahi mila to register karo aur ACTIVATED hone ka wait karo
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await new Promise((resolve) => {
    if (reg.active) return resolve();
    const sw = reg.installing || reg.waiting;
    if (!sw) return resolve();
    sw.addEventListener("statechange", (e) => {
      if (e.target.state === "activated") resolve();
    });
  });
  return reg;
};

export const requestFcmToken = async () => {
  try {
    if (!("Notification" in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await getOrRegisterSW();

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (err) {
    // Silently fail — notification optional feature hai
    return null;
  }
};

export const onForegroundMessage = (callback) => onMessage(messaging, callback);
