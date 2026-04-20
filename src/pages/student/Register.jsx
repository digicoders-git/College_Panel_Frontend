import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { requestFcmToken } from "../../firebase";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [college, setCollege] = useState(null);
  const [branches, setBranches] = useState([]);
  const [collegeCode, setCollegeCode] = useState("");
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", branchId: "" });
  const [loading, setLoading] = useState(false);

  const verifyCollege = async (codeOverride) => {
    const codeToVerify = codeOverride || collegeCode;
    if (!codeToVerify) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/students/verify-college?code=${codeToVerify}`);
      setCollege(data.college);

      try {
        const br = await api.get(`/students/branches?code=${codeToVerify}`);
        setBranches(br.data.branches || []);
      } catch {
        setBranches([]);
        toast.error("Could not load branches. Please try again.");
        return;
      }

      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid college code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get("collegeCode");
    if (code) {
      setCollegeCode(code.toUpperCase());
      verifyCollege(code.toUpperCase());
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return toast.error("Invalid email address");
    if (!/^\d{10}$/.test(form.mobile)) return toast.error("Mobile number must be 10 digits");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      // FCM token pehle lo taaki approve hone pe notification mil sake
      const fcmToken = await requestFcmToken().catch(() => null);
      await api.post("/students/register", { ...form, collegeCode, fcmToken: fcmToken || undefined });
      if (fcmToken) localStorage.setItem("pendingFcmToken", fcmToken);
      toast.success("Registration submitted! Pending approval.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Student Registration</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Step {step} of 2</p>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); verifyCollege(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Code</label>
              <input required value={collegeCode} onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCPOLY"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Verifying..." : "Verify College"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            {college && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-2">
                ✅ {college.collegeName} ({college.collegeCode})
              </div>
            )}
            {[
              { key: "name", label: "Full Name", required: true },
              { key: "email", label: "Email", type: "email", required: true },
              { key: "mobile", label: "Mobile", required: true },
              { key: "password", label: "Password", type: "password", required: true },
            ].map(({ key, label, type = "text", required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} required={required} value={form[key]}
                  onChange={(e) => {
                    if (key === "mobile") {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm({ ...form, [key]: val });
                    } else {
                      setForm({ ...form, [key]: e.target.value });
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select required value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Branch</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Back</button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
