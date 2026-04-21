import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { requestFcmToken } from "../../firebase";
import { GraduationCap, Bell, Calendar, Clock, Copy, Check } from "lucide-react";

const CopyLinkCard = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/register?collegeCode=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 font-bold">Student Registration Link</p>
        <button onClick={handleCopy} className={`p-2 rounded-lg transition ${copied ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2 overflow-hidden">
        <span className="text-xs text-gray-500 truncate select-all">{link}</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-blue-900/5 group hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ label, icon: Icon, link, color }) => (
  <a 
    href={link} 
    className={`rounded-3xl border p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-300 bg-white group hover:-translate-y-1 ${color}`}
  >
    <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
      <Icon size={24} />
    </div>
    <span className="font-black text-slate-700 tracking-tight">{label}</span>
  </a>
);

export default function StaffDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState({ pending: 0, approved: 0, disapproved: 0 });
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

  useEffect(() => {
    api.get("/students/branch")
      .then((r) => {
        const list = r.data.students || [];
        setStudents({
          pending:     list.filter(s => s.status === "pending").length,
          approved:    list.filter(s => s.status === "approved").length,
          disapproved: list.filter(s => s.status === "disapproved").length,
        });
      })
      .catch(() => {});
  }, []);

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
              <p className="text-blue-100 text-sm font-medium">Allow notifications for real-time student registration alerts.</p>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <button onClick={() => setShowNotifBanner(false)} className="px-5 py-2.5 text-xs font-bold text-white/70 hover:text-white transition-colors">Maybe later</button>
            <button onClick={handleAllowNotif} className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-blue-50 transition-all">Allow Now</button>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user?.name}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-lg">{user?.branch?.branchName || "Academic"}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-lg">{user?.role?.roleName}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Pending Approval"     value={students.pending}     icon={GraduationCap} color="bg-amber-500" />
        <StatCard label="Approved Pupils"    value={students.approved}    icon={GraduationCap} color="bg-emerald-500" />
        <StatCard label="Disapproved"        value={students.disapproved} icon={GraduationCap} color="bg-rose-500" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard label="Notices"    icon={Bell}          link="/staff/notices"   color="hover:border-blue-200" />
          <ActionCard label="Timetable"  icon={Clock}         link="/staff/timetable" color="hover:border-purple-200" />
          <ActionCard label="Calendar"   icon={Calendar}      link="/staff/calendar"  color="hover:border-emerald-200" />
        </div>
      </section>
    </div>
  );
}
