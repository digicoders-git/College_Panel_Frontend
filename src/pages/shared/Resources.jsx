import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, X, BookOpen, Download, ExternalLink, FolderPlus, Search, Filter } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

const CATEGORY_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-green-50 text-green-700 border-green-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-teal-50 text-teal-700 border-teal-200",
];

export default function Resources() {
  const { role } = useAuth();
  const canManage = role === "college" || role === "staff"; // staff permission check is backend side

  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showResModal, setShowResModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [resForm, setResForm] = useState({ title: "", description: "", categoryId: "", branchId: "", year: "", semester: "", externalLink: "" });
  const [resFile, setResFile] = useState(null);
  const [resLoading, setResLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [catRes, resRes] = await Promise.all([
        api.get("/resources/categories"),
        api.get(`/resources?${selectedCategory ? `categoryId=${selectedCategory}&` : ""}${filterYear ? `year=${filterYear}&` : ""}${filterSemester ? `semester=${filterSemester}` : ""}`),
      ]);
      setCategories(catRes.data.categories || []);
      setResources(resRes.data.resources || []);
    } catch { toast.error("Failed to load resources"); }
  };

  const fetchBranches = async () => {
    if (role !== "college") return;
    try {
      const r = await api.get("/branches");
      setBranches(r.data.branches || []);
    } catch {}
  };

  useEffect(() => { fetchAll(); fetchBranches(); }, [selectedCategory, filterYear, filterSemester]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatLoading(true);
    try {
      await api.post("/resources/categories", { name: catName });
      toast.success("Category added!");
      setCatName("");
      setShowCatModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setCatLoading(false); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category and all its resources?")) return;
    try {
      await api.delete(`/resources/categories/${id}`);
      toast.success("Category deleted");
      fetchAll();
    } catch { toast.error("Failed"); }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setResLoading(true);
    try {
      const fd = new FormData();
      Object.entries(resForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (resFile) fd.append("file", resFile);
      await api.post("/resources", fd);
      toast.success("Resource added!");
      setShowResModal(false);
      setResForm({ title: "", description: "", categoryId: "", branchId: "", year: "", semester: "", externalLink: "" });
      setResFile(null);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setResLoading(false); }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success("Deleted");
      fetchAll();
    } catch { toast.error("Failed"); }
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(r => r.category?._id === cat._id);
    if (items.length > 0 || !selectedCategory) acc[cat._id] = { cat, items };
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Resources</h1>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => setShowCatModal(true)}
              className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
              <FolderPlus size={15} /> Add Category
            </button>
            <button onClick={() => setShowResModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              <Plus size={15} /> Add Resource
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input value={filterYear} onChange={e => setFilterYear(e.target.value)} placeholder="Year e.g. 2024"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {/* Categories + Resources */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No categories yet</p>
          {canManage && <p className="text-sm mt-1">Add a category to get started</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat, idx) => {
            const items = filtered.filter(r => r.category?._id === cat._id);
            if (selectedCategory && cat._id !== selectedCategory) return null;
            const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <div key={cat._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b border-gray-100 ${colorClass}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} />
                    <span className="font-semibold text-sm">{cat.name}</span>
                    <span className="text-xs opacity-70">({items.length})</span>
                  </div>
                  {canManage && role === "college" && (
                    <button onClick={() => handleDeleteCategory(cat._id)} className="opacity-60 hover:opacity-100 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Resources Grid */}
                {items.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400">No resources in this category</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {items.map(r => (
                      <div key={r._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                          {r.description && <p className="text-xs text-gray-400 truncate mt-0.5">{r.description}</p>}
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {r.branch?.branchName && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.branch.branchName}</span>
                            )}
                            {r.year && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Year: {r.year}</span>}
                            {r.semester && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Sem: {r.semester}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          {r.fileUrl && (
                            <a href={`${BASE_URL}${r.fileUrl}`} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition">
                              <Download size={12} /> Download
                            </a>
                          )}
                          {r.externalLink && (
                            <a href={r.externalLink} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition">
                              <ExternalLink size={12} /> Open
                            </a>
                          )}
                          {canManage && (
                            <button onClick={() => handleDeleteResource(r._id)} className="text-gray-300 hover:text-red-500 transition">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Add Category</h2>
              <button onClick={() => setShowCatModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
                <input required value={catName} onChange={e => setCatName(e.target.value)}
                  placeholder="e.g. Question Papers, Books, Notes"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={catLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {catLoading ? "Adding..." : "Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Add Resource</h2>
              <button onClick={() => setShowResModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddResource} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input required value={resForm.title} onChange={e => setResForm({ ...resForm, title: e.target.value })}
                  placeholder="e.g. Mathematics Question Paper 2024"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                <select required value={resForm.categoryId} onChange={e => setResForm({ ...resForm, categoryId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {role === "college" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Branch *</label>
                  <select required value={resForm.branchId} onChange={e => setResForm({ ...resForm, branchId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.branchName}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <input value={resForm.year} onChange={e => setResForm({ ...resForm, year: e.target.value })}
                    placeholder="e.g. 2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
                  <select value={resForm.semester} onChange={e => setResForm({ ...resForm, semester: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={resForm.description} onChange={e => setResForm({ ...resForm, description: e.target.value })}
                  rows={2} placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Upload File (PDF, DOC, etc.)</label>
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png"
                  onChange={e => setResFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Or External Link</label>
                <input value={resForm.externalLink} onChange={e => setResForm({ ...resForm, externalLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={resLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 mt-2">
                {resLoading ? "Uploading..." : "Add Resource"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
