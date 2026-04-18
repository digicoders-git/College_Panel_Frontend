import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

    for (const { endpoint, userKey, role, redirect } of ROLE_ENDPOINTS) {
      try {
        const { data } = await api.post(endpoint, form);
        login({ token: data.token, role, user: data[userKey] });
        toast.success("Login successful!");
        navigate(redirect);
        return;
      } catch (err) {
        // 401 = wrong password for this role, try next
        // 403 = account found but deactivated/pending — stop and show message
        if (err.response?.status === 403) {
          toast.error(err.response.data.message || "Access denied");
          setLoading(false);
          return;
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

    toast.error("Invalid email or password");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">CP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">College Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
            ) : "Sign In"}
          </button>
        </form>

       
      </div>
    </div>
  );
}
