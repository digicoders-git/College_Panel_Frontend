import { useAuth } from "../../context/AuthContext";
import { Bell, Clock, Calendar, User } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome, {user?.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {user?.college?.collegeName} · {user?.branch?.branchName}
      </p>

      {/* Status Banner */}
      {user?.status === "approved" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-sm font-medium">
          ✅ Your registration is approved
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Notices",    icon: Bell,     link: "/student/notices",    color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Timetable",  icon: Clock,    link: "/student/timetable",  color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Calendar",   icon: Calendar, link: "/student/calendar",   color: "bg-green-50 text-green-700 border-green-200" },
          { label: "Profile",    icon: User,     link: "/student/profile",    color: "bg-orange-50 text-orange-700 border-orange-200" },
        ].map(({ label, icon: Icon, link, color }) => (
          <a key={label} href={link} className={`rounded-xl border p-5 flex flex-col items-center gap-2 hover:shadow-md transition ${color}`}>
            <Icon size={24} />
            <span className="font-medium text-sm">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
