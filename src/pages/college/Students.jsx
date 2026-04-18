import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  disapproved: "bg-red-100 text-red-700",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  useEffect(() => {
    api.get("/branches")
      .then((r) => setBranches(r.data.branches || []))
      .catch(() => {});
  }, []);

  const fetchStudents = () => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (statusFilter) params.append("status", statusFilter);
    if (branchFilter) params.append("branchId", branchFilter);
    api.get(`/students?${params}`)
      .then((r) => { setStudents(r.data.students || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error("Failed to load students"));
  };

  useEffect(() => { fetchStudents(); }, [page, statusFilter, branchFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Students ({total})</h1>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
            ))}
          </select>

          <select value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disapproved">Disapproved</option>
          </select>

          {(branchFilter || statusFilter) && (
            <button onClick={() => { setBranchFilter(""); setStatusFilter(""); setPage(1); }}
              className="text-xs text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-lg">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Mobile", "Branch", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.mobile}</td>
                  <td className="px-4 py-3 text-gray-500">{s.branch?.branchName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
        <span className="px-3 py-1 text-sm">Page {page}</span>
        <button disabled={students.length < 20} onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
