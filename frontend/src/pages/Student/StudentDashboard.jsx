import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Coffee, Sun, Moon, Calendar, Send, Info, Clock, CheckCircle2, XCircle, Wrench, Camera, Save } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeDates, setActiveDates] = useState([]);
  const [polls, setPolls] = useState({});
  const [savingMeals, setSavingMeals] = useState(false);
  const [myProfile, setMyProfile] = useState(null);

  const [leaveForm, setLeaveForm] = useState({ leave_from: '', leave_to: '', reason: '' });

  const [maintenanceForm, setMaintenanceForm] = useState({ issue: '', description: '', photo_data: '' });
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get(`/students/${user.username}`);
        setMyProfile(res.data);
        const mres = await API.get(`/maintenance`);
        setMaintenanceHistory(mres.data);
        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
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
      setPolls(prev => ({
          ...prev,
          [d]: {
              ...prev[d],
              [type]: !prev[d][type]
          }
      }));
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
  
  const handlePhotoUpload = (e) => {
     const file = e.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => setMaintenanceForm(f => ({...f, photo_data: reader.result}));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20">
        <h2 className="font-extrabold text-3xl tracking-tight mb-2">Welcome, {user.name}</h2>
        <p className="text-blue-100 font-medium">Room {myProfile?.room_number || '...'} | {myProfile?.course || '...'} | Manage your hostel requests here.</p>
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
                                            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500"/> {d}</h4>
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
                                      Taken at: {att.timestamp ? new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
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
            </div>
            
            <div className="premium-card p-8 border-t-4 border-t-amber-500 shadow-xl shadow-amber-500/5 relative overflow-hidden">
              <h3 className="font-extrabold text-xl text-gray-900 mb-2 flex items-center gap-2"><Wrench className="w-6 h-6 text-amber-500" /> Report Maintenance</h3>
              <p className="text-sm font-semibold text-gray-500 mb-6">Found a broken fixture or leak? Fill the report below.</p>
              
              <form onSubmit={submitMaintenance} className="space-y-4 mb-8">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Issue Overview</label>
                    <input type="text" required value={maintenanceForm.issue} onChange={e=>setMaintenanceForm({...maintenanceForm, issue: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all" />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Details</label>
                    <textarea required rows="2" value={maintenanceForm.description} onChange={e=>setMaintenanceForm({...maintenanceForm, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all custom-scrollbar resize-none" />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1 flex gap-1 items-center"><Camera className="w-4 h-4 text-gray-400"/> Attach Photo</label>
                    <label className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer group gap-2 text-sm font-bold">
                       {maintenanceForm.photo_data ? <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Attached Successfully</span> : <span>Click to Upload (Optional)</span>}
                       <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                 </div>
                 
                 <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all">
                    Register Maintenance Request
                 </button>
              </form>

              {maintenanceHistory.length > 0 && (
                 <div>
                     <h4 className="font-extrabold text-sm text-gray-900 border-b pb-2 mb-3">My Reports</h4>
                     <div className="space-y-3">
                         {maintenanceHistory.map(m => (
                            <div key={m._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                       <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">{new Date(m.timestamp).toLocaleDateString()}</span>
                                       <p className="font-bold text-gray-800 text-sm">{m.issue}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${m.status === 'Complete' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span>
                                </div>
                            </div>
                         ))}
                     </div>
                 </div>
              )}
            </div>
            
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;
