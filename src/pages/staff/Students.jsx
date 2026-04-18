import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  disapproved: "bg-red-100 text-red-700",
};

export default function StaffStudents() {
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [disapproveModal, setDisapproveModal] = useState(null);
  const [reason, setReason] = useState("");

  const fetchStudents = () => {
    api.get(`/students/branch?status=${statusFilter}`)
      .then((r) => setStudents(r.data.students || []))
      .catch(() => toast.error("Failed to load students"));
  };

  useEffect(() => { fetchStudents(); }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/students/${id}/approve`);
      toast.success("Student approved!");
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDisapprove = async () => {
    try {
      await api.patch(`/students/${disapproveModal}/disapprove`, { reason });
      toast.success("Student disapproved");
      setDisapproveModal(null);
      setReason("");
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}/delete`);
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Branch Students</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disapproved">Disapproved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Mobile", "Status", "Actions"].map((h) => (
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
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {s.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(s._id)} className="text-green-500 hover:text-green-700" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setDisapproveModal(s._id)} className="text-red-400 hover:text-red-600" title="Disapprove">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disapprove Modal */}
      {disapproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-gray-800 mb-3">Disapprove Student</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setDisapproveModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleDisapprove} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Disapprove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
