import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import API from '../api';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const wakeTimer = setTimeout(() => {
      if (isMounted) {
        setIsWakingUp(true);
      }
    }, 1500);

    API.get('/health')
      .then(() => {
        clearTimeout(wakeTimer);
        if (isMounted) setIsWakingUp(false);
      })
      .catch(() => {
        clearTimeout(wakeTimer);
        if (isMounted) setIsWakingUp(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(wakeTimer);
    };
  }, []);

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
      }
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-tr from-blue-50 via-gray-50 to-indigo-50 px-4 pt-16">
      <div className="w-full max-w-md scale-enter">
        {/* Header Block */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-primary/20 mb-4 animate-bounce-subtle">
            J
          </div>
          <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">JIM HOSTEL</h1>
          <p className="text-gray-500 text-sm mt-1">Attendance Management System</p>
        </div>

        {/* Card Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Sign In to Dashboard</h2>
          
          {isWakingUp && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2.5 animate-pulse">
              <span className="text-amber-500 text-base mt-0.5">⚡</span>
              <div className="text-[11px] text-amber-800 font-medium leading-relaxed text-left">
                <span className="font-bold">Server is starting up...</span> Render's free tier spins down after inactivity. Loading the database might take 30-40 seconds.
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase">Username</label>
                 <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Students: Login as room_firstname (e.g. A1_Darwin)</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ad_boys"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>


      </div>
    </div>
  );
};

export default Login;
