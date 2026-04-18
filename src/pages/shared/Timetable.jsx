import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, X, FileText, Download } from "lucide-react";

export default function Timetable() {
  const { role } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTimetables = () => {
    api.get("/timetable")
      .then((r) => setTimetables(r.data.timetables || []))
      .catch(() => toast.error("Failed to load timetables"));
  };

  useEffect(() => { fetchTimetables(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("file", file);
      await api.post("/timetable", fd);
      toast.success("Timetable uploaded!");
      setShowModal(false);
      setTitle("");
      setFile(null);
      fetchTimetables();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this timetable?")) return;
    try {
      await api.delete(`/timetable/${id}`);
      toast.success("Timetable deleted");
      fetchTimetables();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Timetable</h1>
        {role === "staff" && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            <Plus size={16} /> Upload Timetable
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timetables.map((t) => (
          <div key={t._id} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 truncate">{t.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {t.branch?.branchName} · {new Date(t.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400">By {t.uploadedBy?.name}</p>
              <a href={`http://localhost:8000${t.fileUrl}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                <Download size={12} /> Download
              </a>
            </div>
            {role === "staff" && (
              <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-600 shrink-0">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {timetables.length === 0 && (
          <p className="text-gray-400 text-sm col-span-3 text-center py-8">No timetables uploaded yet</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Upload Timetable</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS Final Year Timetable"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File (PDF/Image)</label>
                <input type="file" required accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
