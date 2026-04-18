import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, Camera, Lock, Eye, EyeOff, MapPin, Phone, Globe, Mail } from "lucide-react";

const F = ({ label, k, form, setForm, type = "text", span = false, maxLength, isEditing }) => (
  <div className={span ? "sm:col-span-2" : ""}>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {isEditing ? (
      <input type={type} value={form[k] || ""} maxLength={maxLength}
        onChange={(e) => {
          let val = e.target.value;
          if (["phone", "pincode", "establishmentYear"].includes(k)) {
            val = val.replace(/\D/g, "");
            if (maxLength) val = val.slice(0, maxLength);
          }
          setForm({ ...form, [k]: val });
        }}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition" />
    ) : (
      <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-medium min-h-[42px] flex items-center">
        {form[k] || <span className="text-gray-400 font-normal italic">Not specified</span>}
      </div>
    )}
  </div>
);

export default function CollegeProfile() {
  const { login, role, token } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.get("/colleges/profile").then((r) => {
      const c = r.data.college;
      setCollege(c);
      setLogoPreview(c.logo ? `http://localhost:8000${c.logo}` : null);
      setForm({
        collegeName: c.collegeName || "", collegeShortName: c.collegeShortName || "",
        affiliation: c.affiliation || "", establishmentYear: c.establishmentYear || "",
        address: c.address || "", city: c.city || "", state: c.state || "",
        pincode: c.pincode || "", phone: c.phone || "", email: c.email || "",
        website: c.website || "", appName: c.appName || "",
        googleMapLink: c.googleMapLink || "",
        themeColorPrimary: c.themeColorPrimary || "#1976d2",
        themeColorSecondary: c.themeColorSecondary || "#ffffff",
      });
    }).catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) return toast.error("Invalid contact email");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return toast.error("Phone must be 10 digits");
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) return toast.error("Pincode must be 6 digits");
    if (form.establishmentYear && (form.establishmentYear < 1800 || form.establishmentYear > 2100)) return toast.error("Invalid Establishment Year");

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (logoFile) fd.append("logo", logoFile);
      if (coverFile) fd.append("coverImage", coverFile);
      const { data } = await api.put("/colleges/profile", fd);
      setCollege(data.college);
      login({ token, role, user: data.college });
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
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
      await api.put("/colleges/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = college?.collegeName
    ? college.collegeName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "CL";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">College Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your college information and settings</p>
        </div>
        {!isEditing && activeTab !== "password" && (
          <button onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            Edit Profile
          </button>
        )}
      </div>

      {/* Top — College Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div className="relative shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-4 ring-blue-50">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition shadow">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800">{college?.collegeName || "—"}</h2>
            <p className="text-sm text-gray-500">{college?.collegeCode} · {college?.type}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {college?.city && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} /> {college.city}{college.state ? `, ${college.state}` : ""}
                </span>
              )}
              {college?.phone && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={11} /> {college.phone}
                </span>
              )}
              {college?.email && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail size={11} /> {college.email}
                </span>
              )}
              {college?.website && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Globe size={11} /> {college.website}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${college?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {college?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[
          { key: "basic",    label: "Basic Info" },
          { key: "location", label: "Location" },
          { key: "branding", label: "Branding" },
          { key: "password", label: "Change Password" },
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === t.key ? "bg-white text-blue-600 shadow" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg"><Building2 size={16} className="text-blue-600" /></div>
            <h2 className="font-semibold text-gray-800">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <F isEditing={isEditing} label="College Name" k="collegeName" form={form} setForm={setForm} span />
            <F isEditing={isEditing} label="Short Name" k="collegeShortName" form={form} setForm={setForm} />
            <F isEditing={isEditing} label="Affiliation" k="affiliation" form={form} setForm={setForm} />
            <F isEditing={isEditing} label="Establishment Year" k="establishmentYear" form={form} setForm={setForm} maxLength={4} />
            <F isEditing={isEditing} label="Phone" k="phone" form={form} setForm={setForm} maxLength={10} />
            <F isEditing={isEditing} label="Contact Email" k="email" form={form} setForm={setForm} type="email" />
            <F isEditing={isEditing} label="Website" k="website" form={form} setForm={setForm} span />
            <F isEditing={isEditing} label="App Name" k="appName" form={form} setForm={setForm} />
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : "Save Changes"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          )}
        </form>
      )}

      {/* Location Tab */}
      {activeTab === "location" && (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-green-50 rounded-lg"><MapPin size={16} className="text-green-600" /></div>
            <h2 className="font-semibold text-gray-800">Location Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <F isEditing={isEditing} label="Address" k="address" form={form} setForm={setForm} span />
            <F isEditing={isEditing} label="City" k="city" form={form} setForm={setForm} />
            <F isEditing={isEditing} label="State" k="state" form={form} setForm={setForm} />
            <F isEditing={isEditing} label="Pincode" k="pincode" form={form} setForm={setForm} maxLength={6} />
            <F isEditing={isEditing} label="Google Map Link" k="googleMapLink" form={form} setForm={setForm} span />
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : "Save Changes"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          )}
        </form>
      )}

      {/* Branding Tab */}
      {activeTab === "branding" && (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Branding & Theme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.themeColorPrimary || "#1976d2"}
                  disabled={!isEditing}
                  onChange={(e) => setForm({ ...form, themeColorPrimary: e.target.value })}
                  className={`w-12 h-10 border border-gray-200 rounded-lg ${isEditing ? "cursor-pointer" : "opacity-60"}`} />
                <span className="text-sm text-gray-600 font-mono">{form.themeColorPrimary}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.themeColorSecondary || "#ffffff"}
                  disabled={!isEditing}
                  onChange={(e) => setForm({ ...form, themeColorSecondary: e.target.value })}
                  className={`w-12 h-10 border border-gray-200 rounded-lg ${isEditing ? "cursor-pointer" : "opacity-60"}`} />
                <span className="text-sm text-gray-600 font-mono">{form.themeColorSecondary}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Logo</label>
              {isEditing ? (
                <input type="file" accept="image/*" onChange={handleLogoChange}
                  className="w-full text-sm text-gray-500" />
              ) : (
                <div className="text-sm text-gray-500 italic">Switch to edit mode to change logo</div>
              )}
              {logoPreview && <img src={logoPreview} alt="logo" className="mt-2 w-16 h-16 rounded-xl object-cover" />}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover Image</label>
              {isEditing ? (
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500" />
              ) : (
                <div className="text-sm text-gray-500 italic">Switch to edit mode to change cover</div>
              )}
              {college?.coverImage && !coverFile && (
                <img src={`http://localhost:8000${college.coverImage}`} alt="cover"
                  className="mt-2 w-full h-20 rounded-xl object-cover" />
              )}
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : "Save Changes"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          )}
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-orange-50 rounded-lg"><Lock size={16} className="text-orange-600" /></div>
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
                  <input type={showPw[vis] ? "text" : "password"} required
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition" />
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
            {pwLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Changing...</> : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
