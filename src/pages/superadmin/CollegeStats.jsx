import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Users, GraduationCap, GitBranch } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={20} className="text-white" /></div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
    </div>
  </div>
);

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  disapproved: "bg-red-100 text-red-700",
};

export default function CollegeStats() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("branches");

  useEffect(() => {
    api.get(`/super-admin/colleges/${id}/stats`)
      .then((r) => setData(r.data))
      .catch(() => { toast.error("Failed to load stats"); navigate("/superadmin/colleges"); });
  }, [id]);

  if (!data) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const { college, stats, staff, students, branches } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/superadmin/colleges")}
          className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{college.collegeName}</h1>
          <p className="text-sm text-gray-500">{college.collegeCode} · {college.type}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${college.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {college.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Branches" value={stats.totalBranches} icon={GitBranch}     color="bg-purple-500" />
        <StatCard label="Total Staff"    value={stats.totalStaff}    icon={Users}         color="bg-blue-500" />
        <StatCard label="Total Students" value={stats.totalStudents} icon={GraduationCap} color="bg-green-500" />
        <StatCard label="Pending"        value={stats.studentsByStatus?.pending} icon={GraduationCap} color="bg-yellow-500" />
      </div>

      {/* Student Status Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",     value: stats.studentsByStatus?.pending,     color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { label: "Approved",    value: stats.studentsByStatus?.approved,    color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Disapproved", value: stats.studentsByStatus?.disapproved, color: "bg-red-50 border-red-200 text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-sm font-medium">{label} Students</p>
            <p className="text-2xl font-bold mt-1">{value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
        {["branches", "staff", "students"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${tab === t ? "bg-white text-blue-600 shadow" : "text-gray-500 hover:text-gray-700"}`}>
            {t} ({t === "branches" ? branches.length : t === "staff" ? staff.length : students.length})
          </button>
        ))}
      </div>

      {/* Branches Tab */}
      {tab === "branches" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Branch Name", "Code", "Total Seats"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.branchName}</td>
                  <td className="px-4 py-3 text-gray-500">{b.branchCode}</td>
                  <td className="px-4 py-3 text-gray-500">{b.totalSeats}</td>
                </tr>
              ))}
              {branches.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No branches</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff Tab */}
      {tab === "staff" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Role", "Branch", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.role?.roleName || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.branch?.branchName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No staff</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Students Tab */}
      {tab === "students" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Mobile", "Branch", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.mobile}</td>
                  <td className="px-4 py-3 text-gray-500">{s.branch?.branchName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No students</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
