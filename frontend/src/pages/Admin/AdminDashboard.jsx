import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Users, Home, UserCheck, Shield, FileText, ChevronRight, UserPlus, Database, Activity, Server, Github, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [counts, setCounts] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch stats
      const summaryRes = await API.get('/dashboard/summary');
      
      // Fetch users
      const usersRes = await API.get('/accounts');
      
      // Fetch logs
      const logsRes = await API.get('/system-logs');
      
      setCounts({
        students: summaryRes.data.total_students,
        rooms: summaryRes.data.total_rooms,
        accounts: usersRes.data.length,
        logs: logsRes.data.length
      });
      
      setRecentLogs(logsRes.data.slice(0, 5));
      
      // Fetch system health diagnostics safely
      try {
        const healthRes = await API.get('/system/health');
        setSystemHealth(healthRes.data);
      } catch (e) {
        setSystemHealth({ status: 'unknown', error: 'Failed to retrieve metrics' });
      }
      
    } catch (e) {
      showToast('Error loading Admin dashboard statistics', 'error');
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
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">System Admin Console</h2>
        <p className="text-gray-500 text-xs mt-1">Configure student allocations, room capacities, accounts, and review audit logs</p>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Registered Students</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{counts?.students}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-success">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Rooms</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{counts?.rooms}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-warning">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Staff Accounts</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{counts?.accounts}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Logs Registered</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{counts?.logs} Actions</h3>
          </div>
        </div>
      </div>

      {/* Action lists split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent system audit actions */}
        <div className="premium-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-gray-400" /> Recent System Audit actions
          </h3>

          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No audit logs registered yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log._id} className="py-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{log.action}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString('en-GB')}</span>
                  </div>
                  <p className="text-gray-500 mt-1">{log.details}</p>
                  <span className="text-[9px] text-primary font-bold uppercase block mt-1.5">User: {log.username}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Quick Navigation */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Quick Navigation Panel
          </h3>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/manage-students"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5" /> Manage Students
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/manage-rooms"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <Home className="w-4.5 h-4.5" /> Manage Hostel Rooms
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/manage-accounts"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5" /> Manage Staff Accounts
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* System Diagnostics column */}
        <div className="premium-card p-6 space-y-5 h-fit lg:col-span-1">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-rose-500" /> Infrastructure Health
          </h3>

          <div className="space-y-4">
             {/* Vercel Status Badge */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2 mb-2">
                     <Server className="w-4 h-4 text-gray-600" />
                     <h4 className="font-bold text-gray-800 text-xs">Vercel Deployment</h4>
                   </div>
                </div>
                {/* Embedded Vercel Official SVG Status Badge */}
                <div className="mt-1">
                   <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                      <img src="https://therealsujitk-vercel-badge.vercel.app/?app=hostel-frontend" alt="Vercel Status" className="h-5 drop-shadow-sm" onError={(e) => {
                         // Fallback UI if badge fails to load
                         e.target.style.display = 'none';
                         e.target.parentElement.innerHTML = '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">● Vercel Server Online</span>';
                      }} />
                   </a>
                </div>
                <p className="text-[9px] text-gray-400 font-semibold mt-3 flex items-center gap-1"><Github className="w-3 h-3"/> Tracking 'main' branch</p>
             </div>
             
             {/* MongoDB Status Box */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                     <Database className="w-4 h-4 text-emerald-600" />
                     <h4 className="font-bold text-gray-800 text-xs">MongoDB Cluster</h4>
                   </div>
                   {systemHealth ? (
                      systemHealth.ok ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-rose-500" />
                   ) : (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                   )}
                </div>
                
                {systemHealth && (
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-semibold text-gray-500">
                    <div>Status: <span className={systemHealth.ok ? "text-success" : "text-rose-500"}>{systemHealth.status?.toUpperCase()}</span></div>
                    <div>Latency: <span className="text-gray-800">{systemHealth.db_ping_ms ?? '?'} ms</span></div>
                    <div>Connections: <span className="text-gray-800">{systemHealth.connections ?? '0'}</span></div>
                    <div>Engine v: <span className="text-gray-800">{systemHealth.version ?? 'N/A'}</span></div>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
