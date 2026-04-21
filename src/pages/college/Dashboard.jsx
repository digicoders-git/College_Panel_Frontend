import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Users, GitBranch, Bell, GraduationCap, Copy, Check } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-blue-900/5 group hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tight">{value ?? "0"}</p>
    </div>
  </div>
);

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
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <GraduationCap size={120} />
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Student Registration</h3>
        <p className="text-sm font-medium text-slate-400 mb-6">Share this link with students to join your college</p>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 overflow-hidden">
            <span className="text-xs font-bold text-blue-600 truncate block select-all">{link}</span>
          </div>
          <button 
            onClick={handleCopy} 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              copied ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:scale-105"
            }`}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CollegeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/colleges/dashboard")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"));
  }, []);

  const ov = data?.overview;

  return (
    <div className="space-y-10 animate-loader-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">College Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Institutional management and student oversight</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">{user?.collegeCode}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CopyLinkCard code={user?.collegeCode} />
        
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Pending",     value: ov?.students?.pending,     color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
            { label: "Approved",    value: ov?.students?.approved,    color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
            { label: "Disapproved", value: ov?.students?.disapproved, color: "bg-rose-50 text-rose-600 border-rose-100", dot: "bg-rose-500" },
          ].map(({ label, value, color, dot }) => (
            <div key={label} className={`${label === 'Pending' ? 'col-span-2' : 'col-span-1'} rounded-3xl border p-6 ${color} flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300`}>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-1">{label} Students</p>
                <p className="text-3xl font-black tracking-tight">{value ?? 0}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${dot} animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Branches"  value={ov?.totalBranches} icon={GitBranch}     color="bg-violet-600" />
        <StatCard label="Admin Staff"     value={ov?.totalStaff}    icon={Users}         color="bg-indigo-600" />
        <StatCard label="Total Notices"   value={ov?.totalNotices}  icon={Bell}          color="bg-sky-500" />
        <StatCard label="All Students"  value={ov?.students?.total} icon={GraduationCap} color="bg-emerald-500" />
      </div>

      {/* Branch Stats Table */}
      <section className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Branch Comparison</h2>
            <p className="text-sm font-medium text-slate-400 mt-0.5">Performance across different departments</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {["Branch Name", "Code", "Total Seats", "Students", "Approval Ratio"].map((h) => (
                  <th key={h} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.branches?.map((b) => {
                const total = b.students?.total || 1;
                const approved = b.students?.approved || 0;
                const ratio = Math.round((approved / total) * 100);
                
                return (
                  <tr key={b._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:rotate-6 transition-transform">
                          {b.branchName[0]}
                        </div>
                        <span className="font-bold text-slate-800 text-[15px]">{b.branchName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-wider">{b.branchCode}</code>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{b.totalSeats}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-slate-800">{b.students?.total} Total</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-emerald-600">{ratio}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
