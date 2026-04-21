import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Loader from "../components/Loader";

const ROLE_ENDPOINTS = [
  { endpoint: "/super-admin/login", userKey: "admin",   role: "superadmin", redirect: "/superadmin/dashboard" },
  { endpoint: "/colleges/login",    userKey: "college", role: "college",    redirect: "/college/dashboard" },
  { endpoint: "/staff/login",       userKey: "staff",   role: "staff",      redirect: "/staff/dashboard" },
  { endpoint: "/students/login",    userKey: "student", role: "student",    redirect: "/student/dashboard" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let forbiddenError = null;

    for (const { endpoint, userKey, role, redirect } of ROLE_ENDPOINTS) {
      try {
        const { data } = await api.post(endpoint, form);
        login({ token: data.token, role, user: data[userKey] });
        toast.success("Login successful!");
        navigate(redirect);
        return;
      } catch (err) {
        // 403 = account found but deactivated/pending — remember and try next role
        if (err.response?.status === 403) {
          forbiddenError = err.response.data.message || "Access denied";
          continue;
        }
        // 400 = validation error — stop
        if (err.response?.status === 400) {
          toast.error(err.response.data.message || "Invalid input");
          setLoading(false);
          return;
        }
        // 401 = not found in this role, try next
        continue;
      }
    }

    if (forbiddenError) {
      toast.error(forbiddenError);
    } else {
      toast.error("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 selection:bg-blue-100 relative">
      <Loader />
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        {/* Brand Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-soft mb-5 border border-gray-100 group transition-all hover:scale-105 duration-300">
            <span className="text-blue-600 font-extrabold text-2xl tracking-tighter group-hover:rotate-6 transition-transform">CP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Manage your institution with ease</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-900/5 p-10 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                autoFocus
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@institution.com"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-12 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white placeholder:text-gray-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none mt-4 overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In to Dashboard</>
                )}
              </div>
              <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>

          {/* Additional Links (Optional) */}
          <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between text-sm">
            <span className="text-gray-400 font-medium">New student?</span>
            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Create Account</Link>
          </div>
        </div>

        <p className="text-center mt-10 text-gray-400 text-xs font-semibold tracking-widest uppercase">
          &copy; 2026 Admin Portal System
        </p>
      </div>
    </div>
  );
}
