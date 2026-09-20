import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { User, Phone, MapPin, Calendar, Award, BookOpen, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/students/${id}`);
        setProfile(res.data);
      } catch (e) {
        showToast('Error loading student profile details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="premium-card p-8 text-center text-gray-500 max-w-lg mx-auto mt-12">
        <h3 className="font-extrabold text-lg text-gray-700 mb-2">Student Not Found</h3>
        <p className="text-xs mb-6">The student record with ID "{id}" could not be located in the database.</p>
        <Link to="/manage-students" className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md">
          Go Back
        </Link>
      </div>
    );
  }

  const attendancePct = profile.attendance_percentage ?? 100.0;
  
  // Color configuration based on percentage thresholds
  const getStatusColor = (pct) => {
    if (pct >= 85) return 'text-success bg-success/10 border-success/20';
    if (pct >= 80) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (pct >= 75) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-danger bg-danger/10 border-danger/20';
  };

  const getRingColor = (pct) => {
    if (pct >= 85) return 'stroke-emerald-500';
    if (pct >= 80) return 'stroke-amber-500';
    if (pct >= 75) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const strokeDashoffset = 251.2 - (251.2 * attendancePct) / 100;

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div>
        <Link 
          to={-1}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors group mb-3"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary text-2xl font-bold uppercase shadow-sm">
              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User />}
            </div>
            <div>
              <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">{profile.name}</h2>
              <p className="text-gray-500 text-xs font-medium">Status: <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${getStatusColor(attendancePct)}`}>{profile.status}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <div className="premium-card p-6 lg:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-gray-400" /> Student Profile Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs font-medium">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Course & Department</span>
                <span className="text-gray-700">{profile.course} — {profile.department}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Room Allocation</span>
                <span className="text-gray-700">{profile.hostel_name} • Block {profile.block} • Room {profile.room_number}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Student Mobile</span>
                <span className="text-gray-700">{profile.mobile}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-gray-400 font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Academic Year</span>
                <span className="text-gray-700">Year {profile.year || 'II'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual attendance percentage dial */}
        <div className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Overall Attendance</h3>
          
          <div className="relative flex items-center justify-center mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="40"
                className="stroke-gray-100 fill-transparent"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="40"
                className={`fill-transparent transition-all duration-1000 ${getRingColor(attendancePct)}`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-extrabold text-2xl text-gray-800 leading-tight">{attendancePct}%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Present</span>
            </div>
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(attendancePct)}`}>
            {attendancePct >= 85 ? 'Safe Status' : (attendancePct >= 80 ? 'Warning Status' : 'Defaulter Risk')}
          </span>
        </div>
      </div>

      {/* Timeline details section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance history timeline */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-gray-400" /> Recent Attendance Logs
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {profile.attendance_history?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No attendance records registered yet.</p>
            ) : (
              profile.attendance_history?.map((att, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      att.status === 'Present' ? 'bg-success' : 
                      att.status === 'Absent' ? 'bg-danger animate-pulse-subtle' : 
                      att.status === 'Leave' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    {idx < profile.attendance_history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-100 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-3 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-gray-800 block text-xs">
                          {att.status}
                        </span>
                        <span className="text-gray-400 text-[10px] block mt-0.5">
                          {new Date(att.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })} • {att.type.toUpperCase()}
                        </span>
                      </div>
                      {att.remarks && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-semibold italic max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                          "{att.remarks}"
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold mt-2">Marked by: {att.marked_by}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests Log */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-gray-400" /> Leave Registry & Clearances
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {profile.leave_history?.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No leave requests registered.</p>
            ) : (
              profile.leave_history?.map((leave, idx) => (
                <div key={idx} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Leave Duration:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      leave.status === 'Approved' ? 'bg-success/10 text-success' :
                      leave.status === 'Rejected' ? 'bg-danger/10 text-danger' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {new Date(leave.leave_from).toLocaleDateString('en-GB')} to {new Date(leave.leave_to).toLocaleDateString('en-GB')}
                  </p>
                  <div className="text-[11px] text-gray-500 leading-normal mt-1 border-t border-gray-100/50 pt-2">
                    <strong className="text-gray-600 font-bold block mb-0.5">Reason:</strong>
                    "{leave.reason}"
                  </div>
                  {leave.approved_by && (
                    <p className="text-[9px] text-gray-400 font-semibold pt-1">
                      Action Taken By: {leave.approved_by}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
