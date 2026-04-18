import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Field = ({ label, value, onChange, type = "text", maxLength, isEditing }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {isEditing ? (
      <input type={type} value={value || ""} onChange={onChange} maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
    ) : (
      <div className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium">
        {type === "date" && value ? value.slice(0, 10) : (value || <span className="text-gray-400 font-normal italic">Not specified</span>)}
      </div>
    )}
  </div>
);

export default function StudentProfile() {
  const { user, login, role, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [personal, setPersonal] = useState({});
  const [academic, setAcademic] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = () => {
    const getImgUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8000";
      return `${base}${path}`;
    };

    api.get("/students/profile").then((r) => {
      const s = r.data.student;
      setForm({ name: s.name || "", mobile: s.mobile || "" });
      setPersonal(s.personalDetails || {});
      setAcademic(s.academicDetails || {});
      if (s.profilePic) setPreview(getImgUrl(s.profilePic));
    }).catch(() => toast.error("Failed to load profile"));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return toast.error("Mobile must be 10 digits");
    if (personal.aadharNumber && !/^\d{12}$/.test(personal.aadharNumber)) return toast.error("Aadhar number must be 12 digits");
    if (academic.admissionYear && (academic.admissionYear < 1900 || academic.admissionYear > 2100)) return toast.error("Invalid Admission Year");

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
        const res = await api.put("/students/profile", {
          name: form.name,
          mobile: form.mobile,
          personalDetails: personal,
          academicDetails: academic,
        });
        data = res.data;
      }
      const s = data.student;
      setForm({ name: s.name || "", mobile: s.mobile || "" });
      setPersonal(s.personalDetails || {});
      setAcademic(s.academicDetails || {});
      if (s.profilePic) {
        const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
        setPreview(`${base}${s.profilePic}`);
      }
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            Edit Profile
          </button>
        )}
      </div>

      {/* Status Banner */}
      {user?.status === "disapproved" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          ❌ Registration disapproved: {user?.disapproveReason || "No reason provided"}
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Basic */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field isEditing={isEditing} label="Mobile" value={form.mobile} maxLength={10} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">No<br/>Photo</div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex-1">
                    <input type="file" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfilePic(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <p className="text-[10px] text-gray-400 mt-1">JPG, PNG or WEBP. Max 2MB.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-1">Personal Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Date of Birth" value={personal.dob?.slice(0,10)} type="date" onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              {isEditing ? (
                <select value={personal.gender || ""} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select</option>
                  {["Male","Female","Other"].map(g => <option key={g}>{g}</option>)}
                </select>
              ) : (
                <div className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium">
                  {personal.gender || <span className="text-gray-400 font-normal italic">Not specified</span>}
                </div>
              )}
            </div>
            <Field isEditing={isEditing} label="Father's Name" value={personal.fatherName} onChange={(e) => setPersonal({ ...personal, fatherName: e.target.value })} />
            <Field isEditing={isEditing} label="Mother's Name" value={personal.motherName} onChange={(e) => setPersonal({ ...personal, motherName: e.target.value })} />
            <Field isEditing={isEditing} label="Blood Group" value={personal.bloodGroup} onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })} />
            <Field isEditing={isEditing} label="Aadhar Number" value={personal.aadharNumber} maxLength={12} onChange={(e) => setPersonal({ ...personal, aadharNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} />
            <Field isEditing={isEditing} label="City" value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} />
            <Field isEditing={isEditing} label="State" value={personal.state} onChange={(e) => setPersonal({ ...personal, state: e.target.value })} />
          </div>
        </div>

        {/* Academic */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-1">Academic Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Roll Number" value={academic.rollNumber} onChange={(e) => setAcademic({ ...academic, rollNumber: e.target.value })} />
            <Field isEditing={isEditing} label="Enrollment Number" value={academic.enrollmentNumber} onChange={(e) => setAcademic({ ...academic, enrollmentNumber: e.target.value })} />
            <Field isEditing={isEditing} label="Admission Year" value={academic.admissionYear} type="text" maxLength={4} onChange={(e) => setAcademic({ ...academic, admissionYear: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
            <Field isEditing={isEditing} label="Current Semester" value={academic.currentSemester} type="number" onChange={(e) => setAcademic({ ...academic, currentSemester: e.target.value })} />
            <Field isEditing={isEditing} label="Previous School" value={academic.previousSchool} onChange={(e) => setAcademic({ ...academic, previousSchool: e.target.value })} />
            <Field isEditing={isEditing} label="Previous Percentage" value={academic.previousPercentage} onChange={(e) => setAcademic({ ...academic, previousPercentage: e.target.value })} />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Change Password</h2>
        {[
          { key: "currentPassword", label: "Current Password" },
          { key: "newPassword",     label: "New Password" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input type="password" required value={pwForm[key]}
              onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <button type="submit" disabled={pwLoading}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60">
          {pwLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
