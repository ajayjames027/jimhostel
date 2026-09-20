import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Clock, Plus, Search, User, Calendar, BookOpen, ArrowLeft } from 'lucide-react';

const LateEntryRegister = () => {
  const { showToast } = useToast();
  const [lateEntries, setLateEntries] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('');
  const [entryTime, setEntryTime] = useState('');

  const fetchLateEntries = async () => {
    setLoading(true);
    try {
      const res = await API.get('/late-entries');
      setLateEntries(res.data);
    } catch (e) {
      showToast('Error loading late entry register', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students');
      setStudents(res.data);
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  useEffect(() => {
    fetchLateEntries();
    fetchStudents();
    
    // Set entry time to current date-time local
    const now = new Date();
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzoffset)).toISOString().slice(0, 16);
    setEntryTime(localISOTime);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !reason) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await API.post('/late-entries', {
        student_id: studentId,
        reason,
        entry_time: entryTime
      });
      showToast('Late entry logged successfully!', 'success');
      
      // Reset form
      setStudentId('');
      setReason('');
      setShowAddForm(false);
      
      fetchLateEntries();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save late entry', 'error');
    }
  };

  const filteredEntries = lateEntries.filter((le) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      le.student_name.toLowerCase().includes(searchLower) ||
      (le.room_number && le.room_number.toLowerCase().includes(searchLower)) ||
      (le.reason && le.reason.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Late Entry Register</h2>
          <p className="text-gray-500 text-xs mt-1">Log and track students arriving back to the hostel past curfew</p>
        </div>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Record Late Entry
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="premium-card p-6 scale-enter">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Curfew Logs
            </button>
            <h3 className="font-extrabold text-gray-800 text-md">Record Late Curfew Return</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hostel Student *</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.room_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Return Date & Time *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Curfew Breach Reason *</label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-gray-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Delayed train returning from weekend leave, or library study till 10:30 PM"
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 border border-gray-100 rounded-xl font-bold text-xs hover:bg-gray-50 text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md transition-all"
              >
                Record Late Entry
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-50 bg-gray-50/20">
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, room, reason..."
                className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                  <th className="p-4">Student Name (Room)</th>
                  <th className="p-4">Late Entry Timestamp</th>
                  <th className="p-4">Curfew Breach Reason</th>
                  <th className="p-4">Recorded / Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] text-gray-400 font-bold mt-2">Loading late entry register...</p>
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400">
                      No curfew breaches or late entries logged.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((le) => (
                    <tr key={le._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-4 font-bold text-gray-900">
                        {le.student_name} <span className="text-gray-400 font-normal">({le.room_number})</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-rose-500" /> {new Date(le.entry_time).toLocaleString('en-GB')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 italic max-w-sm overflow-hidden text-ellipsis whitespace-normal">
                        "{le.reason}"
                      </td>
                      <td className="p-4 text-gray-400 font-semibold">{le.approved_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateEntryRegister;
