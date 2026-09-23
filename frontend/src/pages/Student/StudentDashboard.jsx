import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Coffee, Sun, Moon, Calendar, Send, Info, Clock, CheckCircle2, XCircle, Wrench, Camera, Save, Lock, AlertCircle, QrCode, ScanLine, ShieldCheck } from 'lucide-react';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="bg-gray-900 border-2 border-gray-800 text-white rounded-xl p-3 my-4 w-full text-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-12 h-[200%] bg-white/10 rotate-45 transform -translate-x-[150%] -translate-y-1/2 group-hover:translate-x-[500%] transition-transform duration-[2000ms] ease-in-out pointer-events-none"></div>
            <p className="font-mono text-3xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{time.toLocaleTimeString('en-US', { hour12: true })}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1.5 flex items-center justify-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
               Live Security Verification
            </p>
        </div>
    );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeDates, setActiveDates] = useState([]);
  const [polls, setPolls] = useState({});
  const [savingMeals, setSavingMeals] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [todayDayOrder, setTodayDayOrder] = useState(null);

  const [leaveForm, setLeaveForm] = useState({ leave_from: '', leave_to: '', reason: '' });

  const [announcements, setAnnouncements] = useState([]);
  
  // Mandatory Password Change Logic
  const [mustChangePwd, setMustChangePwd] = useState(user?.requires_password_change === true);
  const [pwdForm, setPwdForm] = useState({ newPwd: '', confirmPwd: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // E-Gate Pass Logic
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  
  // Express Outpass Logic
  const [activeExpressPass, setActiveExpressPass] = useState(null);
  const [selectedExpressPass, setSelectedExpressPass] = useState(null);

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

  const handleForcePwdChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirmPwd) {
       showToast("Passwords don't match", "error");
       return;
    }
    if (pwdForm.newPwd.length < 5) {
       showToast("Password is too short (min 5 characters)", "error");
       return;
    }
    setPwdLoading(true);
    try {
      await API.put(`/students/${user.username}/password`, { password: pwdForm.newPwd });
      const cached = JSON.parse(localStorage.getItem('jim_user') || '{}');
      cached.requires_password_change = false;
      localStorage.setItem('jim_user', JSON.stringify(cached));
      setMustChangePwd(false);
      showToast("Password securely updated! Welcome.", "success");
    } catch (e) {
      showToast("Failed to update password", "error");
    }
    setPwdLoading(false);
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get(`/students/${user.username}`);
        setMyProfile(res.data);
        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
        const lres = await API.get(`/my-leaves`);
        setMyLeaves(lres.data);
        const epRes = await API.get('/egate-pass');
        // Get the latest active express pass that hasn't expired yet for today
        const validPasses = epRes.data.filter(p => p.status === 'Active');
        if (validPasses.length > 0) setActiveExpressPass(validPasses[0]);
        
        try {
           const calRes = await API.get('/calendar');
           const dt = new Date().toISOString().split('T')[0];
           setTodayDayOrder(calRes.data[dt]?.day_order || null);
        } catch(e) {}
      } catch(e) {}
    }

    fetchMe();
  }, [user.username]);

  useEffect(() => {
    const loadActivePolls = async () => {
      try {
        const configRes = await API.get('/food-poll/config');
        if (configRes.data.date) {
           const dts = Array.isArray(configRes.data.date) ? configRes.data.date : [configRes.data.date];
           setActiveDates(dts.filter(Boolean));
           
           const initialPolls = {};
           await Promise.all(dts.filter(Boolean).map(async (d) => {
               const res = await API.get(`/food-poll/${d}`);
               const me = res.data.find(r => r.student_id === user.username);
               if (me) {
                   initialPolls[d] = {
                       breakfast: me.breakfast,
                       lunch: me.lunch,
                       dinner: me.dinner,
                       hasAcknowledged: me.acknowledged || false
                   };
               } else {
                   initialPolls[d] = { breakfast: false, lunch: false, dinner: false, hasAcknowledged: false };
               }
           }));
           setPolls(initialPolls);
        }
      } catch(e) {}
    };
    loadActivePolls();
  }, [user.username]);

  const toggleMeal = (d, type) => {
      if (polls[d] && polls[d].hasAcknowledged) return; 
      setPolls(prev => {
          const defaultState = { breakfast: false, lunch: false, dinner: false, hasAcknowledged: false };
          const prevState = prev[d] || defaultState;
          return {
              ...prev,
              [d]: {
                  ...prevState,
                  [type]: !prevState[type]
              }
          };
      });
  };

  const saveMeals = async () => {
    if(activeDates.length === 0) return;
    setSavingMeals(true);
    let success = true;
    
    for (const d of activeDates) {
        if (polls[d]?.hasAcknowledged) continue;
        try {
          const records = [{
             student_id: user.username,
             room_number: myProfile?.room_number || '',
             class_name: myProfile?.course || '',
             breakfast: polls[d].breakfast,
             lunch: polls[d].lunch,
             dinner: polls[d].dinner,
             acknowledged: true
          }];
          await API.post(`/food-poll/${d}`, { records });
          
          setPolls(prev => ({
              ...prev,
              [d]: { ...prev[d], hasAcknowledged: true }
          }));
          
        } catch (e) {
          success = false;
        }
    }
    
    if (success) showToast('Food choices saved successfully!', 'success');
    else showToast('Error saving some food choices.', 'error');
    
    setSavingMeals(false);
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leave', { ...leaveForm, student_id: user.username });
      const msg = `Hello AD,\n\nI am ${user.name} (Room ${myProfile?.room_number}).\nI have applied for leave from ${leaveForm.leave_from} to ${leaveForm.leave_to} for the reason: ${leaveForm.reason}.\n\nPlease approve my request in the portal.`;
      showToast('Leave request submitted properly, redirecting to WhatsApp...', 'success');
      setTimeout(() => {
          window.open(`https://wa.me/917010437314?text=${encodeURIComponent(msg)}`, '_blank');
      }, 500);
      const res = await API.get(`/students/${user.username}`);
      setMyProfile(res.data);
      setLeaveForm({ leave_from: '', leave_to: '', reason: '' });
    } catch(e) { showToast('Error submitting leave', 'error'); }
  };

  const submitMaintenance = async (e) => {
    e.preventDefault();
    try {
       await API.post('/maintenance', { ...maintenanceForm, student_id: user.username, room_number: myProfile?.room_number || '' });
       showToast('Maintenance issue lodged successfully!', 'success');
       setMaintenanceForm({ issue: '', description: '', photo_data: '' });
       const mres = await API.get(`/maintenance`);
       setMaintenanceHistory(mres.data);
    } catch(e) { showToast('Error submitting issue', 'error'); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 hidden md:block">
           {todayDayOrder ? (
               <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 rounded-2xl text-center shadow-inner">
                   <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-1">Today's Day Order</p>
                   <p className="text-4xl font-black text-white">{todayDayOrder === 'Holiday' ? 'Holiday' : `Order ${todayDayOrder}`}</p>
               </div>
           ) : (
               <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-2xl text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">College Calendar</p>
                   <p className="text-xl font-bold text-white/50 mt-1">No Schedule</p>
               </div>
           )}
        </div>
        <div className="relative z-10">
          <h2 className="font-extrabold text-3xl tracking-tight mb-2">Welcome, {user.name}</h2>
          <p className="text-blue-100 font-medium">Room {myProfile?.room_number || '...'} | {myProfile?.course || '...'} | Manage your hostel requests here.</p>
        </div>
        {/* Mobile Day Order View */}
        {todayDayOrder && (
            <div className="mt-6 md:hidden w-fit bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl">
               <p className="text-[9px] font-extrabold uppercase tracking-widest text-blue-200 mb-0.5">Today's Day Order</p>
               <p className="text-2xl font-black text-white">{todayDayOrder === 'Holiday' ? 'Holiday' : `Order ${todayDayOrder}`}</p>
            </div>
        )}
      </div>
      
      {announcements.length > 0 && (
         <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl border border-amber-200 overflow-hidden relative shadow-sm flex items-center font-bold text-xs mt-1 mb-2">
            <span className="whitespace-nowrap px-3 tracking-wider uppercase shrink-0 z-10 bg-amber-100 border-r border-amber-200">📢 HEADS UP:</span>
            <marquee behavior="scroll" direction="left" scrollamount="5" className="ml-2 pt-0.5 w-full">
               {announcements.map((a, i) => (
                   <span key={i} className="mr-12 text-gray-800 tracking-wide text-sm">{a.message} <span className="font-semibold text-gray-500 text-[10px] ml-1">({a.author_role.toUpperCase()})</span></span>
               ))}
            </marquee>
         </div>
      )}

      {activeExpressPass && (
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 border border-emerald-400 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="absolute top-0 right-0 right-0 w-32 h-32 bg-emerald-400 rounded-bl-full -mr-10 -mt-10 blur-xl opacity-50 pointer-events-none"></div>
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-400 rounded-2xl flex items-center justify-center border-4 border-emerald-300 shrink-0 shadow-inner">
                 <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                 <h3 className="font-extrabold text-xl tracking-wide flex items-center gap-2">Express Outpass Active <span className="flex w-2.5 h-2.5 rounded-full bg-white animate-pulse" /></h3>
                 <p className="text-emerald-50 text-sm font-medium mt-0.5">Approved by AD for {activeExpressPass.out_time} - {activeExpressPass.in_time}</p>
              </div>
           </div>
           <button onClick={() => setSelectedExpressPass(activeExpressPass)} className="relative z-10 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-gray-900/30 flex items-center gap-2 w-full md:w-auto justify-center">
              <QrCode className="w-4 h-4" /> Open Digital Pass
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <div className="premium-card p-8 border-l-4 border-l-orange-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-extrabold text-xl text-gray-900">Multi-Day Mess Poll</h3>
                  </div>
                  {activeDates.length === 0 ? (
                    <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">No poll active currently</p>
                    </div>
                  ) : (
                      <>
                        <p className="text-sm font-medium text-gray-500 mb-6 border-b border-gray-100 pb-3">Vote your meal attendance for the officially active days below.</p>
                        <div className="space-y-4 mb-6">
                            {activeDates.map(d => {
                                const st = polls[d] || { breakfast: false, lunch: false, dinner: false, hasAcknowledged: false };
                                const locked = st.hasAcknowledged;
                                return (
                                    <div key={d} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 relative overflow-hidden">
                                        {locked && <div className="absolute inset-0 bg-gray-100/40 z-10 pointer-events-none"></div>}
                                        <div className="flex justify-between items-center mb-4 relative z-20">
                                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500"/> {d.split('-').reverse().join('-')}</h4>
                                            {locked && <span className="px-2 py-0.5 bg-success/10 text-emerald-700 rounded text-[10px] uppercase font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Locked Uneditable</span>}
                                        </div>
                                        
                                        <div className="flex justify-around items-center relative z-20">
                                           <div className="flex flex-col items-center gap-2">
                                              <button onClick={()=>toggleMeal(d, 'breakfast')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${st.breakfast ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 scale-110' : 'bg-white text-gray-400 border border-gray-200 hover:border-orange-300'} ${locked ? 'opacity-70 cursor-not-allowed' : ''}`}><Coffee className="w-5 h-5"/></button>
                                              <span className={`text-[11px] font-bold uppercase tracking-wider ${st.breakfast ? 'text-orange-600' : 'text-gray-400'}`}>B'fast</span>
                                           </div>
                                           <div className="flex flex-col items-center gap-2">
                                              <button onClick={()=>toggleMeal(d, 'lunch')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${st.lunch ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/40 scale-110' : 'bg-white text-gray-400 border border-gray-200 hover:border-amber-300'} ${locked ? 'opacity-70 cursor-not-allowed' : ''}`}><Sun className="w-6 h-6"/></button>
                                              <span className={`text-[11px] font-bold uppercase tracking-wider ${st.lunch ? 'text-amber-600' : 'text-gray-400'}`}>Lunch</span>
                                           </div>
                                           <div className="flex flex-col items-center gap-2">
                                              <button onClick={()=>toggleMeal(d, 'dinner')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${st.dinner ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110' : 'bg-white text-gray-400 border border-gray-200 hover:border-indigo-300'} ${locked ? 'opacity-70 cursor-not-allowed' : ''}`}><Moon className="w-4 h-4"/></button>
                                              <span className={`text-[11px] font-bold uppercase tracking-wider ${st.dinner ? 'text-indigo-600' : 'text-gray-400'}`}>Dinner</span>
                                           </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={saveMeals} disabled={savingMeals || activeDates.every(d => polls[d]?.hasAcknowledged)} className="w-full py-4 bg-gray-900 border border-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20 flex justify-center gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed">
                           <Save className="w-4 h-4" /> {savingMeals ? 'Registering...' : activeDates.every(d => polls[d]?.hasAcknowledged) ? 'Selections Locked In System' : 'Lock Initial Meal Choices System-Wide'}
                        </button>
                      </>
                  )}
              </div>
            </div>

            <div className="premium-card p-8">
              <h3 className="font-extrabold text-xl border-b border-gray-100 pb-4 mb-5 text-gray-900">My Attendance History</h3>
              {myProfile?.attendance_history && myProfile.attendance_history.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {myProfile.attendance_history.map(att => (
                          <div key={att._id} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 transition-colors shadow-sm/5">
                              <div>
                                  <p className="font-bold text-gray-900 text-sm">{new Date(att.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                                  <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400 mt-1">
                                      Taken at: {att.timestamp ? new Date(att.timestamp + (att.timestamp.includes('Z') || att.timestamp.includes('+') ? '' : 'Z')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                                  </p>
                              </div>
                              {att.status === 'Present' && <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 items-center"><CheckCircle2 className="w-3.5 h-3.5"/> Present</span>}
                              {att.status === 'Absent' && <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 items-center"><XCircle className="w-3.5 h-3.5"/> Absent</span>}
                              {att.status === 'Late Entry' && <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 items-center"><Clock className="w-3.5 h-3.5"/> Late</span>}
                              {att.status === 'Leave' && <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold">On Leave</span>}
                          </div>
                      ))}
                  </div>
              ) : <p className="text-gray-400 text-sm font-medium mt-4 p-4 text-center bg-gray-50 rounded-xl border border-gray-100">No attendance records logged yet.</p>}
            </div>
        </div>

        <div className="space-y-8">
            <div className="premium-card p-8 border-t-4 border-t-primary shadow-xl shadow-primary/5 relative overflow-hidden">
              <h3 className="font-extrabold text-xl text-gray-900 mb-2">Apply for Leave</h3>
              <p className="text-sm font-semibold text-gray-500 mb-6">Send an official leave request. This will automatically notify the AD via WhatsApp.</p>
              
              <form onSubmit={submitLeave} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Leave From</label>
                        <input type="date" required value={leaveForm.leave_from} onChange={e=>setLeaveForm({...leaveForm, leave_from: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Leave To</label>
                        <input type="date" required value={leaveForm.leave_to} onChange={e=>setLeaveForm({...leaveForm, leave_to: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all" />
                     </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Detailed Reason</label>
                    <textarea required rows="3" value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all custom-scrollbar resize-none" placeholder="Elaborate your requirement..." />
                 </div>
                 
                 <button type="submit" className="w-full bg-gradient-to-r from-success to-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-extrabold text-sm shadow-xl shadow-success/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                    <Send className="w-4 h-4"/> Submit Request & Notify via WhatsApp
                 </button>
              </form>

              {/* Leave History Tracker */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                 <h4 className="font-extrabold text-sm text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Past Leave Requests Tracker</h4>
                 {myLeaves.length === 0 ? (
                     <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 font-semibold text-xs">No leave requests logged yet.</div>
                 ) : (
                     <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                         {myLeaves.map(l => (
                             <div key={l._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                   <p className="font-extrabold text-xs text-gray-700 tracking-wide">{new Date(l.leave_from).toLocaleDateString('en-GB')} <span className="opacity-40">→</span> {new Date(l.leave_to).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-1 text-[9px] uppercase font-extrabold rounded-md flex shrink-0 ${
                                      l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                      l.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                     {l.status}
                                  </span>
                                  {l.status === 'Approved' && (
                                     <button 
                                        onClick={() => setSelectedGatePass(l)}
                                        className="px-2.5 py-1 text-[9px] uppercase font-extrabold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                                     >
                                        <QrCode className="w-3 h-3" /> E-Pass
                                     </button>
                                  )}
                                </div>
                             </div>
                         ))}
                     </div>
                 )}
              </div>
            </div>
        </div>
      </div>

      {mustChangePwd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in lock-modal top-0 relative">
             <div className="bg-rose-50 p-6 flex flex-col items-center justify-center border-b border-rose-100">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-3">
                   <Lock className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 text-center">Security Update Required</h3>
                <p className="text-sm font-medium text-gray-500 text-center mt-2 max-w-[250px]">
                   You are currently using the default network password. Please set a new secure password to continue.
                </p>
             </div>
             
             <form onSubmit={handleForcePwdChange} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                   <input type="password" required value={pwdForm.newPwd} onChange={e=>setPwdForm({...pwdForm, newPwd: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all" placeholder="Enter new password (min 5 chars)" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                   <input type="password" required value={pwdForm.confirmPwd} onChange={e=>setPwdForm({...pwdForm, confirmPwd: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all" placeholder="Re-enter to confirm" />
                </div>
                
                <button type="submit" disabled={pwdLoading} className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-4 rounded-xl font-extrabold text-sm shadow-xl shadow-gray-900/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98] mt-2">
                   {pwdLoading ? 'Securing Profile...' : 'Update & Continue'}
                </button>
             </form>
          </div>
        </div>
      )}

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
                    {myProfile?.photo ? <img src={myProfile.photo} className="w-full h-full object-cover" alt="Profile" /> : <span className="font-bold text-gray-400 text-xl">{user.name.charAt(0)}</span>}
                </div>

                <h3 className="font-extrabold text-lg text-gray-900">{user.name}</h3>
                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">
                  {myProfile?.room_number ? `Room ${myProfile.room_number}` : ''} • {myProfile?.course || 'No Course'}
                </p>

                <div className="w-full h-px bg-gray-100 my-2 border-dashed border"></div>

                {isActive && <LiveClock />}

                {/* QR Code Segment */}
                <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : isExpired ? 'bg-rose-50 border-2 border-rose-500 opacity-60' : 'bg-blue-50 border-2 border-blue-400'} relative ${isActive ? 'mt-0' : 'mt-4'}`}>
                    {isExpired && <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded text-lg rotate-[-15deg] shadow-lg">INVALID</span></div>}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${isActive ? '100x100' : '150x150'}&data=${baseQRData}`} alt="QR" className={`rounded-lg mix-blend-multiply ${isExpired ? 'opacity-30' : ''}`} />
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
                    <p className="text-[11px] text-emerald-600 font-bold mt-4 animate-pulse flex items-center gap-1 opacity-80">
                      <ScanLine className="w-3.5 h-3.5" /> Flash this screen to security
                    </p>
                )}
                {isExpired && (
                    <p className="text-[11px] text-rose-600 font-bold mt-4 flex items-center gap-1 opacity-80">
                      <AlertCircle className="w-3.5 h-3.5" /> Pass expired. Return immediately.
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

      {selectedExpressPass && (() => {
        const oTime = selectedExpressPass.out_time || '00:00';
        const iTime = selectedExpressPass.in_time || '00:00';
        const [outH, outM] = oTime.split(':');
        const [inH, inM] = iTime.split(':');
        
        const current = new Date();
        const passIn = new Date(selectedExpressPass.date || new Date());
        passIn.setHours(parseInt(inH), parseInt(inM), 0);
        
        const isExpired = current > passIn || selectedExpressPass.status !== 'Active';

        const baseQRData = `JIM-EXPRESS-PASS-${selectedExpressPass._id}`;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden relative border border-white/20 scale-enter">
              
              <div className={`p-4 text-center ${!isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <h2 className="text-white font-extrabold tracking-widest uppercase text-sm">Express Digital Pass</h2>
                <p className="text-white/80 text-[10px] font-bold uppercase mt-0.5">JIM Boys Hostel</p>
              </div>

              <div className="p-6 flex flex-col items-center relative">
                
                <div className={`absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${!isExpired ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-rose-100 text-rose-700'}`}>
                    {!isExpired ? 'ACTIVE' : 'EXPIRED'}
                </div>

                <div className="w-16 h-16 rounded-full bg-gray-100 mb-3 flex items-center justify-center overflow-hidden border-2 border-gray-100">
                    {myProfile?.photo ? <img src={myProfile.photo} className="w-full h-full object-cover" alt="Profile" /> : <span className="font-bold text-gray-400 text-xl">{user.name.charAt(0)}</span>}
                </div>

                <h3 className="font-extrabold text-lg text-gray-900">{user.name}</h3>
                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">
                  {myProfile?.room_number ? `Room ${myProfile.room_number}` : ''} • {myProfile?.course || 'No Course'}
                </p>

                <div className="w-full h-px bg-gray-100 my-2 border-dashed border"></div>
                
                {!isExpired && <LiveClock />}

                <div className={`p-3 rounded-2xl ${!isExpired ? 'bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-rose-50 border-2 border-rose-500 opacity-60'} relative ${!isExpired ? 'mt-2' : 'mt-6'}`}>
                    {isExpired && <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded text-lg rotate-[-15deg] shadow-lg">INVALID</span></div>}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${!isExpired ? '100x100' : '150x150'}&data=${baseQRData}`} alt="QR" className={`rounded-lg mix-blend-multiply ${isExpired ? 'opacity-30' : ''}`} />
                </div>

                <p className="text-[9px] text-gray-400 mt-2 font-mono font-semibold">{baseQRData}</p>

                <div className="w-full bg-gray-50 rounded-xl p-3 mt-4 space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Valid Date</span>
                      <span className="font-extrabold text-gray-800">{new Date(selectedExpressPass.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Timing</span>
                      <span className="font-extrabold text-gray-800">{selectedExpressPass.out_time} to {selectedExpressPass.in_time}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-2 mt-2">
                       <span className="text-gray-500 font-bold">Reason</span>
                       <span className="font-bold text-gray-700 italic max-w-[120px] text-right truncate">"{selectedExpressPass.reason}"</span>
                    </div>
                </div>

                <div className="w-full border-t border-gray-100 mt-4 pt-4 text-center">
                   <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Digitally Signed By</p>
                   <p className="font-serif italic text-emerald-800 font-medium text-sm">Ajay James</p>
                   <p className="text-[10px] text-gray-500 font-semibold">Assistant Director</p>
                </div>

                <button onClick={() => setSelectedExpressPass(null)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors">
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
export default StudentDashboard;
