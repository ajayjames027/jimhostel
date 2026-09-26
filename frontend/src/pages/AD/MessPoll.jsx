import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Coffee, Sun, Moon, Calendar, Save, CheckCircle, CheckCircle2, Radio, Plus, Trash2, Download } from 'lucide-react';

const MessPoll = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Viewing Date
  const [campaigns, setCampaigns] = useState([]); // Array of {date, status, deadline}
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [showOnlyDefaulters, setShowOnlyDefaulters] = useState(false);
  const isFoodCommittee = user?.role === 'FoodCommittee';
  
  useEffect(() => {
    loadConfig();
  }, []);
  
  useEffect(() => {
    loadData();
  }, [date]);

  const loadConfig = async () => {
    try {
      const res = await API.get('/food-poll/config');
      if (res.data.campaigns) {
         setCampaigns(res.data.campaigns);
         const active = res.data.campaigns.filter(c => c.status !== 'unpublished');
         if (active.length > 0 && active[0]) setDate(active[0].date);
      }
    } catch(e) {}
  };

  const addActiveDate = (d) => {
      if(!d || campaigns.find(c => c.date === d)) return;
      setCampaigns(prev => [...prev, { date: d, status: 'active', deadline: '' }].sort((a,b) => a.date.localeCompare(b.date)));
  };
  const removeActiveDate = (d) => {
      setCampaigns(prev => prev.filter(x => x.date !== d));
  };
  
  const updateCampaign = (d, key, val) => {
      setCampaigns(prev => prev.map(c => c.date === d ? {...c, [key]: val} : c));
  };

  const saveConfig = async (newCampaigns = campaigns) => {
    try {
       await API.post('/food-poll/config', { campaigns: newCampaigns });
       setCampaigns(newCampaigns);
       showToast(`Poll config securely updated.`, 'success');
    } catch(e) {
       showToast('Failed to sync config', 'error');
    }
  };

  const loadData = async () => {
    if(!date) return;
    setLoading(true);
    try {
      const studRes = await API.get('/students'); 
      const pollRes = await API.get(`/food-poll/${date}`);
      
      const allStuds = studRes.data;
      const pollData = pollRes.data;
      
      const initialCounts = {};
      allStuds.forEach(s => {
        const existing = pollData.find(p => p.student_id === s._id);
        initialCounts[s._id] = {
          breakfast: existing ? existing.breakfast : false,
          lunch: existing ? existing.lunch : false,
          dinner: existing ? existing.dinner : false,
          acknowledged: existing ? (existing.acknowledged || false) : false,
          room_number: s.room_number,
          class_name: s.course
        };
      });
      setStudents(allStuds);
      setCounts(initialCounts);
    } catch (e) {
      showToast('Failed to load mess poll data', 'error');
    }
    setLoading(false);
  };

  const toggle = (sId, meal) => {
    if (isFoodCommittee) return showToast('View only mode', 'warning');
    setCounts(prev => ({
      ...prev,
      [sId]: {
        ...prev[sId],
        [meal]: !prev[sId][meal]
      }
    }));
  };

  const setAllMeal = (grp, meal, val) => {
    setCounts(prev => {
      const next = { ...prev };
      students.filter(s => s.course === grp).forEach(s => {
        next[s._id] = { ...next[s._id], [meal]: val };
      });
      return next;
    });
  };

  const savePoll = async () => {
    try {
      const records = Object.keys(counts).map(sId => ({
        student_id: sId,
        ...counts[sId]
      }));
      await API.post(`/food-poll/${date}`, { records });
      showToast('Mess counts updated successfully!', 'success');
    } catch (e) {
      showToast('Failed to save', 'error');
    }
  };

  const totals = { 
    I_MBA: { b: 0, l: 0, d: 0, responded: 0, pending: 0 }, 
    II_MBA: { b: 0, l: 0, d: 0, responded: 0, pending: 0 }
  };
  Object.values(counts).forEach(c => {
    const grpK = c.class_name === 'I MBA' ? 'I_MBA' : 'II_MBA';
    if (c.breakfast) totals[grpK].b++;
    if (c.lunch) totals[grpK].l++;
    if (c.dinner) totals[grpK].d++;
    
    if (c.acknowledged) totals[grpK].responded++;
    else totals[grpK].pending++;
  });

  const downloadPDF = async (downloadDate) => {
    if (!downloadDate) return;
    try {
        const response = await API.get(`/reports/food-poll/${downloadDate}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `MessPoll_Final_${downloadDate}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('PDF downloaded successfully!', 'success');
    } catch(e) {
        showToast('Failed to download PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Mess Food Count</h2>
          <p className="text-gray-500 text-xs mt-1">Configure multi-day weekend/holiday polls and consolidate counts.</p>
        </div>
      </div>

      {/* POLLING CONFIGURATION */}
      {!isFoodCommittee && (
      <div className="premium-card p-6 border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-transparent">
        <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2"><Radio className="w-5 h-5 text-primary"/> Active Student Poll Campaigns</h3>
        
        <div className="flex flex-col gap-3 mb-6">
           {campaigns.length === 0 && <span className="text-sm font-semibold text-gray-400 border border-dashed border-gray-300 px-4 py-3 rounded-xl">No campaigns are currently loaded.</span>}
           {campaigns.map(c => (
              <div key={c.date} className="px-4 py-3 bg-white border border-primary/20 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                 <div className="flex items-center gap-3">
                     <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary"/> {c.date.split('-').reverse().join('-')}</span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${c.status === 'active' ? 'bg-emerald-100 text-emerald-600' : c.status === 'stopped' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                         {c.status}
                     </span>
                 </div>
                 
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                     <div className="flex-1 sm:w-32">
                         <input type="datetime-local" value={c.deadline || ''} onChange={e => updateCampaign(c.date, 'deadline', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs font-semibold" title="Auto-disable deadline time" />
                     </div>
                     <select value={c.status} onChange={e => updateCampaign(c.date, 'status', e.target.value)} className="border px-2 py-1.5 rounded text-xs font-bold text-gray-700 bg-gray-50">
                        <option value="active">Active (Polling)</option>
                        <option value="stopped">Stopped (Read-only)</option>
                        <option value="unpublished">Unpublished (Hidden)</option>
                     </select>
                     <button onClick={() => removeActiveDate(c.date)} title="Delete completely" className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4"/></button>
                 </div>
              </div>
           ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-end">
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Queue Date to Poll</label>
              <div className="flex gap-2">
                 <input type="date" id="datePickerToAdd" className="px-4 py-2 bg-white border rounded-lg text-sm font-semibold h-11"/>
                 <button onClick={() => addActiveDate(document.getElementById('datePickerToAdd').value)} className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg h-11 font-bold text-sm flex items-center gap-1 shadow-sm transition-all"><Plus className="w-4 h-4"/> Add Day</button>
              </div>
           </div>
           
           <div className="flex gap-3 mt-4 md:mt-0 flex-1 md:justify-end">
             <button onClick={() => saveConfig()} className="px-6 py-2.5 h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-hover shadow-md transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Save Campaign Configs</button>
           </div>
        </div>
      </div>
      )}

      <hr className="border-gray-200 my-6" />

      {/* DASHBOARD VIEW */}
      <div className="flex justify-between items-center -mb-2">
         <h3 className="font-extrabold text-xl text-gray-800 tracking-tight">View Consolidations</h3>
         <button onClick={() => setShowOnlyDefaulters(!showOnlyDefaulters)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${showOnlyDefaulters ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-orange-500/10' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
             {showOnlyDefaulters ? "Show All Students" : "Show Defaulters Only"}
         </button>
      </div>
       <div className="premium-card p-5 grid grid-cols-1 gap-6 items-start">
        <div className="flex flex-col md:flex-row gap-4">
           <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Viewing Date Data</label>
              <div className="flex gap-2">
                  <select value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg flex-1 text-sm font-bold h-11 text-gray-800">
                     {!campaigns.some(c => c.date === date) && <option value={date}>{date ? date.split('-').reverse().join('-') : ''} (Selected)</option>}
                     <optgroup label="Active Campaign Dates">
                     {campaigns.map(c => (
                        <option key={c.date} value={c.date}>{c.date.split('-').reverse().join('-')} ({c.status})</option>
                     ))}
                     </optgroup>
                  </select>
                  <button onClick={() => downloadPDF(date)} title="Download Finalized Full Report" className="px-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors h-11 flex items-center justify-center shadow-sm">
                      <Download className="w-4 h-4"/>
                  </button>
              </div>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-4">
               {/* I MBA Stats */}
               <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl shadow-inner">
                   <h4 className="font-extrabold text-orange-600 text-sm mb-3">I MBA Participation</h4>
                   <div className="flex justify-between items-center bg-white p-2 border border-orange-100 rounded-lg">
                       <div className="text-center w-1/2 border-r border-gray-100">
                           <p className="font-black text-xl text-emerald-500 leading-none">{totals.I_MBA.responded}</p>
                           <p className="text-[9px] uppercase font-bold text-gray-400 mt-1 mt-1">Responded</p>
                       </div>
                       <div className="text-center w-1/2">
                           <p className="font-black text-xl text-rose-500 leading-none">{totals.I_MBA.pending}</p>
                           <p className="text-[9px] uppercase font-bold text-gray-400 mt-1">Pending/Defaulter</p>
                       </div>
                   </div>
               </div>

               {/* II MBA Stats */}
               <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-inner">
                   <h4 className="font-extrabold text-indigo-600 text-sm mb-3">II MBA Participation</h4>
                   <div className="flex justify-between items-center bg-white p-2 border border-indigo-100 rounded-lg">
                       <div className="text-center w-1/2 border-r border-gray-100">
                           <p className="font-black text-xl text-emerald-500 leading-none">{totals.II_MBA.responded}</p>
                           <p className="text-[9px] uppercase font-bold text-gray-400 mt-1">Responded</p>
                       </div>
                       <div className="text-center w-1/2">
                           <p className="font-black text-xl text-rose-500 leading-none">{totals.II_MBA.pending}</p>
                           <p className="text-[9px] uppercase font-bold text-gray-400 mt-1">Pending/Defaulter</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>

      {!isFoodCommittee && (
      <div className="flex justify-end pr-2 gap-3 mb-4">
        <button onClick={async () => {
             const payload = students.map(s => ({
                 student_id: s._id,
                 room_number: s.room_number,
                 class_name: s.course,
                 breakfast: false, lunch: false, dinner: false,
                 acknowledged: false
             }));
             try {
                await API.post(`/food-poll/${date}`, { records: payload });
             } catch(e) {
             }
             
             showToast('Poll manually unlocked for all students', 'success');
             setTimeout(()=>window.location.reload(), 1000);
        }} className="px-6 py-2.5 bg-white text-rose-600 border border-rose-200 font-extrabold rounded-lg flex gap-2 items-center text-sm shadow-sm transition-transform hover:bg-rose-50">
           Unlock All Students
        </button>
        <button onClick={savePoll} className="px-6 py-2.5 bg-success text-white font-bold rounded-lg flex gap-2 items-center text-sm shadow-md transition-transform hover:scale-105">
           <Save className="w-4 h-4"/> Save Modificattions / Master Override
        </button>
      </div>
      )}

      {loading ? <p className="text-center text-gray-500 font-bold py-10 animate-pulse">Loading Date Data...</p> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {['I MBA', 'II MBA'].map(grp => (
            <div key={grp} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 pb-2">
               <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-5 pb-3 border-b">
                  <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-xl text-gray-800">{grp} Group</h3>
                      <button 
                         onClick={() => {
                             const unpolled = students.filter(s => s.course === grp && !counts[s._id]?.acknowledged);
                             if(unpolled.length === 0) return showToast(`All ${grp} students have polled!`, 'info');
                             const text = `*Pending Mess Poll Responses (${grp})*\nPlease submit your choices immediately:\n\n` + unpolled.map((s, idx) => `${idx + 1}. ${s.name}`).join('\n');
                             navigator.clipboard.writeText(text);
                             showToast(`Copied ${unpolled.length} ${grp} defaulters to clipboard`, 'success');
                         }}
                         className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold transition-colors"
                      >
                         Copy Defaulters List
                      </button>
                  </div>
                  {!isFoodCommittee && (
                  <div className="text-[10px] uppercase flex gap-1 bg-gray-50 p-1 rounded-lg border">
                     <button onClick={() => setAllMeal(grp, 'breakfast', true)} className="px-2 py-1.5 bg-white shadow-sm text-orange-600 rounded font-bold hover:bg-orange-50 transition-colors">All B'fast</button>
                     <button onClick={() => setAllMeal(grp, 'lunch', true)} className="px-2 py-1.5 bg-white shadow-sm text-amber-600 rounded font-bold hover:bg-amber-50 transition-colors">All Lunch</button>
                     <button onClick={() => setAllMeal(grp, 'dinner', true)} className="px-2 py-1.5 bg-white shadow-sm text-indigo-600 rounded font-bold hover:bg-indigo-50 transition-colors">All Dinner</button>
                  </div>
                  )}
               </div>
               <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                  {students.filter(s => s.course === grp && (!showOnlyDefaulters || !counts[s._id]?.acknowledged)).map(s => (
                     <div key={s._id} className="flex justify-between px-4 py-3 rounded-xl border bg-white hover:border-gray-300 hover:shadow-sm items-center transition-all">
                        <div>
                           <div className="flex items-center gap-2">
                             <p className="font-bold text-sm text-gray-800 leading-tight">{s.name}</p>
                             {counts[s._id]?.acknowledged ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" title="Confirmed" /> : <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-sm shadow-orange-500/50" title="Pending Student Response" />}
                           </div>
                           <p className="text-[11px] font-bold text-gray-400 mt-0.5 tracking-wider">ROOM {s.room_number}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => toggle(s._id, 'breakfast')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${counts[s._id]?.breakfast ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md shadow-orange-500/30 text-white scale-105' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`} title="Breakfast"><Coffee className="w-4 h-4"/></button>
                           <button onClick={() => toggle(s._id, 'lunch')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${counts[s._id]?.lunch ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-500/30 text-white scale-105' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`} title="Lunch"><Sun className="w-5 h-5"/></button>
                           <button onClick={() => toggle(s._id, 'dinner')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${counts[s._id]?.dinner ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 text-white scale-105' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`} title="Dinner"><Moon className="w-4 h-4"/></button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MessPoll;
