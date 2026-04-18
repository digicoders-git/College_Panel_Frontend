import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, X, Edit2, Clock, RefreshCw } from "lucide-react";

const EVENT_TYPES = ["Holiday", "Exam", "Event", "Meeting", "Other"];
const TYPE_COLORS = {
  Holiday: "bg-green-100 text-green-700",
  Exam:    "bg-red-100 text-red-700",
  Event:   "bg-blue-100 text-blue-700",
  Meeting: "bg-purple-100 text-purple-700",
  Other:   "bg-gray-100 text-gray-700",
};

const INITIAL = { title: "", description: "", eventDate: "", endDate: "", eventType: "Other" };

export default function CalendarPage() {
  const { role } = useAuth();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showAll, setShowAll] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    const url = showAll ? `/calendar` : `/calendar?month=${month}&year=${year}`;
    api.get(url)
      .then((r) => setEvents(r.data.events || []))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [month, year, showAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await api.put(`/calendar/${editMode}`, form);
        toast.success("Event updated!");
      } else {
        await api.post("/calendar", form);
        toast.success("Event added!");
      }
      setShowModal(false);
      setEditMode(null);
      setForm(INITIAL);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ev) => {
    setForm({
      title: ev.title, description: ev.description || "",
      eventDate: ev.eventDate?.slice(0, 10), endDate: ev.endDate?.slice(0, 10) || "",
      eventType: ev.eventType,
    });
    setEditMode(ev._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/calendar/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch { toast.error("Failed"); }
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAll(!showAll)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showAll ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
            }`}>
            All
          </button>
          {/* Month/Year filter */}
          {!showAll && (
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <div className="w-[1px] bg-gray-100 my-1 mx-1"></div>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          )}
          
          <button onClick={fetchEvents} className={`p-2 text-gray-500 hover:text-blue-600 transition-transform ${loading ? "animate-spin" : ""}`} title="Refresh">
            <RefreshCw size={18} />
          </button>

          {role === "staff" && (
            <button onClick={() => { setShowModal(true); setEditMode(null); setForm(INITIAL); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md">
              <Plus size={16} /> Add Event
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-5 hover:shadow-md transition group border border-transparent hover:border-blue-100">
            <div className="flex flex-col items-center justify-center min-w-[56px] h-14 rounded-xl bg-gray-50 text-gray-800 border border-gray-100">
              <p className="text-xl font-bold leading-none">{new Date(ev.eventDate).getDate()}</p>
              <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mt-1">{MONTHS[new Date(ev.eventDate).getMonth()]}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 tracking-tight">{ev.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${TYPE_COLORS[ev.eventType]}`}>
                  {ev.eventType}
                </span>
                {!ev.branch && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    College-wide
                  </span>
                )}
              </div>
              {ev.description && <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{ev.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  By {ev.createdBy?.name || "Admin"}
                </span>
                {ev.endDate && (
                  <span className="text-[10px] font-medium text-orange-400">
                    Ends {new Date(ev.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {role === "staff" && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(ev)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(ev._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-center text-gray-400 py-8">No events for {MONTHS[month - 1]} {year}</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{editMode ? "Edit" : "Add"} Event</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
                  <input type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date (optional)</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event Type</label>
                <select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Saving..." : editMode ? "Update Event" : "Add Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
