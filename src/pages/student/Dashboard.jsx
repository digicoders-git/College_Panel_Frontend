import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { requestFcmToken } from "../../firebase";
import api from "../../api/axios";
import { Bell, Clock, Calendar, User } from "lucide-react";

const ActionCard = ({ label, icon: Icon, link, color }) => (
  <a 
    href={link} 
    className={`rounded-3xl border p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-all duration-300 bg-white group hover:-translate-y-2 ${color}`}
  >
    <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors shadow-sm">
      <Icon size={28} />
    </div>
    <span className="font-black text-slate-700 tracking-tight text-lg">{label}</span>
  </a>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      setShowNotifBanner(true);
    }
  }, []);

  const handleAllowNotif = async () => {
    setShowNotifBanner(false);
    const fcmToken = await requestFcmToken();
    if (fcmToken && fcmToken !== localStorage.getItem("fcmToken")) {
      await api.patch("/notifications/fcm-token", { fcmToken }).catch(() => {});
      localStorage.setItem("fcmToken", fcmToken);
    }
  };

  return (
    <div className="space-y-10 animate-loader-fade-in">
      {showNotifBanner && (
        <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Bell size={120} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">Stay Updated!</p>
              <p className="text-blue-100 text-sm font-medium">Allow notifications for real-time updates.</p>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <button onClick={() => setShowNotifBanner(false)} className="px-5 py-2.5 text-xs font-bold text-white/70 hover:text-white transition-colors">Maybe later</button>
            <button onClick={handleAllowNotif} className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-blue-50 transition-all">Allow Now</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Hub</h1>
          <p className="text-slate-500 font-medium mt-1">Focus on your learning and schedules</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            {user?.name?.[0] || 'S'}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Roll: {user?.rollNo || "N/A"}</p>
          </div>
        </div>
      </header>

      {user?.status === "pending" && (
        <div className="bg-amber-600 rounded-[2rem] p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Clock size={160} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black tracking-tight mb-2">Registration Pending</h3>
            <p className="text-amber-50 font-medium">Your account is currently under review by the college staff. You'll get access to all features once approved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Notices",    icon: Bell,     link: "/student/notices",    color: "hover:border-blue-200 text-blue-600" },
          { label: "Timetable",  icon: Clock,    link: "/student/timetable",  color: "hover:border-purple-200 text-purple-600" },
          { label: "Calendar",   icon: Calendar, link: "/student/calendar",   color: "hover:border-emerald-200 text-emerald-600" },
          { label: "Settings",   icon: User,     link: "/student/profile",    color: "hover:border-rose-200 text-rose-600" },
        ].map((item) => (
          <ActionCard key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
