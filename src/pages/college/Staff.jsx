import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

const INITIAL = { name: "", email: "", mobile: "", password: "", role: "", branch: "" };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const fetchStaff = () => {
    api.get(`/staff?page=${page}&limit=20`)
      .then((r) => { setStaff(r.data.staff); setTotal(r.data.total); })
      .catch(() => toast.error("Failed to load staff"));
  };

  useEffect(() => {
    fetchStaff();
    api.get("/roles").then((r) => setRoles(r.data.roles || [])).catch(() => {});
    api.get("/branches").then((r) => setBranches(r.data.branches || [])).catch(() => {});
  }, [page]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/staff", form);
      toast.success("Staff added!");
      setShowModal(false);
      setForm(INITIAL);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/staff/${id}/toggle-status`);
      toast.success(data.message);
      fetchStaff();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this staff?")) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success("Staff deleted");
      fetchStaff();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Staff ({total})</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Mobile", "Role", "Branch", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.mobile || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.role?.roleName || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.branch?.branchName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => handleToggle(s._id)} className="text-gray-400 hover:text-blue-600">
                      {s.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
        <span className="px-3 py-1 text-sm">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded">Next</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Add Staff</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              {[
                { key: "name", label: "Name", required: true },
                { key: "email", label: "Email", type: "email", required: true },
                { key: "mobile", label: "Mobile" },
                { key: "password", label: "Password", type: "password", required: true },
              ].map(({ key, label, type = "text", required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} required={required} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Role</option>
                  {roles.map((r) => <option key={r._id} value={r._id}>{r.roleName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Branch</option>
                  {branches.map((b) => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Adding..." : "Add Staff"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
