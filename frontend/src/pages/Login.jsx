import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import API from '../api';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      showToast(`Welcome back, ${result.user.name}!`, 'success');
      
      // Redirect based on role
      if (result.user.role === 'Admin') {
        navigate('/admin');
      } else if (result.user.role === 'AD') {
        navigate('/ad');
      } else if (result.user.role === 'Director') {
        navigate('/director');
      } else if (result.user.role === 'Student') {
        navigate('/student');
      } else if (result.user.role === 'FoodCommittee') {
        navigate('/mess-poll');
      } else if (result.user.role === 'CalendarAdmin') {
        navigate('/calendar');
      } else if (result.user.role === 'Maintenance') {
        navigate('/maintenance');
      }
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative"
      style={{
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay to give it that light frosted look */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl relative z-10 mx-4 overflow-hidden border border-white/50 p-8 sm:p-10 scale-enter">
        
        {/* Header / Logo */}
        <div className="text-center mb-6">
          {/* Authentic College Logo */}
          <img src="/crest.png" alt="JIM Shield" className="w-full max-w-[120px] h-auto mx-auto mb-3 object-contain drop-shadow" />
          <h1 className="font-extrabold text-[22px] text-[#2c2b50] tracking-tight">JIM Hostel Portal</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5424e8] focus:ring-1 focus:ring-[#5424e8] transition-all"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#5e35b1] hover:bg-[#4527a0] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
               <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Authentic Watermark Logo (Bottom Right) */}
      <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-md border border-gray-100 rounded-lg p-2.5 px-4 shadow-xl z-20 flex flex-col mt-2">
        <span className="text-[8px] font-extrabold text-gray-400 tracking-widest mb-1 text-center w-full uppercase">Powered By</span>
        <img src="/fwt.jpg" alt="FrontierWox" className="h-9 opacity-95 object-contain" />
      </div>
    </div>
  );
};

export default Login;
