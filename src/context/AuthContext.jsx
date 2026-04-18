import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { requestFcmToken, onForegroundMessage } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [role, setRole] = useState(() => localStorage.getItem("role") || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const saveFcmToken = async () => {
    const currentRole = localStorage.getItem("role");
    if (!currentRole || currentRole === "superadmin") return;

    try {
      const fcmToken = await requestFcmToken();
      if (!fcmToken) return;

      const savedToken = localStorage.getItem("fcmToken");
      if (savedToken === fcmToken) return; // same token, skip

      await api.patch("/notifications/fcm-token", { fcmToken });
      localStorage.setItem("fcmToken", fcmToken);
    } catch {
      // silent fail
    }
  };

  const slimUser = (user, role) => {
    if (!user) return user;
    const { password, __v, ...rest } = user;
    if (role === "student") {
      const { personalDetails, academicDetails, profilePic, ...studentRest } = rest;
      return {
        ...studentRest,
        college: user.college ? { _id: user.college._id, collegeName: user.college.collegeName, collegeCode: user.college.collegeCode, logo: user.college.logo, appName: user.college.appName, themeColorPrimary: user.college.themeColorPrimary, themeColorSecondary: user.college.themeColorSecondary } : user.college,
        branch: user.branch ? { _id: user.branch._id, branchName: user.branch.branchName, branchCode: user.branch.branchCode } : user.branch,
      };
    }
    return rest;
  };

  const login = async (data) => {
    const userToStore = slimUser(data.user, data.role);
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(userToStore));
    // Clear old token so fresh one gets saved
    localStorage.removeItem("fcmToken");
    setToken(data.token);
    setRole(data.role);
    setUser(userToStore);

    if (data.role !== "superadmin") {
      saveFcmToken();
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  // App load pe already logged in user ka FCM token refresh karo
  useEffect(() => {
    if (token && role && role !== "superadmin") {
      saveFcmToken();
    }
  }, []);

  // Foreground notification — SW se postMessage receive karo
  useEffect(() => {
    if (!token || role === "superadmin") return;

    // FCM onMessage — foreground Firebase handler
    const unsubscribeFcm = onForegroundMessage((payload) => {
      const title = payload.data?.title || payload.notification?.title || "New Notification";
      const body  = payload.data?.body  || payload.notification?.body  || "";
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon:     "/icon-192.png",
            badge:    "/icon-192.png",
            vibrate:  [200, 100, 200],
            tag:      "college-panel-notif",
            renotify: true,
          });
        });
      }
    });

    // SW postMessage — push event se aaya message
    const handleSwMessage = (event) => {
      if (event.data?.type === "FCM_PUSH") {
        const { title, body } = event.data;
        if (Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon:     "/icon-192.png",
              badge:    "/icon-192.png",
              vibrate:  [200, 100, 200],
              tag:      "college-panel-notif",
              renotify: true,
            });
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSwMessage);

    return () => {
      if (typeof unsubscribeFcm === "function") unsubscribeFcm();
      navigator.serviceWorker.removeEventListener("message", handleSwMessage);
    };
  }, [token, role]);

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
