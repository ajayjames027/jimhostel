import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, User, ArrowRight, Home, Users } from 'lucide-react';
import API from '../api';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [loginType, setLoginType] = useState('student');
  const [username, setUsername] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalUsername = username;
    
    if (loginType === 'student') {
       if (!roomNumber || !firstName || !password) {
         showToast('Please fill all student details', 'warning');
         return;
       }
       // Auto format: A1_Darwin
       const formattedName = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase();
       finalUsername = `${roomNumber.trim().toUpperCase()}_${formattedName}`;
    } else {
       if (!username || !password) {
         showToast('Please fill in all fields', 'warning');
         return;
       }
    }

    setLoading(true);
    const result = await login(finalUsername, password);
    setLoading(false);

    if (result.success) {
      showToast(`Welcome back, ${result.user.name}!`, 'success');
      if (result.user.role === 'Admin') navigate('/admin');
      else if (result.user.role === 'AD') navigate('/ad');
      else if (result.user.role === 'Director') navigate('/director');
      else if (result.user.role === 'Student') navigate('/student');
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative" style={{ backgroundImage: `url('/bg.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl relative z-10 mx-4 overflow-hidden border border-white/50 p-8 sm:p-10 scale-enter">
        <div className="text-center mb-6">
          <img src="/crest.png" alt="JIM Shield" className="w-full max-w-[110px] h-auto mx-auto mb-4 object-contain drop-shadow" />
          <h1 className="font-extrabold text-[24px] text-[#2c2b50] tracking-tight">JIM Hostel Portal</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6 shadow-inner">
           <button type="button" onClick={()=>setLoginType('student')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${loginType === 'student' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
              <Users className="w-4 h-4"/> Students
           </button>
           <button type="button" onClick={()=>setLoginType('staff')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${loginType === 'staff' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
              <User className="w-4 h-4"/> Staff Dashboard
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {loginType === 'student' ? (
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Room No.</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Home className="w-4 h-4" /></span>
                    <input type="text" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} placeholder="e.g. A1" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all font-bold uppercase" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">First Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User className="w-4 h-4" /></span>
                    <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="e.g. Darwin" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all font-bold" required />
                  </div>
                </div>
             </div>
          ) : (
             <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Staff Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User className="w-4 h-4" /></span>
                  <input type="text" value={username} onChange={e=>setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all font-bold" required />
                </div>
             </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Lock className="w-4 h-4" /></span>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all font-bold tracking-widest" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#5e35b1] to-[#4527a0] hover:scale-[1.02] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Access Secure Portal <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>

      <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-lg p-2.5 px-1 shadow-xl z-20 flex flex-col mt-2">
        <span className="text-[8px] font-extrabold text-gray-400 tracking-widest mb-1 text-center w-full uppercase">Powered By</span>
        <img src="/fwt.jpg" alt="FrontierWox" className="h-9 opacity-95 object-contain mix-blend-multiply" />
      </div>
    </div>
  );
};
export default Login;
