import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Building2, Users, GitBranch, GraduationCap } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/super-admin/dashboard")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"));
  }, []);

  const ov = data?.overview;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Colleges"  value={ov?.totalColleges}  icon={Building2}     color="bg-blue-500" />
        <StatCard label="Active Colleges" value={ov?.activeColleges} icon={Building2}     color="bg-green-500" />
        <StatCard label="Total Branches"  value={ov?.totalBranches}  icon={GitBranch}     color="bg-purple-500" />
        <StatCard label="Total Staff"     value={ov?.totalStaff}     icon={Users}         color="bg-orange-500" />
        <StatCard label="Total Students"  value={ov?.totalStudents}  icon={GraduationCap} color="bg-pink-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-700">Colleges Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["College", "Code", "Type", "Branches", "Staff", "Students", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.colleges?.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.collegeName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.collegeCode}</td>
                  <td className="px-4 py-3 text-gray-500">{c.type}</td>
                  <td className="px-4 py-3">{c.branches || 0}</td>
                  <td className="px-4 py-3">{c.staff || 0}</td>
                  <td className="px-4 py-3">{c.students?.total || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
