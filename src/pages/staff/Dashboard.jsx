import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
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

export default function StaffDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState({ pending: 0, approved: 0, disapproved: 0 });

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
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-500 mb-6">Branch: {user?.branch?.branchName || "Not assigned"} | Role: {user?.role?.roleName || "—"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CopyLinkCard code={user?.college?.collegeCode} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Pending Students",     value: students.pending,     icon: GraduationCap, color: "bg-yellow-500" },
          { label: "Approved Students",    value: students.approved,    icon: GraduationCap, color: "bg-green-500" },
          { label: "Disapproved Students", value: students.disapproved, icon: GraduationCap, color: "bg-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}><Icon size={22} className="text-white" /></div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Notices",    icon: Bell,          link: "/staff/notices",   color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Timetable",  icon: Clock,         link: "/staff/timetable", color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Calendar",   icon: Calendar,      link: "/staff/calendar",  color: "bg-green-50 text-green-700 border-green-200" },
        ].map(({ label, icon: Icon, link, color }) => (
          <a key={label} href={link} className={`rounded-xl border p-5 flex items-center gap-3 hover:shadow-md transition ${color}`}>
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
