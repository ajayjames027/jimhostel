import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Send, ShieldCheck, Clock, CheckCircle, Trash2 } from 'lucide-react';

const EGatePass = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({ 
    student_id: '', 
    date: new Date().toISOString().split('T')[0], 
    out_time: '', 
    in_time: '', 
    reason: '' 
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, passRes] = await Promise.all([
        API.get('/students'),
        API.get('/egate-pass')
      ]);
      setStudents(stuRes.data);
      setPasses(passRes.data);
    } catch(e) {
      showToast('Error loading E-Gate data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const submitPass = async (e) => {
    e.preventDefault();
    try {
      await API.post('/egate-pass', form);
      showToast('Digital E-Gate Pass generated successfully!', 'success');
      setForm({ ...form, student_id: '', reason: '' });
      loadData();
    } catch (e) {
      showToast('Error generating pass', 'error');
    }
  };

  const deletePass = async (id) => {
    if(window.confirm('Revoke this digital gate pass?')) {
        try {
            await API.delete(`/egate-pass/${id}`);
            showToast('Gate pass revoked.', 'success');
            loadData();
        } catch(e) { showToast('Error deleting', 'error'); }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Express E-Gate Pass Builder
          </h2>
          <p className="text-gray-500 text-xs mt-1">Generate short-term outpasses for students. Digitally signed by AD.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form Panel */}
         <div className="premium-card p-6 h-fit bg-gradient-to-br from-white to-gray-50/50">
            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
               <QrCode className="w-4 h-4 text-emerald-500" /> Create New Pass
            </h3>
            <form onSubmit={submitPass} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Select Student</label>
                  <select required value={form.student_id} onChange={e=>setForm({...form, student_id: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:bg-white text-sm focus:ring-2 ring-emerald-500/20 outline-none transition-all font-medium">
                     <option value="">-- Choose Student --</option>
                     {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.room_number})</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Date</label>
                  <input type="date" required value={form.date} onChange={e=>setForm({...form, date: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 ring-emerald-500/20 outline-none transition-all" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Out Time</label>
                      <input type="time" required value={form.out_time} onChange={e=>setForm({...form, out_time: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 ring-emerald-500/20 outline-none transition-all" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">In Time</label>
                      <input type="time" required value={form.in_time} onChange={e=>setForm({...form, in_time: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 ring-emerald-500/20 outline-none transition-all" />
                   </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Reason</label>
                  <textarea required value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})} rows="2" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 ring-emerald-500/20 outline-none transition-all resize-none" placeholder="E.g., Medical, Stationery, etc." />
               </div>
               
               <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
                 <p className="text-[10px] text-emerald-800 font-semibold italic text-center">This pass will be instantly delivered to the student's dashboard, digitally signed under '{user.name}'.</p>
               </div>

               <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-extrabold text-sm shadow-xl shadow-gray-900/20 flex justify-center items-center gap-2 transition-all active:scale-[0.98] mt-2">
                  <Send className="w-4 h-4"/> Issue Digital Pass
               </button>
            </form>
         </div>

         {/* History panel */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-sm text-gray-800 tracking-wide uppercase border-b border-gray-100 pb-2">Issued Short-Term Passes</h3>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : passes.length === 0 ? (
                 <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 text-gray-400 font-medium text-sm">No passes issued recently.</div>
              ) : (
                passes.map(p => {
                   // Calculate expiry
                   const [outH, outM] = p.out_time.split(':');
                   const [inH, inM] = p.in_time.split(':');
                   
                   const current = new Date();
                   const passDate = new Date(p.date);
                   const passIn = new Date(p.date);
                   passIn.setHours(parseInt(inH), parseInt(inM), 0);
                   
                   const isExpired = current > passIn;

                   return (
                     <div key={p._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-gray-200 transition-all relative overflow-hidden group">
                        {isExpired && <div className="absolute inset-0 bg-gray-50/50 pointer-events-none z-0"></div>}
                        
                        <div className="relative z-10 flex gap-4 w-full items-center">
                           <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                             {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <span className="font-bold text-gray-400 text-sm">{p.student_name ? p.student_name.charAt(0) : '?'}</span>}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-extrabold text-gray-800 text-sm">{p.student_name}</p>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">{p.room_number || 'N/A'}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-semibold mt-1 bg-gray-50 px-2 py-1 rounded inline-flex items-center gap-1.5">
                                 <Clock className="w-3.5 h-3.5 text-emerald-500"/> 
                                 {p.out_time} to {p.in_time} <span className="font-light text-gray-400">|</span> {new Date(p.date).toLocaleDateString('en-GB')}
                              </p>
                              <p className="text-xs text-gray-600 italic mt-2 border-l-2 border-gray-200 pl-2">"{p.reason}"</p>
                           </div>
                           
                           <div className="flex flex-col items-end gap-2 shrink-0">
                               {user.role === 'Admin' && (
                                 <button onClick={()=>deletePass(p._id)} className="text-gray-300 hover:text-red-500 p-1 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                     <Trash2 className="w-3.5 h-3.5"/>
                                 </button>
                               )}
                               <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${!isExpired ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-500'}`}>
                                 {!isExpired ? 'Active' : 'Expired'}
                               </span>
                           </div>
                        </div>
                     </div>
                   );
                })
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
export default EGatePass;
