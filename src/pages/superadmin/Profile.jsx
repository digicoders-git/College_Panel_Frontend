import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { User, Phone, Camera, Lock, Eye, EyeOff, Shield } from "lucide-react";

export default function SuperAdminProfile() {
  const { login, role, token, user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    api.get("/super-admin/profile").then((r) => {
      const a = r.data.admin;
      setProfileData(a);
      setForm({ name: a.name || "", phone: a.phone || "" });
      if (a.profileImage) setPreview(`http://localhost:8000${a.profileImage}`);
    }).catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      if (profileImage) fd.append("profileImage", profileImage);
      const { data } = await api.put("/super-admin/profile", fd);
      login({ token, role, user: data.admin });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return toast.error("New passwords do not match");
    if (pwForm.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    setPwLoading(true);
    try {
      await api.put("/super-admin/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";

  return (
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and password</p>
      </div>

      <div className="space-y-6">

        {/* Top — Avatar Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
            {/* Avatar */}
            <div className="relative mb-4">
              {preview ? (
                <img src={preview} alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-4 ring-blue-50">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition shadow">
                <Camera size={13} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 text-lg">{form.name || "—"}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{profileData?.email}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield size={12} /> Super Admin
                </div>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone size={12} /> {form.phone || "No phone"}
                </span>
                <span className="text-xs text-gray-400">
                  Since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" }) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — Two column forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Edit Profile Form */}
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User size={16} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                <input
                  value={profileData?.email || ""}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : "Save Changes"}
            </button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Lock size={16} className="text-orange-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Change Password</h2>
            </div>

            <div className="space-y-4 mb-5">
              {[
                { key: "currentPassword", label: "Current Password",  vis: "current" },
                { key: "newPassword",     label: "New Password",      vis: "new" },
                { key: "confirmPassword", label: "Confirm New Password", vis: "confirm" },
              ].map(({ key, label, vis }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw[vis] ? "text" : "password"}
                      required
                      value={pwForm[key]}
                      onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                    />
                    <button type="button"
                      onClick={() => setShowPw({ ...showPw, [vis]: !showPw[vis] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw[vis] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={pwLoading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition flex items-center gap-2">
              {pwLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
              ) : "Change Password"}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
