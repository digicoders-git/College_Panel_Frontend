import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getImgUrl } from "../../utils/imageUrl";


const Field = ({ label, value, onChange, type = "text", maxLength, isEditing }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {isEditing ? (
      <input type={type} value={value || ""} onChange={onChange} maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
    ) : (
      <div className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium whitespace-pre-wrap">
        {type === "date" && value ? value.slice(0, 10) : (value || <span className="text-gray-400 font-normal italic">Not specified</span>)}
      </div>
    )}
  </div>
);

export default function StaffProfile() {
  const { login, role, token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [personal, setPersonal] = useState({});
  const [professional, setProfessional] = useState({});
  const [study, setStudy] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const populateForm = (s) => {
    setForm({ name: s.name || "", mobile: s.mobile || "" });
    setPersonal(s.personalDetails || {});
    setProfessional(s.professionalDetails || {});
    setStudy(s.studyDetails || {});
    if (s.profilePic) setPreview(getImgUrl(s.profilePic));
  };

  useEffect(() => {
    if (authUser) populateForm(authUser);
    api.get("/staff/profile").then((r) => {
      populateForm(r.data.staff);
      login({ token, role, user: r.data.staff });
    }).catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return toast.error("Mobile must be 10 digits");
    if (personal.aadharNumber && !/^\d{12}$/.test(personal.aadharNumber)) return toast.error("Aadhar must be 12 digits");
    if (personal.pincode && !/^\d{6}$/.test(personal.pincode)) return toast.error("Pincode must be 6 digits");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("mobile", form.mobile);
      fd.append("personalDetails", JSON.stringify(personal));
      fd.append("professionalDetails", JSON.stringify(professional));
      fd.append("studyDetails", JSON.stringify(study));
      if (profilePic) fd.append("profilePic", profilePic);
      const { data } = await api.put("/staff/profile", fd);
      login({ token, role, user: data.staff });
      setProfilePic(null);
      if (data.staff.profilePic) {
        setPreview(getImgUrl(data.staff.profilePic));
      }
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
      await api.put("/staff/change-password", pwForm);
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-all hover:shadow-md">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center ring-4 ring-indigo-50 shadow-lg shadow-indigo-500/20 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-white px-2">No Photo</span>
            )}
          </div>
          {isEditing && (
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-xl ring-2 ring-white active:scale-90">
              <Camera size={14} strokeWidth={2.5} />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfilePic(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }} />
            </label>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-2">
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight truncate">{form.name || "—"}</h2>
            <div className="inline-flex self-center sm:self-auto px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-[0.15em] border border-indigo-100">
              {professional.designation || "Staff"}
            </div>
          </div>
          <p className="text-sm text-gray-400 font-semibold mb-4">{professional.department || "No Department"}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Phone size={12} className="text-indigo-500" />
              <span className="font-medium">{form.mobile || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider tabular-nums">
              ID: {professional.employeeId || "—"}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Basic */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg"><User size={16} className="text-indigo-600" /></div>
            <h2 className="font-bold text-gray-800">Account Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field isEditing={isEditing} label="Mobile Number" value={form.mobile} maxLength={10} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
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
            <Field isEditing={isEditing} label="Blood Group" value={personal.bloodGroup} onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })} />
            <Field isEditing={isEditing} label="Aadhar Number" value={personal.aadharNumber} maxLength={12} onChange={(e) => setPersonal({ ...personal, aadharNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })} />
            <Field isEditing={isEditing} label="PAN Number" value={personal.panNumber} maxLength={10} onChange={(e) => setPersonal({ ...personal, panNumber: e.target.value.toUpperCase().slice(0, 10) })} />
            <Field isEditing={isEditing} label="City" value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} />
            <Field isEditing={isEditing} label="State" value={personal.state} onChange={(e) => setPersonal({ ...personal, state: e.target.value })} />
            <Field isEditing={isEditing} label="Pincode" value={personal.pincode} maxLength={6} onChange={(e) => setPersonal({ ...personal, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
          </div>
        </div>

        {/* Professional */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-1">Professional Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Employee ID" value={professional.employeeId} onChange={(e) => setProfessional({ ...professional, employeeId: e.target.value })} />
            <Field isEditing={isEditing} label="Designation" value={professional.designation} onChange={(e) => setProfessional({ ...professional, designation: e.target.value })} />
            <Field isEditing={isEditing} label="Department" value={professional.department} onChange={(e) => setProfessional({ ...professional, department: e.target.value })} />
            <Field isEditing={isEditing} label="Experience" value={professional.experience} onChange={(e) => setProfessional({ ...professional, experience: e.target.value })} />
            <Field isEditing={isEditing} label="Qualification" value={professional.qualification} onChange={(e) => setProfessional({ ...professional, qualification: e.target.value })} />
            <Field isEditing={isEditing} label="Specialization" value={professional.specialization} onChange={(e) => setProfessional({ ...professional, specialization: e.target.value })} />
          </div>
        </div>

        {/* Study */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-1">Study Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field isEditing={isEditing} label="Highest Degree" value={study.highestDegree} onChange={(e) => setStudy({ ...study, highestDegree: e.target.value })} />
            <Field isEditing={isEditing} label="University" value={study.university} onChange={(e) => setStudy({ ...study, university: e.target.value })} />
            <Field isEditing={isEditing} label="Passing Year" value={study.passingYear} type="number" onChange={(e) => setStudy({ ...study, passingYear: e.target.value })} />
            <Field isEditing={isEditing} label="Percentage" value={study.percentage} onChange={(e) => setStudy({ ...study, percentage: e.target.value })} />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition shadow-md">
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
