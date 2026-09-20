import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash, X, Home, Users, HelpCircle, Save } from 'lucide-react';

const RoomManagement = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [block, setBlock] = useState('Toulouse Arena');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(6);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await API.get('/rooms');
      setRooms(res.data);
    } catch (e) {
      showToast('Error loading rooms map details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber) {
      showToast('Please enter room number', 'warning');
      return;
    }

    try {
      await API.post('/rooms', {
        room_number: roomNumber,
        block,
        floor,
        capacity
      });
      showToast('Room added successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add room', 'error');
    }
  };

  const handleEditClick = (room) => {
    setSelectedRoom(room);
    setRoomNumber(room._id);
    setBlock(room.block);
    setFloor(room.floor);
    setCapacity(room.capacity);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/rooms/${roomNumber}`, {
        block,
        floor,
        capacity
      });
      showToast('Room configurations updated!', 'success');
      setShowEditModal(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to edit room', 'error');
    }
  };

  const handleDeleteClick = async (room) => {
    if (room.occupied > 0) {
      showToast('Cannot delete room: Students are currently allocated to it.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete Room ${room._id}?`)) {
      try {
        await API.delete(`/rooms/${room._id}`);
        showToast('Room deleted from database', 'success');
        fetchRooms();
      } catch (error) {
        showToast('Error deleting room', 'error');
      }
    }
  };

  const resetForm = () => {
    setRoomNumber('');
    setBlock('Toulouse Arena');
    setFloor(1);
    setCapacity(6);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Room Management</h2>
          <p className="text-gray-500 text-xs mt-1">Configure hostel rooms, floor divisions, and bed capacities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => window.open(API.defaults.baseURL + '/reports/rooms-export?format=pdf&token=' + localStorage.getItem('jim_token'), '_blank')} 
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export PDF
            </button>
            <button
                onClick={() => window.open(API.defaults.baseURL + '/reports/rooms-export?format=excel&token=' + localStorage.getItem('jim_token'), '_blank')} 
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export Excel
            </button>
            <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center max-h-[36px] justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" /> Add Room
            </button>
        </div>
      </div>

      {/* Grid listing */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Room Number</th>
                <th className="p-4">Block Location</th>
                <th className="p-4">Floor level</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Occupied Beds</th>
                <th className="p-4">Available Beds</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No rooms currently configured.
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 font-bold text-gray-900">Room {r._id}</td>
                    <td className="p-4">{r.block}</td>
                    <td className="p-4">Floor {r.floor}</td>
                    <td className="p-4 font-bold text-gray-800">{r.capacity} Beds</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.occupied === r.capacity ? 'bg-rose-50 text-rose-700 border border-rose-100/50' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.occupied} Beds occupied
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{r.available_beds} free</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="p-1.5 rounded-lg border border-gray-100 hover:border-blue-200 text-gray-500 hover:text-primary hover:bg-blue-50/30 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(r)}
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

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Configure New Room</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Number *</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. A7 or B6"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Block Name</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Floor Level</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bed Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 6)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
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
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 pt-16 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl scale-enter">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-md">Edit Room details</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Room Number (Disabled)</label>
                <input
                  type="text"
                  value={roomNumber}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Block Name</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Floor Level</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bed Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 6)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    required
                  />
                </div>
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

export default RoomManagement;
