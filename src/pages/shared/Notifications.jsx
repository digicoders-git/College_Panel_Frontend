import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Trash2, CheckCheck, Bell } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const fetchNotifications = () => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (filter !== "") params.append("isRead", filter);
    api.get(`/notifications?${params}`)
      .then((r) => {
        setNotifications(r.data.notifications || []);
        setUnreadCount(r.data.unreadCount || 0);
        setTotal(r.data.total || 0);
      })
      .catch(() => toast.error("Failed to load notifications"));
  };

  useEffect(() => { fetchNotifications(); }, [page, filter]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all").catch(() => {});
    toast.success("All marked as read");
    fetchNotifications();
  };

  const deleteOne = async (id) => {
    await api.delete(`/notifications/${id}`).catch(() => {});
    fetchNotifications();
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    await api.delete("/notifications/clear-all").catch(() => {});
    toast.success("All cleared");
    fetchNotifications();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {total > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n._id}
            onClick={() => !n.isRead && markRead(n._id)}
            className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 cursor-pointer transition ${!n.isRead ? "border-l-4 border-blue-500" : "opacity-70"}`}>
            <div className={`p-2 rounded-lg shrink-0 ${n.isRead ? "bg-gray-100" : "bg-blue-50"}`}>
              <Bell size={16} className={n.isRead ? "text-gray-400" : "text-blue-600"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${n.isRead ? "text-gray-600" : "text-gray-800"}`}>{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}
              className="text-gray-300 hover:text-red-500 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Prev</button>
        <span className="px-3 py-1 text-sm">Page {page}</span>
        <button disabled={notifications.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
