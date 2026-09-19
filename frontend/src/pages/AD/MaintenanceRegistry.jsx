import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Wrench, CheckCircle2, Clock, MapPin, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MaintenanceRegistry = () => {
   const [issues, setIssues] = useState([]);
   const { showToast } = useToast();
   const { user } = useAuth();
   
   useEffect(() => {
       fetchIssues();
   }, []);
   
   const fetchIssues = async () => {
       try {
         const res = await API.get('/maintenance');
         setIssues(res.data);
       } catch (e) {
         showToast('Failed to load maintenance issues', 'error');
       }
   };
   
   const markComplete = async (id) => {
       try {
           await API.put(`/maintenance/${id}`, { status: 'Complete' });
           showToast('Issue marked as complete', 'success');
           fetchIssues();
       } catch(e) { showToast('Error marking complete', 'error'); }
   };

   
   const deleteIssue = async (id) => {
       if(window.confirm('Delete this maintenance record?')) {
           try {
               await API.delete(`/maintenance/${id}`);
               showToast('Deleted record', 'success');
               fetchIssues();
           } catch(e) { showToast('Error deleting', 'error'); }
       }
   };

   return (
       <div className="space-y-6 animate-fade-in">
           <div>
               <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2"><Wrench className="w-6 h-6 text-amber-500"/> Maintenance Registry</h2>
               <p className="text-gray-500 text-sm mt-1">Track and resolve issues submitted by students</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {issues.map(m => (
                   <div key={m._id} className="premium-card p-5 relative overflow-hidden group border-t-4 border-t-amber-400 flex flex-col justify-between">
                       <div>
                           <div className="flex justify-between items-start mb-3">
                               <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${m.status === 'Complete' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'}`}>
                                   {m.status === 'Complete' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>} {m.status}
                               </span>
                               <span className="text-[10px] font-bold text-gray-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                           </div>
                           {user?.role === 'Admin' && (
                               <button onClick={() => deleteIssue(m._id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white rounded p-1"><Trash2 className="w-4 h-4"/></button>
                           )}

                           
                           <h3 className="font-extrabold text-lg text-gray-900 mb-1">{m.issue}</h3>
                           <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">{m.description}</p>
                           
                           <div className="flex gap-4 text-xs font-bold text-gray-500 mb-4">
                               <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Room {m.room_number}</div>
                               <div className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {m.name}</div>
                           </div>
                           
                           {m.photo_data && (
                               <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm max-h-32 relative group cursor-pointer hover:max-h-full transition-all duration-300">
                                   <img src={m.photo_data} alt="Issue Issue" className="w-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">View Photo</div>
                               </div>
                           )}
                       </div>
                       
                       {m.status !== 'Complete' && (
                           <button onClick={() => markComplete(m._id)} className="w-full py-2.5 bg-success hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2">
                               Mark as Repaired / Complete
                           </button>
                       )}
                   </div>
               ))}
               
               {issues.length === 0 && (
                   <div className="col-span-full premium-card p-12 text-center text-gray-400">
                       <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                       <h3 className="text-lg font-bold">All good!</h3>
                       <p className="text-sm">No maintenance issues reported right now.</p>
                   </div>
               )}
           </div>
       </div>
   );
};

export default MaintenanceRegistry;
