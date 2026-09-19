import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Calendar, CheckCircle, XCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LeaveManagement = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ student_id: '', leave_from: '', leave_to: '', reason: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leavesRes, stuRes] = await Promise.all([
        API.get('/leave'),
        API.get('/students')
      ]);
      setLeaves(leavesRes.data);
      setStudents(stuRes.data);
    } catch(e) {
      showToast('Error loading data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leave', form);
      showToast('Leave request submitted', 'success');
      setForm({ student_id: '', leave_from: '', leave_to: '', reason: '' });
      loadData();
    } catch (e) {
      showToast('Error submitting leave', 'error');
    }
  };

  const deleteLeave = async (id) => {
      if(window.confirm('Delete this leave request permanently?')) {
          try {
              await API.delete(`/leave/${id}`);
              showToast('Leave request deleted', 'success');
              loadData();
          } catch(e) { showToast('Error deleting', 'error'); }
      }
  };

  const handleAction = async (id, status) => {
    if(user.role !== 'Admin' && user.role !== 'Director' && user.role !== 'AD') {
       showToast('Unauthorized. Only AD/Director/Admin can approve.', 'error');
       return;
    }
    try {
      await API.put(`/leave/${id}`, { status });
      showToast(`Leave ${status}`, 'success');
      loadData();
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Leave Management</h2>
        <p className="text-gray-500 text-xs mt-1">Submit and track leave requests for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form Panel */}
         <div className="premium-card p-6 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Apply / Intimate Leave</h3>
            <form onSubmit={submitLeave} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Select Student</label>
                  <select required value={form.student_id} onChange={e=>setForm({...form, student_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm">
                     <option value="">-- Choose Student --</option>
                     {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.room_number})</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">From Date</label>
                  <input type="date" required value={form.leave_from} onChange={e=>setForm({...form, leave_from: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">To Date</label>
                  <input type="date" required value={form.leave_to} onChange={e=>setForm({...form, leave_to: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Reason</label>
                  <textarea required value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm" placeholder="Reason for leave" />
               </div>
               <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-bold text-sm shadow-md flex justify-center items-center gap-2">
                  <Send className="w-4 h-4"/> Submit Leave
               </button>
            </form>
         </div>

         {/* History panel */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-800 mb-4">Leave Requests History</h3>
            {loading ? <p>Loading...</p> : leaves.map(l => (
               <div key={l._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                     <p className="font-bold text-gray-800">{l.student_name} <span className="text-gray-400 text-xs font-normal ml-2">[{l.course} | {l.room_number}]</span></p>
                     <p className="text-xs text-primary font-semibold mt-1"><Calendar className="w-3 h-3 inline mr-1"/> {l.leave_from} to {l.leave_to}</p>
                     <p className="text-sm text-gray-600 italic mt-2">"{l.reason}"</p>
                  </div>
                  
                     <div className="flex flex-col items-end gap-2 relative">
                        {user.role === 'Admin' && <button onClick={()=>deleteLeave(l._id)} className="absolute -top-2 -right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}

                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${l.status === 'Approved' ? 'bg-success/10 text-success' : l.status === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-amber-100 text-amber-600'}`}>{l.status}</span>
                     {l.status === 'Pending' && (user.role === 'Admin' || user.role === 'Director' || user.role === 'AD') && (
                        <div className="flex gap-2 mt-2">
                           <button onClick={() => handleAction(l._id, 'Approved')} className="px-3 py-1.5 bg-success text-white rounded font-bold text-xs"><CheckCircle className="w-4 h-4 inline mr-1"/>Approve</button>
                           <button onClick={() => handleAction(l._id, 'Rejected')} className="px-3 py-1.5 bg-danger text-white rounded font-bold text-xs"><XCircle className="w-4 h-4 inline mr-1"/>Reject</button>
                        </div>
                     )}
                  </div>
               </div>
            ))}
            {leaves.length === 0 && !loading && (
               <div className="text-center p-8 text-gray-400">No leave requests found.</div>
            )}
         </div>
      </div>
    </div>
  );
};
export default LeaveManagement;
