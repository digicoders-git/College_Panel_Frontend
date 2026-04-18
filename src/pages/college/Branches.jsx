import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Edit2 } from "lucide-react";

const INITIAL = { branchName: "", branchCode: "", totalSeats: "" };

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const fetchBranches = () => {
    api.get("/branches")
      .then((r) => setBranches(r.data.branches || []))
      .catch(() => toast.error("Failed to load branches"));
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await api.put(`/branches/${editMode}`, form);
        toast.success("Branch updated!");
      } else {
        await api.post("/branches", form);
        toast.success("Branch added!");
      }
      setShowModal(false);
      setEditMode(null);
      setForm(INITIAL);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setForm({ branchName: branch.branchName, branchCode: branch.branchCode, totalSeats: branch.totalSeats });
    setEditMode(branch._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this branch?")) return;
    try {
      await api.delete(`/branches/${id}`);
      toast.success("Branch deleted");
      fetchBranches();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Branches ({branches.length})</h1>
        <button onClick={() => { setShowModal(true); setEditMode(null); setForm(INITIAL); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Branch Name", "Code", "Total Seats", "Actions"].map((h) => (
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
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => handleEdit(b)} className="text-gray-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No branches found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editMode ? "Edit" : "Add"} Branch</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { key: "branchName", label: "Branch Name", required: true },
                { key: "branchCode", label: "Branch Code", required: true },
                { key: "totalSeats", label: "Total Seats", type: "number", required: true },
              ].map(({ key, label, type = "text", required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Saving..." : editMode ? "Update Branch" : "Add Branch"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
