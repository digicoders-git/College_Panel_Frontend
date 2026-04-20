import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Trash2, Eye, X, User, Phone, Mail, BookOpen, GraduationCap } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  disapproved: "bg-red-100 text-red-700",
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">—</span>}</span>
  </div>
);

const SectionBlock = ({ title, icon: Icon, color, children }) => (
  <div>
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-100`}>
      <Icon size={14} className={color} />
      <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{title}</span>
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
  </div>
);

function StudentDetailModal({ student, onClose }) {
  const pic = student.profilePic
    ? (student.profilePic.startsWith("http") ? student.profilePic : `${BASE_URL}${student.profilePic}`)
    : null;
  const initials = student.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "S";
  const p = student.personalDetails || {};
  const a = student.academicDetails || {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center text-xl font-bold shrink-0">
                {pic ? <img src={pic} alt="Profile" className="w-full h-full object-cover" /> : initials}
              </div>
              <div>
                <h2 className="text-lg font-bold">{student.name}</h2>
                <p className="text-blue-100 text-sm">{student.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{student.branch?.branchName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    student.status === "approved" ? "bg-green-400/30 text-green-100" :
                    student.status === "pending" ? "bg-yellow-400/30 text-yellow-100" :
                    "bg-red-400/30 text-red-100"
                  }`}>{student.status}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition">
              <X size={16} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
            {[
              { icon: Phone, label: "Mobile", value: student.mobile },
              { icon: GraduationCap, label: "Roll No", value: a.rollNumber },
              { icon: BookOpen, label: "Semester", value: a.currentSemester ? `Sem ${a.currentSemester}` : null },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 text-center">
                <Icon size={13} className="text-blue-200" />
                <span className="text-[10px] text-blue-200">{label}</span>
                <span className="text-xs font-semibold">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5">

          {/* Disapprove reason */}
          {student.status === "disapproved" && student.disapproveReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              ❌ Reason: {student.disapproveReason}
            </div>
          )}

          <SectionBlock title="Personal Details" icon={User} color="text-purple-600">
            <InfoRow label="Date of Birth" value={p.dob?.slice(0, 10)} />
            <InfoRow label="Gender" value={p.gender} />
            <InfoRow label="Father's Name" value={p.fatherName} />
            <InfoRow label="Mother's Name" value={p.motherName} />
            <InfoRow label="Blood Group" value={p.bloodGroup} />
            <InfoRow label="Aadhar Number" value={p.aadharNumber} />
            <InfoRow label="City" value={p.city} />
            <InfoRow label="State" value={p.state} />
          </SectionBlock>

          <SectionBlock title="Academic Details" icon={BookOpen} color="text-green-600">
            <InfoRow label="Roll Number" value={a.rollNumber} />
            <InfoRow label="Enrollment No" value={a.enrollmentNumber} />
            <InfoRow label="Admission Year" value={a.admissionYear} />
            <InfoRow label="Current Semester" value={a.currentSemester} />
            <InfoRow label="Previous School" value={a.previousSchool} />
            <InfoRow label="Previous %" value={a.previousPercentage} />
          </SectionBlock>
        </div>
      </div>
    </div>
  );
}

export default function StaffStudents() {
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [disapproveModal, setDisapproveModal] = useState(null);
  const [reason, setReason] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  const fetchStudents = () => {
    api.get(`/students/branch?status=${statusFilter}`)
      .then((r) => setStudents(r.data.students || []))
      .catch(() => toast.error("Failed to load students"));
  };

  useEffect(() => { fetchStudents(); }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/students/${id}/approve`);
      toast.success("Student approved!");
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDisapprove = async () => {
    try {
      await api.patch(`/students/${disapproveModal}/disapprove`, { reason });
      toast.success("Student disapproved");
      setDisapproveModal(null);
      setReason("");
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}/delete`);
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Branch Students</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disapproved">Disapproved</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {["Name", "Email", "Mobile", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.mobile}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewStudent(s)} className="text-blue-500 hover:text-blue-700 transition" title="View Details">
                        <Eye size={17} />
                      </button>
                      {s.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(s._id)} className="text-green-500 hover:text-green-700 transition" title="Approve">
                            <CheckCircle size={17} />
                          </button>
                          <button onClick={() => setDisapproveModal(s._id)} className="text-red-400 hover:text-red-600 transition" title="Disapprove">
                            <XCircle size={17} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(s._id)} className="text-gray-400 hover:text-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Modal */}
      {viewStudent && <StudentDetailModal student={viewStudent} onClose={() => setViewStudent(null)} />}

      {/* Disapprove Modal */}
      {disapproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-gray-800 mb-3">Disapprove Student</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)" rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setDisapproveModal(null)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleDisapprove} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600">Disapprove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
