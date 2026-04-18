import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Users, GitBranch, Bell, GraduationCap, Copy, Check } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={22} className="text-white" /></div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
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
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CopyLinkCard code={user?.collegeCode} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Branches"  value={ov?.totalBranches} icon={GitBranch}     color="bg-purple-500" />
        <StatCard label="Total Staff"     value={ov?.totalStaff}    icon={Users}         color="bg-blue-500" />
        <StatCard label="Total Notices"   value={ov?.totalNotices}  icon={Bell}          color="bg-orange-500" />
        <StatCard label="Total Students"  value={ov?.students?.total} icon={GraduationCap} color="bg-green-500" />
      </div>

      {/* Student Status Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending",     value: ov?.students?.pending,     color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { label: "Approved",    value: ov?.students?.approved,    color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Disapproved", value: ov?.students?.disapproved, color: "bg-red-50 border-red-200 text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-sm font-medium">{label} Students</p>
            <p className="text-2xl font-bold mt-1">{value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Branch Stats */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold text-gray-700">Branch-wise Students</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Branch", "Code", "Seats", "Total", "Pending", "Approved", "Disapproved"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.branches?.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.branchName}</td>
                  <td className="px-4 py-3 text-gray-500">{b.branchCode}</td>
                  <td className="px-4 py-3 text-gray-500">{b.totalSeats}</td>
                  <td className="px-4 py-3">{b.students?.total}</td>
                  <td className="px-4 py-3 text-yellow-600">{b.students?.pending}</td>
                  <td className="px-4 py-3 text-green-600">{b.students?.approved}</td>
                  <td className="px-4 py-3 text-red-600">{b.students?.disapproved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
