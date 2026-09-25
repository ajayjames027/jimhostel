import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Search, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

const DefaultersList = () => {
  const { showToast } = useToast();
  const [defaulters, setDefaulters] = useState([]);
  const [threshold, setThreshold] = useState('85.0');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/defaulters?threshold=${threshold}`);
      setDefaulters(res.data);
    } catch (e) {
      showToast('Error loading defaulters records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, [threshold]);

  const getRiskBadgeStyle = (level) => {
    if (level === 'Critical') return 'bg-red-50 text-red-700 border-red-100';
    if (level === 'High') return 'bg-orange-50 text-orange-700 border-orange-100';
    if (level === 'Moderate') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  const filteredDefaulters = defaulters.filter((d) => {
    const query = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(query) ||
      d.room_number.toLowerCase().includes(query)
    );
  });

  const exportCSV = () => {
      const headers = ['Student Name', 'Room', 'Attendance %', 'Risk Level'];
      const rows = filteredDefaulters.map(d => [d.name, d.room_number, d.attendance_percentage, d.risk_level]);
      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Defaulters_Below_${threshold}%_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Exported list to CSV successfully.', 'success');
  };

  const copyAlertTemplate = (d) => {
      const text = `URGENT ALERT:\nHello ${d.name} (Room ${d.room_number}). Your current attendance percentage has drastically fallen to ${d.attendance_percentage}%. This places you in the "${d.risk_level}" tracking tier. Please meet the AD immediately.`;
      navigator.clipboard.writeText(text);
      showToast('Copied Auto-Alert message to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Defaulters Risk registry</h2>
          <p className="text-gray-500 text-xs mt-1">Identify and track students with attendance ratios below standard requirements</p>
        </div>

        {/* Threshold Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Threshold:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="px-4 py-2 border border-gray-100 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="85.0">Below 85% (Standard)</option>
            <option value="80.0">Below 80% (Warning)</option>
            <option value="75.0">Below 75% (High Risk)</option>
            <option value="65.0">Below 65% (Critical)</option>
          </select>
          <button onClick={exportCSV} className="ml-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md transition-all">
             Export to CSV
          </button>
        </div>
      </div>

      {/* Main Results card */}
      <div className="premium-card overflow-hidden">
        {/* Search header bar */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/20 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student, room..."
              className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">
            High Risk Students: {filteredDefaulters.length}
          </span>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Student Name</th>
                <th className="p-4">Room Number</th>
                <th className="p-4">Attendance Rate</th>
                <th className="p-4">Risk Profiling</th>
                <th className="p-4">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 font-semibold">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-success border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    No students found below the {threshold}% attendance threshold. Excellent work!
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((d) => (
                  <tr key={d.student_id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{d.name}</td>
                    <td className="p-4 font-bold text-gray-700">Room {d.room_number}</td>
                    <td className="p-4 font-extrabold text-gray-900">{d.attendance_percentage}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getRiskBadgeStyle(d.risk_level)}`}>
                        {d.risk_level} Risk
                      </span>
                    </td>
                    <td className="p-4 flex gap-4 mt-2">
                      <button onClick={() => copyAlertTemplate(d)} className="text-orange-500 hover:text-orange-600 font-bold inline-flex items-center gap-1 group">
                         <AlertTriangle className="w-3.5 h-3.5" /> Copy Alert
                      </button>
                      <Link
                        to={`/students/${d.student_id}`}
                        className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 group"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DefaultersList;
