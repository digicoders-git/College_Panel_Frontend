import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to get image URL
  const getImgUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8000";
    return `${base}${path}`;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const fetchNotices = () => {
    api.get(`/notices?page=${page}&limit=20`)
      .then((r) => { setNotices(r.data.notices); setTotal(r.data.total); })
      .catch(() => toast.error("Failed to load notices"));
  };

  useEffect(() => { fetchNotices(); }, [page]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      files.forEach((f) => fd.append("images", f));
      await api.post("/notices", fd);
      toast.success("Notice posted!");
      setShowModal(false);
      setForm({ title: "", content: "" });
      setFiles([]);
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted");
      fetchNotices();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Notices ({total})</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Post Notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n._id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{n.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.scope === "college" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {n.scope}
                  </span>
                </div>
                {n.content && <p className="text-sm text-gray-600">{n.content}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  By {n.postedBy?.name || n.postedBy?.collegeName} · {new Date(n.createdAt).toLocaleDateString()}
                </p>
                {n.images?.length > 0 && (
                  <div className="flex gap-3 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    {n.images.map((img, i) => (
                      <div key={i} className="relative group flex-shrink-0">
                        <img 
                          src={getImgUrl(img)} 
                          alt="" 
                          className="w-24 h-24 object-cover rounded-xl border border-gray-100 shadow-sm hover:scale-105 transition-transform duration-200 cursor-zoom-in" 
                          onClick={() => window.open(getImgUrl(img), "_blank")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(n._id)} className="text-gray-400 hover:text-red-600 ml-4">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-gray-400 py-8">No notices found</p>}
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
              <h2 className="font-bold text-gray-800">Post Notice</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Images (optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        Upload files
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>

                {previews.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                    {previews.map((url, i) => (
                      <div key={i} className="relative group flex-shrink-0">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => {
                          const newFiles = [...files]; newFiles.splice(i, 1); setFiles(newFiles);
                          const newPre = [...previews]; newPre.splice(i, 1); setPreviews(newPre);
                        }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Posting..." : "Post Notice"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
