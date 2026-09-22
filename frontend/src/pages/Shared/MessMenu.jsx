import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Utensils, Edit3, Check, X, Coffee, Sun, Moon, Calendar } from 'lucide-react';

const MESS_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MessMenu = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [menuData, setMenuData] = useState({});
  const [footerStr, setFooterStr] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editFooter, setEditFooter] = useState("");

  const canEdit = user?.role === 'Admin' || user?.role === 'AD';

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await API.get('/mess-menu');
      setMenuData(res.data.menu || {});
      setFooterStr(res.data.footer || "");
      setEditData(res.data.menu || {});
      setEditFooter(res.data.footer || "");
    } catch (error) {
      showToast("Failed to load Mess Menu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDayChange = (day, mealType, value) => {
    setEditData({
      ...editData,
      [day]: {
        ...editData[day],
        [mealType]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      await API.put('/mess-menu', { menu: editData, footer: editFooter });
      setMenuData(editData);
      setFooterStr(editFooter);
      setIsEditing(false);
      showToast("Mess menu updated successfully", "success");
    } catch (err) {
      showToast("Failed to update mess menu", "error");
    }
  };

  const handleCancel = () => {
    setEditData(menuData);
    setEditFooter(footerStr);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get current day based on local time
  const currentDayIndex = new Date().getDay();
  // Map JS getDay (0=Sun, 1=Mon) to our array where 0=Mon, 6=Sun
  const todayHighlight = currentDayIndex === 0 ? "Sunday" : MESS_DAYS[currentDayIndex - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-500" /> Digital Cafeteria Menu
          </h2>
          <p className="text-gray-500 text-xs mt-1">Check today's freshly prepared meals</p>
        </div>
        
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4" /> Edit Timetable
          </button>
        )}

        {canEdit && isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                <th className="p-4 uppercase tracking-wider shrink-0 min-w-[120px]"><Calendar className="w-4 h-4 inline mr-1" /> Day</th>
                <th className="p-4 w-1/5"><Coffee className="w-4 h-4 inline mr-1" /> Breakfast</th>
                <th className="p-4 w-1/5"><Sun className="w-4 h-4 inline mr-1" /> AM Refresh</th>
                <th className="p-4 w-1/5"><Utensils className="w-4 h-4 inline mr-1" /> Lunch</th>
                <th className="p-4 w-1/5"><Coffee className="w-4 h-4 inline mr-1" /> PM Refresh</th>
                <th className="p-4 w-1/5"><Moon className="w-4 h-4 inline mr-1" /> Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {MESS_DAYS.map((day) => {
                const data = isEditing ? editData[day] || {} : menuData[day] || {};
                const isToday = day === todayHighlight && !isEditing;
                
                return (
                  <tr key={day} className={`transition-all ${isToday ? 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-amber-500' : 'hover:bg-gray-50/60'}`}>
                    <td className="p-4 font-bold text-gray-800 border-r border-gray-50 relative">
                      {day}
                      {isToday && <span className="absolute top-2 right-2 flex w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    </td>
                    
                    <td className="p-3 border-r border-gray-50">
                      {isEditing ? (
                        <textarea value={data.breakfast || ""} onChange={(e) => handleDayChange(day, 'breakfast', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded min-h-[60px] text-xs focus:ring-1 focus:ring-amber-400 outline-none" />
                      ) : (
                        <span className="text-gray-600 block">{data.breakfast || "-"}</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-gray-50">
                      {isEditing ? (
                        <textarea value={data.refreshment_am || ""} onChange={(e) => handleDayChange(day, 'refreshment_am', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded min-h-[60px] text-xs focus:ring-1 focus:ring-amber-400 outline-none" />
                      ) : (
                        <span className="text-gray-600 block">{data.refreshment_am || "-"}</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-gray-50">
                      {isEditing ? (
                        <textarea value={data.lunch || ""} onChange={(e) => handleDayChange(day, 'lunch', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded min-h-[60px] text-xs focus:ring-1 focus:ring-amber-400 outline-none" />
                      ) : (
                        <span className="text-gray-600 block">{data.lunch || "-"}</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-gray-50">
                      {isEditing ? (
                        <textarea value={data.refreshment_pm || ""} onChange={(e) => handleDayChange(day, 'refreshment_pm', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded min-h-[60px] text-xs focus:ring-1 focus:ring-amber-400 outline-none" />
                      ) : (
                        <span className="text-gray-600 block">{data.refreshment_pm || "-"}</span>
                      )}
                    </td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <textarea value={data.dinner || ""} onChange={(e) => handleDayChange(day, 'dinner', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded min-h-[60px] text-xs focus:ring-1 focus:ring-amber-400 outline-none" />
                      ) : (
                        <span className="text-gray-600 block">{data.dinner || "-"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer Notes */}
        <div className="bg-gray-100/50 p-4 border-t border-gray-100 flex items-start gap-3">
          <div className="mt-0.5"><Utensils className="w-4 h-4 text-gray-400" /></div>
          {isEditing ? (
            <input 
              type="text" 
              value={editFooter} 
              onChange={(e) => setEditFooter(e.target.value)} 
              placeholder="Footer notes (e.g. Common rice varieties...)"
              className="w-full bg-white px-3 py-2 text-xs border border-gray-200 rounded outline-none focus:ring-1 focus:ring-amber-400" 
            />
          ) : (
            <p className="text-[11px] text-gray-500 font-medium italic">
              {footerStr || "No common footer notes applied."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessMenu;
