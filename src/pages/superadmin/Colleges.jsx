import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, X, Edit2, BarChart2 } from "lucide-react";

const EMPTY = {
  collegeName: "", collegeCode: "", type: "Polytechnic", loginEmail: "", loginPassword: "",
  affiliation: "", establishmentYear: "", address: "", city: "", state: "", pincode: "",
  phone: "", email: "", website: "", appName: "",
};

export default function Colleges() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchColleges = () => {
    api.get(`/colleges?page=${page}&limit=20`)
      .then((r) => { setColleges(r.data.colleges); setTotal(r.data.total); })
      .catch(() => toast.error("Failed to load colleges"));
  };

  useEffect(() => { fetchColleges(); }, [page]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setLogoFile(null);
    setCoverFile(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditId(c._id);
    setForm({
      collegeName: c.collegeName || "", collegeCode: c.collegeCode || "",
      type: c.type || "Polytechnic", loginEmail: c.loginEmail || "", loginPassword: "",
      affiliation: c.affiliation || "", establishmentYear: c.establishmentYear || "",
      address: c.address || "", city: c.city || "", state: c.state || "",
      pincode: c.pincode || "", phone: c.phone || "", email: c.email || "",
      website: c.website || "", appName: c.appName || "",
    });
    setLogoFile(null);
    setCoverFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (logoFile) fd.append("logo", logoFile);
      if (coverFile) fd.append("coverImage", coverFile);

      if (editId) {
        await api.put(`/colleges/${editId}`, fd);
        toast.success("College updated!");
      } else {
        await api.post("/colleges", fd);
        toast.success("College added!");
      }
      setShowModal(false);
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/colleges/${id}/toggle-status`);
      toast.success(data.message);
      fetchColleges();
    } catch { toast.error("Failed to toggle status"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this college? This cannot be undone.")) return;
    try {
      await api.delete(`/colleges/${id}`);
      toast.success("College deleted");
      fetchColleges();
    } catch { toast.error("Failed to delete"); }
  };

  // mandatory as per backend validateAddCollege: collegeName, collegeCode, type, loginEmail, loginPassword
  const FIELDS = [
    { key: "collegeName",       label: "College Name",   required: true },
    { key: "collegeCode",       label: "College Code",   required: !editId, mandatory: !editId },
    { key: "loginEmail",        label: "Login Email",    type: "email",    required: !editId, mandatory: !editId },
    { key: "loginPassword",     label: "Login Password", type: "password", required: !editId, mandatory: !editId, placeholder: editId ? "Leave blank to keep current" : "" },
    { key: "affiliation",       label: "Affiliation" },
    { key: "establishmentYear", label: "Est. Year",      type: "number" },
    { key: "address",           label: "Address" },
    { key: "city",              label: "City" },
    { key: "state",             label: "State" },
    { key: "pincode",           label: "Pincode" },
    { key: "phone",             label: "Phone" },
    { key: "email",             label: "Contact Email",  type: "email" },
    { key: "website",           label: "Website" },
    { key: "appName",           label: "App Name" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Colleges ({total})</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Add College
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["College", "Code", "Type", "City", "Contact Email", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {colleges.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.collegeName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.collegeCode}</td>
                  <td className="px-4 py-3 text-gray-500">{c.type}</td>
                  <td className="px-4 py-3 text-gray-500">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/superadmin/colleges/${c._id}/stats`)}
                        title="View Stats" className="text-gray-400 hover:text-purple-600">
                        <BarChart2 size={16} />
                      </button>
                      <button onClick={() => openEdit(c)} title="Edit"
                        className="text-gray-400 hover:text-blue-600">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleToggle(c._id)} title="Toggle Status"
                        className="text-gray-400 hover:text-orange-500">
                        {c.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => handleDelete(c._id)} title="Delete"
                        className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {colleges.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No colleges found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
        <span className="px-3 py-1 text-sm">Page {page}</span>
        <button disabled={colleges.length < 20} onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editId ? "Edit College" : "Add College"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Type — mandatory */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {["Polytechnic", "Degree", "School"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {FIELDS.map(({ key, label, type = "text", required, mandatory, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {label} {mandatory && <span className="text-red-500">*</span>}
                      {key === "collegeName" && <span className="text-red-500">*</span>}
                    </label>
                    <input type={type} required={required} value={form[key]}
                      placeholder={placeholder || ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 mt-2">
                {loading ? "Saving..." : editId ? "Update College" : "Add College"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
