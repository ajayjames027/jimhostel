import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Key, Eye, EyeOff, X, User, Mail, ShieldAlert, Edit, Trash } from 'lucide-react';

const UserAccounts = () => {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');

  const handleEditClick = (acc) => {
    setSelectedUsername(acc.username);
    setName(acc.name);
    setEmail(acc.email);
    setRole(acc.role);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !role) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      await API.put(`/accounts/${selectedUsername}`, {
        name,
        email,
        role
      });
      showToast('User account updated successfully!', 'success');
      setShowEditModal(false);
      resetAddForm();
      fetchAccounts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update user account', 'error');
    }
  };

  const handleDeleteClick = async (username) => {
    if (window.confirm(`Are you sure you want to delete staff account: ${username}? This cannot be undone.`)) {
      try {
        await API.delete(`/accounts/${username}`);
        showToast('User account deleted successfully', 'success');
        fetchAccounts();
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to delete user account', 'error');
      }
    }
  };

  // Add User Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AD');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset Password Form
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/accounts');
      setAccounts(res.data);
    } catch (e) {
      showToast('Error loading user profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !name || !email) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      await API.post('/accounts', {
        username,
        password,
        role,
        email,
        name
      });
      showToast('User account created successfully!', 'success');
      setShowAddModal(false);
      resetAddForm();
      fetchAccounts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create user account', 'error');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showToast('Please enter new password', 'warning');
      return;
    }

    try {
      await API.post('/auth/reset-password', {
        username: selectedUsername,
        new_password: newPassword
      });
      showToast(`Password for user '${selectedUsername}' reset successfully!`, 'success');
      setShowResetModal(false);
      setNewPassword('');
    } catch (error) {
      showToast('Failed to reset user password', 'error');
    }
  };

  const resetAddForm = () => {
    setUsername('');
    setPassword('');
    setRole('AD');
    setEmail('');
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Staff Accounts</h2>
          <p className="text-gray-500 text-xs mt-1">Manage system logins, roles, and administrative access codes</p>
        </div>
        
        <button
          onClick={() => { resetAddForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Create Account
        </button>
      </div>

      {/* Grid listing */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Access</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No staff accounts configured.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{acc.name}</td>
                    <td className="p-4 font-semibold text-primary">{acc.username}</td>
                    <td className="p-4 text-gray-500">{acc.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        acc.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        acc.role === 'Director' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {acc.created_at ? new Date(acc.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(acc)}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-blue-200 text-gray-500 hover:text-primary hover:bg-blue-50/30 transition-all"
                          title="Edit Account Details"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button
                          onClick={() => { setSelectedUsername(acc.username); setShowResetModal(true); }}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-amber-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50/30 transition-all"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(acc.username)}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-red-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50/30 transition-all"
                          title="Delete Account"
                        >
                          <Trash className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Register Staff Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mr. Darwin"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. darwin@jim.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ad_boys"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role Access *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="AD">Assistant Director (AD)</option>
                    <option value="Director">Hostel Director</option>
                    <option value="Admin">System Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Access Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
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

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-500" /> Reset Password
              </h3>
              <button onClick={() => setShowResetModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs font-semibold">
              <p className="text-gray-500 text-xs leading-normal">
                You are overriding the password credentials for username: <strong className="text-gray-800">'{selectedUsername}'</strong>.
              </p>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new code"
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2.5 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Edit Staff Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mr. Darwin"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. darwin@jim.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role Access *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none cursor-pointer"
                  required
                >
                  <option value="AD">Assistant Director (AD)</option>
                  <option value="Director">Hostel Director</option>
                  <option value="Admin">System Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccounts;
