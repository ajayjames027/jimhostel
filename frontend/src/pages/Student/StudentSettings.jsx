import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Send, Lock, Wrench, Camera, CheckCircle2 } from 'lucide-react';

const StudentSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('maintenance');
  const [maintenanceForm, setMaintenanceForm] = useState({ issue: '', description: '', photo_data: '' });
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const mres = await API.get(`/maintenance`);
        setMaintenanceHistory(mres.data);
      } catch(e) {}
    }
    fetchHistory();
  }, []);

  const submitMaintenance = async (e) => {
    e.preventDefault();
    try {
       await API.post('/maintenance', maintenanceForm);
       showToast('Maintenance issue lodged successfully!', 'success');
       setMaintenanceForm({ issue: '', description: '', photo_data: '' });
       const mres = await API.get(`/maintenance`);
       setMaintenanceHistory(mres.data);
    } catch(e) { showToast('Error submitting issue', 'error'); }
  };
  
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (feedback.length < 10) return showToast('Please write a slightly more detailed suggestion.', 'warning');
    try {
        await API.post('/feedback', {
            student_id: user.username,
            room_number: '',
            message: feedback
        });
        showToast('Feedback submitted successfully! Thank you!', 'success');
        setFeedback('');
    } catch(e) {
        showToast('Failed to submit feedback.', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if(newPassword.length < 5) return showToast('Password must be at least 5 characters', 'warning');
    try {
        await API.put(`/students/${user.username}/password`, { password: newPassword });
        showToast('Password changed successfully!', 'success');
        setNewPassword('');
    } catch(e) {
        showToast('Failed to update password', 'error');
    }
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
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 flex overflow-x-auto custom-scrollbar">
            <button onClick={() => setActiveTab('maintenance')} className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold tracking-wide transition-all ${activeTab === 'maintenance' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>Maintenance</button>
            <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold tracking-wide transition-all ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>Security</button>
            <button onClick={() => setActiveTab('feedback')} className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold tracking-wide transition-all ${activeTab === 'feedback' ? 'bg-fuchsia-50 text-fuchsia-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>Feedback</button>
        </div>

        {activeTab === 'maintenance' && (
          <div className="premium-card p-8 border-t-4 border-t-amber-500 shadow-xl shadow-amber-500/5 relative overflow-hidden animate-fade-in mt-4">
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
                                     <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">{new Date(m.timestamp).toLocaleDateString('en-GB')}</span>
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
        )}
        
        {activeTab === 'security' && (
          <div className="premium-card p-8 border-t-4 border-t-indigo-500 shadow-xl shadow-indigo-500/5 relative overflow-hidden animate-fade-in mt-4">
            <h3 className="font-extrabold text-xl text-gray-900 mb-2 flex items-center gap-2"><Lock className="w-6 h-6 text-indigo-500" /> Account Security</h3>
            <p className="text-sm font-semibold text-gray-500 mb-6">Change your login password to secure your portal account.</p>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                  <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Enter new strong password" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all" />
               </div>
               
               <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all">
                  Update Password
               </button>
            </form>
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="premium-card p-8 border-t-4 border-t-fuchsia-500 shadow-xl shadow-fuchsia-500/5 relative overflow-hidden animate-fade-in mt-4">
            <h3 className="font-extrabold text-xl text-gray-900 mb-2 flex items-center gap-2"><Send className="w-6 h-6 text-fuchsia-500" /> Feedback & Suggestions</h3>
            <p className="text-sm font-semibold text-gray-500 mb-6">Have an idea to improve the hostel? Drop it anonymously here!</p>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
               <div>
                  <textarea required rows="3" value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Type your honest feedback or creative suggestions..." className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white text-sm font-medium focus:ring-2 ring-primary/20 outline-none transition-all custom-scrollbar resize-none" />
               </div>
               
               <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-xl shadow-fuchsia-500/20 active:scale-[0.98] transition-all">
                  Send Suggestion
               </button>
            </form>
          </div>
        )}
    </div>
  );
};
export default StudentSettings;
