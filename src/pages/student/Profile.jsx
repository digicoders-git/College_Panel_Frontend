import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { User, Phone, Mail, BookOpen, GraduationCap, Lock, Pencil, X, Check, Camera } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300 font-normal">—</span>}</span>
  </div>
);

const Section = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 ${color}`}>
      <Icon size={16} />
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", maxLength, isEditing, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</label>
    {isEditing ? (
      children || (
        <input type={type} value={value || ""} onChange={onChange} maxLength={maxLength}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition" />
      )
    ) : (
      <span className="text-sm font-medium text-gray-800">
        {type === "date" && value ? value.slice(0, 10) : (value || <span className="text-gray-300 font-normal">—</span>)}
      </span>
    )}
  </div>
);

export default function StudentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [personal, setPersonal] = useState({});
  const [academic, setAcademic] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const loadProfile = () => {
    api.get("/students/profile").then((r) => {
      const s = r.data.student;
      setProfileData(s);
      setForm({ name: s.name || "", mobile: s.mobile || "" });
      setPersonal(s.personalDetails || {});
      setAcademic(s.academicDetails || {});
      if (s.profilePic) setPreview(s.profilePic.startsWith("http") ? s.profilePic : `${BASE_URL}${s.profilePic}`);
    }).catch(() => toast.error("Failed to load profile"));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return toast.error("Mobile must be 10 digits");
    if (personal.aadharNumber && !/^\d{12}$/.test(personal.aadharNumber)) return toast.error("Aadhar must be 12 digits");

    setLoading(true);
    try {
      let data;
      if (profilePic) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("mobile", form.mobile);
        fd.append("personalDetails", JSON.stringify(personal));
        fd.append("academicDetails", JSON.stringify(academic));
        fd.append("profilePic", profilePic);
        const res = await api.put("/students/profile/upload-pic", fd);
        data = res.data;
      } else {
        const res = await api.put("/students/profile", { name: form.name, mobile: form.mobile, personalDetails: personal, academicDetails: academic });
        data = res.data;
      }
      const s = data.student;
      setProfileData(s);
      setForm({ name: s.name || "", mobile: s.mobile || "" });
      setPersonal(s.personalDetails || {});
      setAcademic(s.academicDetails || {});
      if (s.profilePic) setPreview(s.profilePic.startsWith("http") ? s.profilePic : `${BASE_URL}${s.profilePic}`);
      setProfilePic(null);
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
    setPwLoading(true);
    try {
      await api.put("/students/change-password", pwForm);
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = (profileData?.name || user?.name || "S").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl space-y-5">

      {/* Status Banner */}
      {user?.status === "disapproved" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
          ❌ Registration disapproved: {user?.disapproveReason || "No reason provided"}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center text-2xl font-bold">
              {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : initials}
            </div>
            {isEditing && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md">
                <Camera size={13} className="text-blue-600" />
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) { setProfilePic(f); setPreview(URL.createObjectURL(f)); } }} />
              </label>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profileData?.name || user?.name}</h2>
            <p className="text-blue-100 text-sm mt-0.5">{profileData?.email || user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{profileData?.branch?.branchName || user?.branch?.branchName}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                (profileData?.status || user?.status) === "approved" ? "bg-green-400/30 text-green-100" :
                (profileData?.status || user?.status) === "pending" ? "bg-yellow-400/30 text-yellow-100" :
                "bg-red-400/30 text-red-100"
              }`}>
                {profileData?.status || user?.status}
              </span>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl transition">
              <Pencil size={16} />
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)}
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl transition">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
          {[
            { icon: Phone, label: "Mobile", value: profileData?.mobile || user?.mobile },
            { icon: Mail, label: "Email", value: (profileData?.email || user?.email)?.split("@")[0] + "..." },
            { icon: GraduationCap, label: "Roll No", value: profileData?.academicDetails?.rollNumber || "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <Icon size={14} className="text-blue-200" />
              <span className="text-[10px] text-blue-200">{label}</span>
              <span className="text-xs font-semibold truncate w-full text-center">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Basic Info */}
        <Section title="Basic Info" icon={User} color="bg-blue-50 text-blue-700">
          <Field isEditing={isEditing} label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field isEditing={isEditing} label="Mobile" value={form.mobile} maxLength={10}
            onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
        </Section>

        {/* Personal Details */}
        <Section title="Personal Details" icon={User} color="bg-purple-50 text-purple-700">
          <Field isEditing={isEditing} label="Date of Birth" value={personal.dob?.slice(0, 10)} type="date"
            onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
          <Field isEditing={isEditing} label="Gender" value={personal.gender}>
            {isEditing && (
              <select value={personal.gender || ""} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <option value="">Select</option>
                {["Male", "Female", "Other"].map(g => <option key={g}>{g}</option>)}
              </select>
            )}
          </Field>
          <Field isEditing={isEditing} label="Father's Name" value={personal.fatherName} onChange={(e) => setPersonal({ ...personal, fatherName: e.target.value })} />
          <Field isEditing={isEditing} label="Mother's Name" value={personal.motherName} onChange={(e) => setPersonal({ ...personal, motherName: e.target.value })} />
          <Field isEditing={isEditing} label="Blood Group" value={personal.bloodGroup} onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })} />
          <Field isEditing={isEditing} label="Aadhar Number" value={personal.aadharNumber} maxLength={12}
            onChange={(e) => setPersonal({ ...personal, aadharNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} />
          <Field isEditing={isEditing} label="City" value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} />
          <Field isEditing={isEditing} label="State" value={personal.state} onChange={(e) => setPersonal({ ...personal, state: e.target.value })} />
        </Section>

        {/* Academic Details */}
        <Section title="Academic Details" icon={BookOpen} color="bg-green-50 text-green-700">
          <Field isEditing={isEditing} label="Roll Number" value={academic.rollNumber} onChange={(e) => setAcademic({ ...academic, rollNumber: e.target.value })} />
          <Field isEditing={isEditing} label="Enrollment Number" value={academic.enrollmentNumber} onChange={(e) => setAcademic({ ...academic, enrollmentNumber: e.target.value })} />
          <Field isEditing={isEditing} label="Admission Year" value={academic.admissionYear} maxLength={4}
            onChange={(e) => setAcademic({ ...academic, admissionYear: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
          <Field isEditing={isEditing} label="Current Semester" value={academic.currentSemester} type="number"
            onChange={(e) => setAcademic({ ...academic, currentSemester: e.target.value })} />
          <Field isEditing={isEditing} label="Previous School" value={academic.previousSchool} onChange={(e) => setAcademic({ ...academic, previousSchool: e.target.value })} />
          <Field isEditing={isEditing} label="Previous Percentage" value={academic.previousPercentage} onChange={(e) => setAcademic({ ...academic, previousPercentage: e.target.value })} />
        </Section>

        {isEditing && (
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md">
              <Check size={16} /> {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-2xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50 text-gray-700">
          <Lock size={16} />
          <span className="text-sm font-semibold">Change Password</span>
        </div>
        <div className="p-5 space-y-4">
          {[{ key: "currentPassword", label: "Current Password" }, { key: "newPassword", label: "New Password" }].map(({ key, label }) => (
            <div key={key}>
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
              <input type="password" required value={pwForm[key]}
                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition" />
            </div>
          ))}
          <button type="submit" disabled={pwLoading}
            className="w-full bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-60 transition">
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
