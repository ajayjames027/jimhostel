import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  LayoutDashboard,
  UserCheck,
  History,
  Users,
  Home,
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardList,
  LogOut,
  X,
  FileText,
  BookOpen,
  Calendar,
  Coffee,
  Wrench,
  MessageSquare,
  Settings,
  Utensils,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adLinks = [
    { to: '/ad', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mark-attendance', label: 'Mark Attendance', icon: UserCheck },
    { to: '/announcements', label: 'Announcements', icon: Bell },
    { to: '/attendance-history', label: 'Attendance History', icon: History },
    { to: '/late-entry', label: 'Late Entry Register', icon: BookOpen },
    { to: '/egate-pass', label: 'Express Outpasses', icon: ShieldCheck },
    { to: '/calendar', label: 'College Calendar', icon: Calendar },
    { to: '/leave-management', label: 'Leave Management', icon: Calendar },
    { to: '/mess-poll', label: 'Mess Food Poll', icon: Coffee },
    { to: '/mess-menu', label: 'Digital Mess Menu', icon: Utensils },
    { to: '/maintenance', label: 'Maintenance Issues', icon: Wrench },
    { to: '/feedback', label: 'Student Feedback', icon: MessageSquare },
    { to: '/reports', label: 'Download Reports', icon: FileSpreadsheet },
  ];

  const directorLinks = [
    { to: '/director', label: 'Director Dashboard', icon: LayoutDashboard },
    { to: '/defaulters', label: 'Defaulters List', icon: AlertTriangle },
    { to: '/leave-management', label: 'Leave Management', icon: Calendar },
    { to: '/mess-menu', label: 'Digital Mess Menu', icon: Utensils },
    { to: '/feedback', label: 'Student Feedback', icon: MessageSquare },
    { to: '/reports', label: 'Download Reports', icon: FileSpreadsheet },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/manage-students', label: 'Manage Students', icon: Users },
    { to: '/announcements', label: 'Announcements', icon: Bell },
    { to: '/manage-rooms', label: 'Manage Rooms', icon: Home },
    { to: '/manage-accounts', label: 'User Accounts', icon: UserPlus },
    { to: '/egate-pass', label: 'Express Outpasses', icon: ShieldCheck },
    { to: '/calendar', label: 'College Calendar', icon: Calendar },
    { to: '/leave-management', label: 'Leave Management', icon: Calendar },
    { to: '/mess-poll', label: 'Mess Food Poll', icon: Coffee },
    { to: '/mess-menu', label: 'Digital Mess Menu', icon: Utensils },
    { to: '/maintenance', label: 'Maintenance Issues', icon: Wrench },
    { to: '/feedback', label: 'Student Feedback', icon: MessageSquare },
    { to: '/system-logs', label: 'System Logs', icon: FileText },
  ];

  const studentLinks = [
    { to: '/student', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/mess-menu', label: 'Digital Mess Menu', icon: Utensils },
    { to: '/my-gate-passes', label: 'E-Gate Passes', icon: ShieldCheck },
    { to: '/student-settings', label: 'Requests & Settings', icon: Settings }
  ];

  const foodCommitteeLinks = [
    { to: '/mess-poll', label: 'Poll Results', icon: Coffee }
  ];

  const maintenanceLinks = [
    { to: '/maintenance', label: 'Work Orders', icon: Wrench }
  ];

  const calendarAdminLinks = [
    { to: '/calendar', label: 'Calendar Planner', icon: Calendar }
  ];

  let links = [];
  if (user?.role === 'AD') links = adLinks;
  else if (user?.role === 'Director') links = directorLinks;
  else if (user?.role === 'Admin') links = adminLinks;
  else if (user?.role === 'Student') links = studentLinks;
  else if (user?.role === 'FoodCommittee') links = foodCommitteeLinks;
  else if (user?.role === 'Maintenance') links = maintenanceLinks;
  else if (user?.role === 'CalendarAdmin') links = calendarAdminLinks;

  const activeClass = "flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-primary font-semibold transition-all duration-200 border-l-4 border-primary shadow-sm";
  const inactiveClass = "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`z-40 flex flex-col w-64 bg-white border-r border-gray-100 transition-all duration-300 ${
          isOpen 
            ? 'fixed top-0 bottom-0 left-0 z-50 translate-x-0' 
            : 'fixed top-0 bottom-0 left-0 z-50 -translate-x-full md:relative md:translate-x-0 md:h-auto md:z-30 md:top-0'
        }`}
      >
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <div>
              <h1 className="font-bold text-primary tracking-wide leading-tight">JIM HOSTEL</h1>
              <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase">Attendance</span>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/20 to-indigo-50/20">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logged In As</p>
          <h2 className="font-bold text-gray-800 text-sm mt-0.5">{user?.name || 'Loading...'}</h2>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1.5 uppercase bg-primary/10 text-primary">
            {user?.role}
          </span>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/ad' || link.to === '/director' || link.to === '/admin' || link.to === '/student'}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
