import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { Menu, Bell, User, Clock, AlertTriangle, Check } from 'lucide-react';

const Topbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => n.status === 'Unread').length);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications');
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking notifications as read:', e);
    }
  };

  const getAlertStyle = (level) => {
    if (level === 'High Risk') return 'bg-rose-50 text-rose-600 border border-rose-100';
    if (level === 'Warning') return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-blue-50 text-blue-600 border border-blue-100';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm/5">
      {/* Mobile Burger Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 md:hidden transition-colors"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        
        {/* Date view */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Clock className="w-4 h-4 text-gray-300" />
          <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-primary transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce-subtle">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 border-b border-gray-100">
                <span className="font-bold text-gray-700 text-sm">System Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                    No active notifications or alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-3.5 transition-colors ${n.status === 'Unread' ? 'bg-blue-50/10' : ''}`}
                    >
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 h-fit ${getAlertStyle(n.level)}`}>
                          {n.level || 'Log'}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-gray-800 leading-tight">{n.title}</h4>
                          <p className="text-gray-500 text-[11px] mt-1 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-gray-400 font-semibold block mt-1.5">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-100" />

        {/* Profile Card */}
        <div className="flex items-center gap-2">
          <div className="w-8.5 h-8.5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User className="w-4 h-4" />}
          </div>
          <div className="hidden lg:block text-left">
            <h3 className="text-xs font-bold text-gray-700 leading-tight">{user?.name}</h3>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
