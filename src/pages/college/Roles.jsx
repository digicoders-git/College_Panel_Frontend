import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Edit2 } from "lucide-react";

// backend value → display label (grouped by module)
const PERMISSION_GROUPS = [
  {
    module: "Students",
    permissions: [
      { value: "manage_students", label: "Manage Students" },
      { value: "view_students",   label: "View Students" },
    ],
  },
  {
    module: "Notices",
    permissions: [
      { value: "manage_notices", label: "Manage Notices" },
      { value: "view_notices",   label: "View Notices" },
    ],
  },
  {
    module: "Timetable",
    permissions: [
      { value: "manage_timetable", label: "Manage Timetable" },
      { value: "view_timetable",   label: "View Timetable" },
    ],
  },
  {
    module: "Calendar",
    permissions: [
      { value: "manage_calendar", label: "Manage Calendar" },
      { value: "view_calendar",   label: "View Calendar" },
    ],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions);

const LABEL_MAP = Object.fromEntries(ALL_PERMISSIONS.map((p) => [p.value, p.label]));

const INITIAL = { roleName: "", permissions: [] };

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const fetchRoles = () => {
    api.get("/roles")
      .then((r) => setRoles(r.data.roles || []))
      .catch(() => toast.error("Failed to load roles"));
  };

  useEffect(() => { fetchRoles(); }, []);

  const togglePermission = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await api.put(`/roles/${editMode}`, form);
        toast.success("Role updated!");
      } else {
        await api.post("/roles", form);
        toast.success("Role added!");
      }
      setShowModal(false);
      setEditMode(null);
      setForm(INITIAL);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setForm({ roleName: role.roleName, permissions: role.permissions || [] });
    setEditMode(role._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this role?")) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success("Role deleted");
      fetchRoles();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Roles ({roles.length})</h1>
        <button onClick={() => { setShowModal(true); setEditMode(null); setForm(INITIAL); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div key={r._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{r.roleName}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(r)} className="text-gray-400 hover:text-blue-600"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {r.permissions?.length > 0
                ? r.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {LABEL_MAP[p] || p}
                    </span>
                  ))
                : <span className="text-xs text-gray-400">No permissions assigned</span>
              }
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <p className="text-gray-400 text-sm col-span-3 text-center py-8">No roles found</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editMode ? "Edit" : "Add"} Role</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role Name</label>
                <input required value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                  placeholder="e.g. HOD, Teacher"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-3">Permissions</label>
                <div className="space-y-3">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.module} className="border border-gray-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group.module}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.permissions.map(({ value, label }) => (
                          <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(value)}
                              onChange={() => togglePermission(value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Saving..." : editMode ? "Update Role" : "Add Role"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
