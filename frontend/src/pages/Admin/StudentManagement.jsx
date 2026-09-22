import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Edit, Trash, X, User, Phone, MapPin, ClipboardList, HelpCircle, ArrowRight, Lock, Upload, Download } from 'lucide-react';

const StudentManagement = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAcademicModal, setShowAcademicModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importing, setImporting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('II MBA');
  const [year, setYear] = useState('II');
  const [department, setDepartment] = useState('Business Administration');
  const [roomNumber, setRoomNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Active');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = '/students';
      const queryParams = [];
      if (roomFilter) queryParams.push(`room=${roomFilter}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;
      
      const res = await API.get(url);
      setStudents(res.data);
    } catch (e) {
      showToast('Error loading students registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await API.get('/rooms');
      setRooms(res.data);
    } catch (e) {
      console.error('Error fetching rooms:', e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRooms();
  }, [roomFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !roomNumber || !mobile) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    // Auto-generate unique student ID (JIM + timestamp + random digit)
    const generatedId = 'JIM' + Date.now().toString().slice(-7) + Math.floor(Math.random() * 10);

    try {
      await API.post('/students', {
        student_id: generatedId,
        register_number: generatedId,
        name,
        course,
        year,
        department,
        room_number: roomNumber,
        mobile,
        parent_mobile: '',
        email: '',
        status
      });
      showToast('Student registered successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to register student', 'error');
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setStudentId(student._id);
    setName(student.name);
    setCourse(student.course);
    setYear(student.year);
    setDepartment(student.department);
    setRoomNumber(student.room_number);
    setMobile(student.mobile);
    setStatus(student.status);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/students/${studentId}`, {
        name,
        register_number: studentId,
        course,
        year,
        department,
        room_number: roomNumber,
        mobile,
        parent_mobile: '',
        email: '',
        status
      });
      showToast('Student records updated!', 'success');
      setShowEditModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update student records', 'error');
    }
  };

  const handleDeleteClick = async (student) => {
    if (window.confirm(`Are you sure you want to delete student: ${student.name}? This will remove all their attendance and leave history.`)) {
      try {
        await API.delete(`/students/${student._id}`);
        showToast('Student removed from hostel database', 'success');
        fetchStudents();
      } catch (error) {
        showToast('Error removing student', 'error');
      }
    }
  };

  const resetForm = () => {
    setStudentId('');
    setName('');
    setCourse('II MBA');
    setYear('II');
    setDepartment('Business Administration');
    setRoomNumber('');
    setMobile('');
    setStatus('Active');
  };

  const handleResetPassword = async (student) => {
    if (window.confirm(`Are you sure you want to completely reset ${student.name}'s password to 'jim123'?`)) {
      try {
        await API.put(`/students/${student._id}/password`, { password: 'jim123' });
        showToast(`Password overridden to 'jim123' for ${student.name}`, 'success');
      } catch (error) {
        showToast('Failed to reset password', 'error');
      }
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s._id.toLowerCase().includes(q) ||
      s.mobile.includes(searchTerm)
    );
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setImporting(true);
    showToast('Importing students, please wait...', 'info');
    try {
      const res = await API.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message, 'success');
      if (res.data.errors && res.data.errors.length > 0) {
        setTimeout(() => alert("Some rows failed to import:\n" + res.data.errors.join("\n")), 500);
      }
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error importing file', 'error');
    } finally {
      setImporting(false);
      e.target.value = null; // Reset
    }
  };

  const handleAcademicCycle = async (actionType) => {
    let msg = actionType === 'graduate' 
      ? 'Are you SURE you want to DELETE all Second Year (II yr) students and completely clear their records/rooms?' 
      : 'Are you SURE you want to PROMOTE all First Year (I yr) students to Second Year (II yr)?';
      
    if (!window.confirm(msg)) return;
    
    setTransitioning(true);
    try {
      const res = await API.post('/admin/academic-transition', { action: actionType });
      showToast(res.data.message, 'success');
      setShowAcademicModal(false);
      fetchStudents();
      fetchRooms();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing academic transition', 'error');
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Student Management</h2>
          <p className="text-gray-500 text-xs mt-1">Manage roll lists, allocations, profiles, and departures</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <input 
              type="file" 
              accept=".xlsx" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <button
                onClick={() => window.open(API.defaults.baseURL + '/students/template?token=' + localStorage.getItem('jim_token'), '_blank')} 
                className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-all">
                <Download className="w-4 h-4" /> Template
            </button>
            <button
                disabled={importing}
                onClick={() => fileInputRef.current?.click()} 
                className={`flex items-center gap-2 px-3 py-2.5 ${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl font-bold text-xs shadow-md transition-all`}>
                <Upload className="w-4 h-4" /> {importing ? 'Importing...' : 'Bulk Import'}
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
            <button
                onClick={() => setShowAcademicModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                <ClipboardList className="w-4 h-4" /> Academic Cycle
            </button>
            <button
                onClick={() => window.open(API.defaults.baseURL + '/reports/students-export?format=excel&token=' + localStorage.getItem('jim_token'), '_blank')} 
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export Excel
            </button>
            <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" /> Add Student
            </button>
        </div>
      </div>

      {/* Filters Form */}
      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-gray-50/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase shrink-0">Room Filter:</span>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-3 py-2 border border-gray-100 bg-white rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>Room {r._id}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Student Name</th>
                <th className="p-4">Room No</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Attendance</th>
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
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No student records match filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4">
                      <Link 
                        to={`/students/${s._id}`}
                        className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 group"
                      >
                        {s.name}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{s.course} • <span className="font-bold text-gray-600 bg-gray-100 px-1 rounded uppercase bg-blue-50/50 text-blue-700">Username: {s._id}</span></span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">Room {s.room_number}</td>
                    <td className="p-4">{s.mobile}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        s.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-extrabold ${s.attendance_percentage < 85 ? 'text-rose-500' : 'text-gray-900'}`}>
                        {s.attendance_percentage}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-blue-200 text-gray-500 hover:text-primary hover:bg-blue-50/30 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(s)}
                          title="Reset Password to jim123"
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-amber-200 text-gray-500 hover:text-amber-500 hover:bg-amber-50/30 transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(s)}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-red-200 text-gray-500 hover:text-danger hover:bg-red-50/30 transition-all"
                        >
                          <Trash className="w-3.5 h-3.5" />
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-gray-100 shadow-2xl scale-enter overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Register New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. JEROME SAMUEL S"
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Course *</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                >
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Allocation *</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r._id} ({r.available_beds <= 0 ? 'Full' : `${r.available_beds} beds free`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Mobile *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10 digit number"
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs"
                >
                  Register Student
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-gray-100 shadow-2xl scale-enter overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Edit Student details</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Course *</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                >
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Allocation *</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r._id} ({r.occupied}/{r.capacity} Occupied)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Student Mobile *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-100 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs"
                >
                  Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Transition Modal */}
      {showAcademicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-gray-800 text-xl flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-amber-500" /> Academic Transition
              </h3>
              <button onClick={() => !transitioning && setShowAcademicModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100">
              Run these bulk scripts selectively at the end of every academic year to effortlessly cycle the database.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Step 1: Graduate 2nd Year</h4>
                  <p className="text-xs text-rose-600 mt-1">Permanently deletes all II Year students, revokes their logins, and frees their rooms.</p>
                </div>
                <button 
                  onClick={() => handleAcademicCycle('graduate')}
                  disabled={transitioning}
                  className={`shrink-0 px-4 py-2 shadow-sm ${transitioning ? 'bg-gray-300' : 'bg-rose-600 hover:bg-rose-700'} text-white font-bold rounded-lg text-xs`}
                >
                  {transitioning ? 'Processing...' : 'Run Graduation'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-blue-800 text-sm">Step 2: Promote 1st Year</h4>
                  <p className="text-xs text-blue-600 mt-1">Updates all remaining I Year students to II Year simultaneously.</p>
                </div>
                <button 
                  onClick={() => handleAcademicCycle('promote')}
                  disabled={transitioning}
                  className={`shrink-0 px-4 py-2 shadow-sm ${transitioning ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-lg text-xs`}
                >
                  {transitioning ? 'Processing...' : 'Run Promotion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
