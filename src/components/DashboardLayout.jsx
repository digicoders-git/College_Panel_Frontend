import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "./Loader";

export default function DashboardLayout({ navItems, title }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Kya aap logout karna chahte hain?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#4a5568",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "No",
    });
    if (result.isConfirmed) {
      logout();
      toast.success("Logged out");
      navigate("/login");
    }
  };

  const userName = user?.name || user?.collegeName || "User";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const profilePicUrl = user?.profilePic || user?.profileImage || user?.logo;
  const fullPicUrl = profilePicUrl ? `http://localhost:8000${profilePicUrl}` : null;

  // Bottom nav: max 5 items on mobile
  const bottomNavItems = navItems.slice(0, 5);

  const NavItem = ({ to, label, icon: Icon, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-semibold transition-all duration-300 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1"
            : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon size={20} className="shrink-0" />}
          <span className="truncate">{label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-blue-100 font-sans">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-72 min-h-screen bg-[#0f172a] text-white flex-col shrink-0 border-r border-gray-800/50">
        <div className="p-7 mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden shadow-lg shadow-blue-500/30 border border-blue-400/20">
              {fullPicUrl ? (
                <img src={fullPicUrl} alt="P" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white tracking-tighter">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-snug">{userName}</p>
              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">{title}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/30">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full group"
            >
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-[280px] bg-[#0f172a] text-white z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-1.5xl bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden shadow-lg shadow-blue-500/20">
              {fullPicUrl ? (
                <img src={fullPicUrl} alt="P" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{title}</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1.5 bg-gray-800/50 rounded-xl">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={() => setDrawerOpen(false)} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0 safe-top">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2.5 rounded-2xl text-gray-600 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-[0.15em]">{title}</h1>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black text-white overflow-hidden shadow-lg shadow-blue-500/20">
            {fullPicUrl ? (
              <img src={fullPicUrl} alt="P" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-10 pb-28 lg:pb-10 bg-[#f8fafc] relative">
          <Loader />
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-blue-900/10 rounded-[1.75rem] z-30 safe-bottom">
          <div className="flex items-center justify-around h-full px-2">
            {bottomNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-1 py-2 rounded-2xl transition-all duration-300 min-w-0 flex-1 ${
                    isActive ? "text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-1.5xl transition-all duration-300 ${isActive ? "bg-blue-50 shadow-sm" : ""}`}>
                      {Icon && <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                    </div>
                    <span className={`text-[9px] font-bold truncate w-full text-center tracking-wide uppercase transition-all ${isActive ? "opacity-100" : "opacity-60"}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

      </div>
    </div>
  );
}
