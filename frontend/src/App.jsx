import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentManagement from './pages/Admin/StudentManagement';
import RoomManagement from './pages/Admin/RoomManagement';
import UserAccounts from './pages/Admin/UserAccounts';
import SystemLogs from './pages/Admin/SystemLogs';

// AD Pages
import ADDashboard from './pages/AD/ADDashboard';
import MarkAttendance from './pages/AD/MarkAttendance';
import AttendanceHistory from './pages/AD/AttendanceHistory';

// Director Pages
import DirectorDashboard from './pages/Director/DirectorDashboard';
import DefaultersList from './pages/Director/DefaultersList';
import Reports from './pages/Director/Reports';

// Shared Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfile from './pages/Shared/StudentProfile';
import LateEntryRegister from './pages/Shared/LateEntryRegister';
import LeaveManagement from './pages/Shared/LeaveManagement';
import MessPoll from './pages/AD/MessPoll';
import MaintenanceRegistry from './pages/AD/MaintenanceRegistry';
import Announcements from './pages/Shared/Announcements';
import StudentSettings from './pages/Student/StudentSettings';
import FeedbackViewer from './pages/Shared/FeedbackViewer';

// Guard for protected routes checking roles
const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to default dashboard based on user role
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'AD') return <Navigate to="/ad" replace />;
    if (user.role === 'Director') return <Navigate to="/director" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route director for the base URL `/`
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'AD') return <Navigate to="/ad" replace />;
  if (user.role === 'Director') return <Navigate to="/director" replace />;
  if (user.role === 'Student') return <Navigate to="/student" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  React.useEffect(() => {
    // Background wake-up request to eliminate Render cold start times
    API.get('/health').catch(() => {});
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Guarded Layout Routes */}
            <Route path="/" element={<Layout />}>
              {/* Base Redirect */}
              <Route index element={<RootRedirect />} />

              {/* Admin Scope */}
              <Route path="admin" element={
                <RoleGuard allowedRoles={['Admin']}>
                  <AdminDashboard />
                </RoleGuard>
              } />
              <Route path="manage-students" element={
                <RoleGuard allowedRoles={['Admin']}>
                  <StudentManagement />
                </RoleGuard>
              } />
              <Route path="manage-rooms" element={
                <RoleGuard allowedRoles={['Admin']}>
                  <RoomManagement />
                </RoleGuard>
              } />
              <Route path="manage-accounts" element={
                <RoleGuard allowedRoles={['Admin']}>
                  <UserAccounts />
                </RoleGuard>
              } />
              <Route path="system-logs" element={
                <RoleGuard allowedRoles={['Admin']}>
                  <SystemLogs />
                </RoleGuard>
              } />

              {/* AD Scope */}
              <Route path="ad" element={
                <RoleGuard allowedRoles={['AD']}>
                  <ADDashboard />
                </RoleGuard>
              } />
              <Route path="mark-attendance" element={
                <RoleGuard allowedRoles={['AD']}>
                  <MarkAttendance />
                </RoleGuard>
              } />
              <Route path="attendance-history" element={
                <RoleGuard allowedRoles={['AD']}>
                  <AttendanceHistory />
                </RoleGuard>
              } />
              <Route path="mess-poll" element={
                <RoleGuard allowedRoles={['AD', 'Admin']}>
                  <MessPoll />
                </RoleGuard>
              } />
              <Route path="maintenance" element={
                <RoleGuard allowedRoles={['AD', 'Admin', 'Director']}>
                  <MaintenanceRegistry />
                </RoleGuard>
              } />
              
              <Route path="feedback" element={
                <RoleGuard allowedRoles={['AD', 'Admin', 'Director']}>
                  <FeedbackViewer />
                </RoleGuard>
              } />
              <Route path="announcements" element={
                <RoleGuard allowedRoles={['AD', 'Admin']}>
                  <Announcements />
                </RoleGuard>
              } />

              {/* Director Scope */}
              <Route path="director" element={
                <RoleGuard allowedRoles={['Director']}>
                  <DirectorDashboard />
                </RoleGuard>
              } />
              <Route path="defaulters" element={
                <RoleGuard allowedRoles={['Director']}>
                  <DefaultersList />
                </RoleGuard>
              } />
              <Route path="reports" element={
                <RoleGuard allowedRoles={['Director', 'AD']}>
                  <Reports />
                </RoleGuard>
              } />

              {/* Student Scope */}
              <Route path="student" element={
                <RoleGuard allowedRoles={['Student']}>
                  <StudentDashboard />
                </RoleGuard>
              } />
              <Route path="student-settings" element={
                <RoleGuard allowedRoles={['Student']}>
                  <StudentSettings />
                </RoleGuard>
              } />

              {/* Shared Scope (All logged in users) */}
              <Route path="students/:id" element={
                <RoleGuard allowedRoles={['Admin', 'AD', 'Director']}>
                  <StudentProfile />
                </RoleGuard>
              } />
              <Route path="late-entry" element={
                <RoleGuard allowedRoles={['AD']}>
                  <LateEntryRegister />
                </RoleGuard>
              } />
              <Route path="leave-management" element={
                <RoleGuard allowedRoles={['Admin', 'AD', 'Director']}>
                  <LeaveManagement />
                </RoleGuard>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
