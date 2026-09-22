import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Home, UserCheck, AlertTriangle, Users, Clock, ClipboardList, ChevronRight, FileSpreadsheet } from 'lucide-react';

const ADDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [absents, setAbsents] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch stats summary
      const summaryRes = await API.get('/dashboard/summary');
      setStats(summaryRes.data);

      // Fetch trends for date-wise summary
      const analyticsRes = await API.get('/analytics');
      setTrends(analyticsRes.data.trends || []);

      // Fetch today's absent list
      const today = new Date().toISOString().split('T')[0];
      const absRes = await API.get(`/attendance/history?date=${today}&status=Absent`);
      setAbsents(absRes.data);
    } catch (e) {
      showToast('Error loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">AD Control Panel</h2>
        <p className="text-gray-500 text-xs mt-1">Hostel operations, daily roll calls, and check-in logs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-primary">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Rooms</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.total_rooms}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-success">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Roll Calls Done</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.rooms_completed} Rooms</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-warning">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Roll Calls Pending</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.rooms_pending} Rooms</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-danger animate-pulse-subtle">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Absent today</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.absent_today} Students</h3>
          </div>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Absentees Feed */}
        <div className="premium-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Today's Absent Roll Call list
          </h3>
          
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto pr-1">
            {absents.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No students marked absent today. Great!</p>
            ) : (
              absents.map((abs) => (
                <div key={abs._id} className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{abs.student_name}</h4>
                    <p className="text-gray-400 text-[10px] font-semibold mt-0.5">Room {abs.room_number} | {abs.type.toUpperCase()}</p>
                  </div>
                  {abs.remarks ? (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-semibold rounded-lg border border-rose-100/50">
                      "{abs.remarks}"
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg uppercase">
                      No remarks
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick actions menu */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Quick Actions Panel
          </h3>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/mark-attendance"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5" /> Start Daily Roll Call
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

             <Link
              to="/reports"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5" /> Download Reports
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        
        {/* Date-Wise Summary */}
        <div className="premium-card p-6 space-y-4 h-fit mt-6 lg:mt-0 lg:col-span-1">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 block truncate">
            Recent Date-Wise Summary
          </h3>
          <div className="space-y-3">
            {trends.slice().reverse().slice(0, 5).map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="font-bold text-gray-700">{t.date} <span className="text-[10px] text-gray-400">({t.label.split(' ')[1]})</span></div>
                <div className="flex gap-2">
                  <span className="text-emerald-600 font-bold">P:{t.present}</span>
                  <span className="text-rose-600 font-bold">A:{t.absent}</span>
                  <span className="text-amber-500 font-bold">L:{t.leave}</span>
                </div>
              </div>
            ))}
            {trends.length === 0 && <p className="text-[10px] text-gray-400">No trend data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADDashboard;
