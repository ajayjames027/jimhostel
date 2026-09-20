import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { FileText, Shield, Clock, HelpCircle, Search, Download } from 'lucide-react';

const SystemLogs = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const downloadCSV = () => {
     const headers = ['Timestamp', 'Staff User', 'Operation Action', 'Transaction Details'];
     const csvContent = [headers.join(',')];
     filteredLogs.forEach(log => {
        const row = [
           `"${new Date(log.timestamp).toLocaleString()}"`,
           `"${log.username}"`,
           `"${log.action}"`,
           `"${log.details.replace(/"/g, '""')}"`
        ];
        csvContent.push(row.join(','));
     });
     const blob = new Blob([csvContent.join('\\n')], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `System_Logs_${new Date().getTime()}.csv`;
     a.click();
     URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
     log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await API.get('/system-logs');
        setLogs(res.data);
      } catch (e) {
        showToast('Error loading system audit logs', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">System Audit Logs</h2>
        <p className="text-gray-500 text-xs mt-1">Review chronological records of administrative activities and student database updates</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between premium-card p-4">
        <div className="relative max-w-sm w-full top-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Room Number, Action, or Username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-gray-50/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
          />
        </div>
        <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 w-full sm:w-auto shrink-0"
        >
            <Download className="w-4 h-4" /> Export CSV Logs
        </button>
      </div>

      {/* Logs Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Staff User</th>
                <th className="p-4">Operation Action</th>
                <th className="p-4">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No system audit logs matched your search terms.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 text-gray-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-primary font-bold">{log.username}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                        <Shield className="w-3 h-3 text-blue-500 shrink-0" /> {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium max-w-md overflow-hidden text-ellipsis whitespace-normal">
                      {log.details}
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

export default SystemLogs;
