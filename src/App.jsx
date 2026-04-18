import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Public
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import StudentRegister from "./pages/student/Register";

// SuperAdmin
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminColleges from "./pages/superadmin/Colleges";
import SuperAdminProfile from "./pages/superadmin/Profile";
import CollegeStats from "./pages/superadmin/CollegeStats";
import SuperAdminBranches from "./pages/superadmin/Branches";

// College
import CollegeDashboard from "./pages/college/Dashboard";
import CollegeStaff from "./pages/college/Staff";
import CollegeStudents from "./pages/college/Students";
import CollegeBranches from "./pages/college/Branches";
import CollegeRoles from "./pages/college/Roles";
import CollegeProfile from "./pages/college/Profile";

// Staff
import StaffDashboard from "./pages/staff/Dashboard";
import StaffStudents from "./pages/staff/Students";
import StaffNotices from "./pages/staff/Notices";
import StaffProfile from "./pages/staff/Profile";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";

// Shared
import Timetable from "./pages/shared/Timetable";
import CalendarPage from "./pages/shared/Calendar";
import Notifications from "./pages/shared/Notifications";

import {
  LayoutDashboard, Building2, Users, GraduationCap,
  Bell, Clock, Calendar, GitBranch, Shield, User,
} from "lucide-react";

const SUPER_ADMIN_NAV = [
  { to: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/superadmin/colleges",  label: "Colleges",  icon: Building2 },
  { to: "/superadmin/profile",   label: "Profile",   icon: User },
];

const COLLEGE_NAV = [
  { to: "/college/dashboard",     label: "Dashboard", icon: LayoutDashboard },
  { to: "/college/branches",      label: "Branches",  icon: GitBranch },
  { to: "/college/roles",         label: "Roles",     icon: Shield },
  { to: "/college/staff",         label: "Staff",     icon: Users },
  { to: "/college/students",      label: "Students",  icon: GraduationCap },
  { to: "/college/notices",       label: "Notices",   icon: Bell },
  { to: "/college/notifications", label: "Notifications", icon: Bell },
  { to: "/college/profile",       label: "Profile",   icon: User },
];

const STAFF_NAV = [
  { to: "/staff/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { to: "/staff/students",      label: "Students",     icon: GraduationCap },
  { to: "/staff/notices",       label: "Notices",      icon: Bell },
  { to: "/staff/timetable",     label: "Timetable",    icon: Clock },
  { to: "/staff/calendar",      label: "Calendar",     icon: Calendar },
  { to: "/staff/notifications", label: "Notifications",icon: Bell },
  { to: "/staff/profile",       label: "Profile",      icon: User },
];

const STUDENT_NAV = [
  { to: "/student/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { to: "/student/notices",       label: "Notices",      icon: Bell },
  { to: "/student/timetable",     label: "Timetable",    icon: Clock },
  { to: "/student/calendar",      label: "Calendar",     icon: Calendar },
  { to: "/student/notifications", label: "Notifications",icon: Bell },
  { to: "/student/profile",       label: "Profile",      icon: User },
];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* SuperAdmin */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <DashboardLayout navItems={SUPER_ADMIN_NAV} title="Super Admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"              element={<SuperAdminDashboard />} />
            <Route path="colleges"               element={<SuperAdminColleges />} />
            <Route path="colleges/:id/stats"     element={<CollegeStats />} />
            <Route path="branches"               element={<SuperAdminBranches />} />
            <Route path="profile"                element={<SuperAdminProfile />} />
          </Route>

          {/* College */}
          <Route path="/college" element={
            <ProtectedRoute allowedRoles={["college"]}>
              <DashboardLayout navItems={COLLEGE_NAV} title="College Panel" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<CollegeDashboard />} />
            <Route path="branches"      element={<CollegeBranches />} />
            <Route path="roles"         element={<CollegeRoles />} />
            <Route path="staff"         element={<CollegeStaff />} />
            <Route path="students"      element={<CollegeStudents />} />
            <Route path="notices"       element={<StaffNotices />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<CollegeProfile />} />
          </Route>

          {/* Staff */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <DashboardLayout navItems={STAFF_NAV} title="Staff Panel" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<StaffDashboard />} />
            <Route path="students"      element={<StaffStudents />} />
            <Route path="notices"       element={<StaffNotices />} />
            <Route path="timetable"     element={<Timetable />} />
            <Route path="calendar"      element={<CalendarPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<StaffProfile />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout navItems={STUDENT_NAV} title="Student Panel" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<StudentDashboard />} />
            <Route path="notices"       element={<StaffNotices />} />
            <Route path="timetable"     element={<Timetable />} />
            <Route path="calendar"      element={<CalendarPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<StudentProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
