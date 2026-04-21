import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Building2, Users, GitBranch, GraduationCap } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-blue-900/5 group hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className="text-[11px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">
          +{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value ?? "0"}</p>
        <span className="text-xs font-bold text-gray-400">Total</span>
      </div>
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
    <div className="space-y-10 animate-loader-fade-in">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time statistics for all institutions</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Colleges"  value={ov?.totalColleges}  icon={Building2}     color="bg-indigo-600" trend="12" />
        <StatCard label="Active"          value={ov?.activeColleges} icon={Building2}     color="bg-emerald-500" />
        <StatCard label="Branches"        value={ov?.totalBranches}  icon={GitBranch}     color="bg-violet-500" />
        <StatCard label="Admin Staff"      value={ov?.totalStaff}     icon={Users}         color="bg-amber-500" />
        <StatCard label="Total Students"  value={ov?.totalStudents}  icon={GraduationCap} color="bg-rose-500" trend="8" />
      </div>

      <section className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Colleges Directory</h2>
            <p className="text-sm font-medium text-slate-400 mt-0.5">Manage and monitor joined institutions</p>
          </div>
          <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {["College Name", "Code", "Category", "Staff/Students", "System Status"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.colleges?.map((c) => (
                <tr key={c._id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                        {c.collegeName[0]}
                      </div>
                      <span className="font-bold text-slate-800 text-[15px]">{c.collegeName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{c.collegeCode}</code>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-500">{c.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{c.staff || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Staff</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{c.students?.total || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Students</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${c.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      {c.isActive ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
