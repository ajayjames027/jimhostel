import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Calendar, CheckCircle, XCircle, Send, Trash2, QrCode, ScanLine, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LeaveManagement = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ student_id: '', leave_from: '', leave_to: '', reason: '' });

  // E-Gate Pass Logic
  const [selectedGatePass, setSelectedGatePass] = useState(null);

  const getGatePassStatus = (leave) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const from = new Date(leave.leave_from);
    from.setHours(0,0,0,0);
    const to = new Date(leave.leave_to);
    to.setHours(23,59,59,999);

    if (new Date() > to) return 'EXPIRED'; 
    if (new Date() < from) return 'UPCOMING';
    return 'ACTIVE';
  };

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

                     <div className="flex gap-2 items-center">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${l.status === 'Approved' ? 'bg-success/10 text-success' : l.status === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-amber-100 text-amber-600'}`}>{l.status}</span>
                       {l.status === 'Approved' && (
                           <button 
                              onClick={() => setSelectedGatePass(l)}
                              className="px-2 py-1 text-[10px] uppercase font-extrabold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                           >
                              <QrCode className="w-3 h-3" /> E-Pass
                           </button>
                       )}
                     </div>

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

      {selectedGatePass && (() => {
        const gpStatus = getGatePassStatus(selectedGatePass);
        const isExpired = gpStatus === 'EXPIRED';
        const isUpcoming = gpStatus === 'UPCOMING';
        const isActive = gpStatus === 'ACTIVE';

        const baseQRData = `JIM-GATE-PASS-${selectedGatePass._id}`;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden relative border border-white/20 scale-enter">
              
              {/* Header Ribbon */}
              <div className={`p-4 text-center ${isActive ? 'bg-emerald-500' : isExpired ? 'bg-rose-500' : 'bg-blue-500'}`}>
                <h2 className="text-white font-extrabold tracking-widest uppercase text-sm">Official E-Gate Pass</h2>
                <p className="text-white/80 text-[10px] font-bold uppercase mt-0.5">JIM Boys Hostel</p>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col items-center relative">
                
                <div className={`absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700 animate-pulse' : isExpired ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    {gpStatus}
                </div>

                <div className="w-16 h-16 rounded-full bg-gray-100 mb-3 flex items-center justify-center overflow-hidden border-2 border-gray-100">
                    <span className="font-bold text-gray-400 text-xl">{selectedGatePass.student_name ? selectedGatePass.student_name.charAt(0) : '?'}</span>
                </div>

                <h3 className="font-extrabold text-lg text-gray-900">{selectedGatePass.student_name}</h3>
                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">
                  {selectedGatePass.room_number ? `Room ${selectedGatePass.room_number}` : ''} • {selectedGatePass.course || 'No Course'}
                </p>

                <div className="w-full h-px bg-gray-100 my-4 border-dashed border"></div>

                {/* QR Code Segment */}
                <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] glow-pulse' : isExpired ? 'bg-rose-50 border-2 border-rose-500 opacity-60' : 'bg-blue-50 border-2 border-blue-400'} relative`}>
                    {isExpired && <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded text-lg rotate-[-15deg] shadow-lg">INVALID</span></div>}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${baseQRData}`} alt="QR" className={`rounded-lg mix-blend-multiply ${isExpired ? 'opacity-30' : ''}`} />
                </div>

                <p className="text-[9px] text-gray-400 mt-2 font-mono font-semibold">{baseQRData}</p>

                <div className="w-full bg-gray-50 rounded-xl p-3 mt-4 space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Valid From</span>
                      <span className="font-extrabold text-gray-800">{new Date(selectedGatePass.leave_from).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Valid Until</span>
                      <span className="font-extrabold text-gray-800">{new Date(selectedGatePass.leave_to).toLocaleDateString('en-GB')}</span>
                    </div>
                </div>

                {isActive && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-4 flex items-center gap-1 opacity-80 text-center">
                      AD Verification Copy
                    </p>
                )}
                {isExpired && (
                    <p className="text-[11px] text-rose-600 font-bold mt-4 flex items-center gap-1 opacity-80 text-center">
                      <AlertCircle className="w-3.5 h-3.5" /> Pass expired. Watch for late entry.
                    </p>
                )}

                <button onClick={() => setSelectedGatePass(null)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors">
                    Close Pass
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export default LeaveManagement;
