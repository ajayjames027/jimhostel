import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { ClipboardList, Check, X, ShieldAlert, Calendar, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeaveApprovals = () => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await API.get('/leave');
      setLeaves(res.data);
    } catch (e) {
      showToast('Error loading leave requests registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId, status) => {
    setActioningId(leaveId);
    try {
      await API.put(`/leave/${leaveId}`, { status });
      showToast(`Leave request successfully ${status.toLowerCase()}!`, 'success');
      
      // Update local state directly
      setLeaves((prev) => 
        prev.map((l) => (l._id === leaveId ? { ...l, status, approved_by: 'Director' } : l))
      );
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to process leave action', 'error');
    } finally {
      setActioningId(null);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const pastLeaves = leaves.filter((l) => l.status !== 'Pending');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Leave Approvals Panel</h2>
        <p className="text-gray-500 text-xs mt-1">Review student home-leave requests and approve or reject travel clearances</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Requests queue */}
        <div className="premium-card p-6 lg:col-span-2 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500" /> Pending Requests Queue
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pendingLeaves.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No pending leave requests in the queue.</p>
            ) : (
              pendingLeaves.map((l) => (
                <div 
                  key={l._id} 
                  className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-3 animate-scale-in"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        to={`/students/${l.student_id}`}
                        className="font-bold text-xs text-primary hover:text-primary-hover flex items-center gap-1 group"
                      >
                        {l.student_name}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                        Room {l.room_number} • {l.course}
                      </span>
                    </div>
                    
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded text-[9px] font-extrabold uppercase">
                      Pending
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 border-t border-gray-100/50 pt-2 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-700 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(l.leave_from).toLocaleDateString('en-GB')} to {new Date(l.leave_to).toLocaleDateString('en-GB')}</span>
                    </div>
                    <strong className="text-gray-600 font-bold block mb-0.5">Reason:</strong>
                    "{l.reason}"
                  </div>

                  <div className="flex justify-end gap-2 border-t border-gray-100/50 pt-3">
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleAction(l._id, 'Rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 border border-rose-100 text-rose-600 hover:bg-rose-50/50 font-bold rounded-lg text-[10px] uppercase transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      disabled={actioningId !== null}
                      onClick={() => handleAction(l._id, 'Approved')}
                      className="flex items-center gap-1 px-4 py-1.5 bg-success text-white hover:bg-emerald-600 font-bold rounded-lg text-[10px] uppercase transition-all active:scale-95 shadow-sm hover:shadow-success/10"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: History registry log */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-gray-400" /> Past Clearances Log
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pastLeaves.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No past leaves logged in database.</p>
            ) : (
              pastLeaves.map((l) => (
                <div key={l._id} className="bg-gray-50/20 rounded-xl border border-gray-100/80 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">{l.student_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                      l.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    {new Date(l.leave_from).toLocaleDateString('en-GB')} to {new Date(l.leave_to).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-gray-500 text-[10px] italic line-clamp-1">"{l.reason}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovals;
