import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Coffee, Sun, Moon, Calendar, Send, Clock, CheckCircle2, XCircle, Wrench, ChevronRight, Check } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeDates, setActiveDates] = useState([]);
  const [polls, setPolls] = useState({});
  const [savingMeals, setSavingMeals] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  
  const [leaveForm, setLeaveForm] = useState({ leave_from: '', leave_to: '', reason: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ issue: '', description: '', photo_data: '' });

  const fetchMe = async () => {
      try {
        const res = await API.get(`/students/${user.username}`);
        setMyProfile(res.data);
        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
        const lres = await API.get(`/my-leaves`);
        setMyLeaves(lres.data);
      } catch(e) {}
  }

  useEffect(() => {
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
          [d]: { ...prev[d], [type]: !prev[d][type] }
      }));
  };

  const saveMeals = async () => {
    if(activeDates.length === 0) return;
    setSavingMeals(true);
    
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
          setPolls(prev => ({ ...prev, [d]: { ...prev[d], hasAcknowledged: true } }));
        } catch (e) {
          showToast(`Error saving ${d}`, 'error');
        }
    }
    setSavingMeals(false);
    showToast('Your meal preferences have been successfully locked in! 🎉', 'success');
  };

  const submitLeave = async(e) => {
     e.preventDefault();
     try {
       await API.post('/leaves', { ...leaveForm, student_id: user.username, student_name: user.name, room_number: myProfile?.room_number || '' });
       showToast('Leave Request Submitted Officialy! Status will be updated once reviewed.', 'success');
       setLeaveForm({ leave_from: '', leave_to: '', reason: '' });
       fetchMe(); // Refresh leaves grid
     } catch(e) { showToast('Error applying for leave', 'error'); }
  };
  
  const submitMaintenance = async(e) => {
    e.preventDefault();
    try {
       await API.post('/maintenance', { ...maintenanceForm, student_id: user.username, room_number: myProfile?.room_number || '' });
       showToast('Maintenance issue lodged successfully! Track progress below.', 'success');
       setMaintenanceForm({ issue: '', description: '', photo_data: '' });
    } catch(e) { showToast('Error submitting issue', 'error'); }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if(hour < 12) return 'Good Morning,';
      if(hour < 17) return 'Good Afternoon,';
      return 'Good Evening,';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      
      {/* Dynamic Digital ID Card */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-20">
           <div className="w-40 h-40 border-4 border-indigo-400 rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-end relative z-10 gap-6">
           <div>
             <h4 className="text-indigo-200 font-semibold text-sm mb-1 tracking-widest uppercase">{getGreeting()}</h4>
             <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none mb-3">{user.name}</h2>
             <div className="flex flex-wrap gap-2 items-center text-xs font-bold font-mono text-indigo-200 bg-black/20 p-2 rounded-xl border border-white/10 w-fit">
               <span className="bg-indigo-600/50 text-indigo-50 px-2 py-1 rounded">Room {myProfile?.room_number || '--'}</span>
               <span className="bg-white/10 px-2 py-1 rounded">{myProfile?.course || 'STUDENT'}</span>
               <span className="bg-white/10 px-2 py-1 rounded">{user.username}</span>
             </div>
           </div>

           {/* Live Status indicator */}
           <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="relative">
                 <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
                 <div className="w-3 h-3 bg-emerald-500 rounded-full relative z-10"></div>
              </div>
              <div className="text-right">
                 <span className="block text-[9px] uppercase font-bold tracking-widest text-indigo-200 mb-0.5">Portal Status</span>
                 <span className="block text-xs font-bold text-white leading-none">ACTIVE & SECURED</span>
              </div>
           </div>
        </div>
      </div>
      
      {/* iOS Style Marquee */}
      {announcements.length > 0 && (
         <div className="bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-200 shadow-sm flex items-center font-bold text-xs">
            <span className="px-3 tracking-wider uppercase shrink-0 font-extrabold italic text-rose-600">🔔 BROADCAST:</span>
            <marquee behavior="scroll" direction="left" scrollamount="5" className="ml-2 pt-0.5 w-full">
               {announcements.map((a, i) => (
                   <span key={i} className="mr-12 text-rose-900 tracking-wide text-sm">{a.message} <span className="font-semibold text-rose-500 text-[10px] ml-1">({a.author_role.toUpperCase()})</span></span>
               ))}
            </marquee>
         </div>
      )}

      {/* Main Touch Tiles (iOS App Style Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
         {/* Poll Touch Tile */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
            <h3 className="font-extrabold text-lg text-gray-900 mb-5 flex items-center gap-2"><Coffee className="w-5 h-5 text-orange-500"/> Mess Attendance Poll</h3>
            {activeDates.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">No Poll Pending</span>
                </div>
            ) : (
                <div className="space-y-4">
                  {activeDates.map(d => {
                      const st = polls[d] || { breakfast: false, lunch: false, dinner: false, hasAcknowledged: false };
                      const locked = st.hasAcknowledged;
                      return (
                          <div key={d} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                              <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-bold text-gray-700 text-xs tracking-wider uppercase">{d}</h4>
                                  {locked && <span className="bg-success text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3"/> Locked In</span>}
                              </div>
                              <div className="flex justify-around items-center gap-2">
                                 <button onClick={()=>toggleMeal(d, 'breakfast')} className={`flex-1 py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${st.breakfast ? 'bg-orange-500 text-white border-orange-600 shadow-md scale-[1.02]' : 'bg-white text-gray-500 border-gray-200'} ${locked ? 'opacity-70 pointer-events-none' : ''}`}>
                                    <span className="uppercase text-[9px] font-bold">Breakfast</span>
                                 </button>
                                 <button onClick={()=>toggleMeal(d, 'lunch')} className={`flex-1 py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${st.lunch ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]' : 'bg-white text-gray-500 border-gray-200'} ${locked ? 'opacity-70 pointer-events-none' : ''}`}>
                                    <span className="uppercase text-[9px] font-bold">Lunch</span>
                                 </button>
                                 <button onClick={()=>toggleMeal(d, 'dinner')} className={`flex-1 py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${st.dinner ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-[1.02]' : 'bg-white text-gray-500 border-gray-200'} ${locked ? 'opacity-70 pointer-events-none' : ''}`}>
                                    <span className="uppercase text-[9px] font-bold">Dinner</span>
                                 </button>
                              </div>
                          </div>
                      );
                  })}
                  <button onClick={saveMeals} disabled={savingMeals || activeDates.every(d => polls[d]?.hasAcknowledged)} className="w-full mt-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2 disabled:opacity-50 transition-all hover:bg-gray-800 active:scale-[0.98]">
                     {savingMeals ? 'Processing...' : activeDates.every(d => polls[d]?.hasAcknowledged) ? 'Everything Synced' : 'Confirm Poll Entries'}
                  </button>
                </div>
            )}
         </div>

         {/* Leave Management Tile */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-extrabold text-lg text-gray-900 mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500"/> Submit Leave Request</h3>
            <p className="text-[11px] text-gray-500 mb-5 font-medium leading-relaxed">Fill out the official request mechanism below to notify the AD instantly.</p>
            
            <form onSubmit={submitLeave} className="space-y-4 flex-1">
               <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block ml-1">From Date</label>
                      <input type="date" required value={leaveForm.leave_from} onChange={e=>setLeaveForm({...leaveForm, leave_from: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none ring-primary/20 focus:ring-2 focus:bg-white" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block ml-1">To Date</label>
                      <input type="date" required value={leaveForm.leave_to} onChange={e=>setLeaveForm({...leaveForm, leave_to: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none ring-primary/20 focus:ring-2 focus:bg-white" />
                   </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block ml-1">Detailed Reason</label>
                  <textarea required rows="2" value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold outline-none ring-primary/20 focus:ring-2 focus:bg-white resize-none" placeholder="Explain your situation..." />
               </div>
               <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"><Send className="w-4 h-4"/> Forward to AD Protocol</button>
            </form>
         </div>
      </div>

      {/* Leave Status Timeline */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
         <h3 className="font-extrabold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400"/> My Official Leave Timeline</h3>
         {myLeaves.length === 0 ? (
             <div className="bg-gray-50 rounded-xl p-5 text-center text-gray-400 font-semibold text-xs border border-gray-100/50">No leave records registered locally on your timeline yet.</div>
         ) : (
             <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {myLeaves.map(l => (
                     <div key={l._id} className="flex justify-between items-center p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                           <p className="font-extrabold tracking-wide text-xs text-gray-700 mb-0.5">{new Date(l.leave_from).toLocaleDateString('en-GB')} <span className="opacity-40 px-1">→</span> {new Date(l.leave_to).toLocaleDateString('en-GB')}</p>
                           <p className="text-[10px] text-gray-400 font-semibold line-clamp-1 italic">"{l.reason}"</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] uppercase font-extrabold tracking-widest rounded-lg border flex items-center justify-center shrink-0 ${
                            l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            l.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                           {l.status}
                        </span>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* Maintenance Request Block */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
             <div>
                <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2"><Wrench className="w-5 h-5 text-amber-500"/> Support & Maintenance</h3>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">Log facility defects here. Fast resolution guaranteed.</p>
             </div>
          </div>
          <form onSubmit={submitMaintenance} className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 space-y-3">
                 <select required value={maintenanceForm.issue} onChange={e=>setMaintenanceForm({...maintenanceForm, issue: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 cursor-pointer">
                    <option value="">Select Defect Type</option>
                    <option value="Electrical">Electrical Failure</option>
                    <option value="Plumbing">Plumbing / Water</option>
                    <option value="Carpentry">Carpentry / Furniture</option>
                    <option value="Cleaning">Cleaning Required</option>
                    <option value="Other">Other Issues</option>
                 </select>
                 <input type="text" placeholder="Short description..." required value={maintenanceForm.description} onChange={e=>setMaintenanceForm({...maintenanceForm, description: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold outline-none focus:ring-2 ring-primary/20" />
             </div>
             <button type="submit" className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[140px] flex flex-col items-center justify-center gap-1.5"><Wrench className="w-5 h-5"/> Send Alert</button>
          </form>
      </div>

    </div>
  );
};
export default StudentDashboard;
