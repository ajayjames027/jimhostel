import React, { useState, useEffect } from 'react';
import API from '../../api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CollegeCalendar = () => {
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState({});
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    const [dayOrderInput, setDayOrderInput] = useState('1');
    const [loading, setLoading] = useState(true);

    const loadCalendar = async () => {
        setLoading(true);
        try {
            const res = await API.get('/calendar');
            setCalendarData(res.data);
        } catch(e) {
            showToast('Error loading calendar data', 'error');
        }
        setLoading(false);
    };

    useEffect(() => { loadCalendar(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if(!selectedDateStr) return showToast('Please select a date on the calendar first!', 'warning');
        
        try {
            await API.post('/calendar', { date: selectedDateStr, day_order: dayOrderInput });
            showToast(`Saved Day Order for ${selectedDateStr}`, 'success');
            loadCalendar();
            setSelectedDateStr(null);
        } catch(e) {
            showToast('Error saving day order', 'error');
        }
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // empty slots
        for(let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-4 border border-gray-50 bg-gray-50/30"></div>);
        }
        // actual days
        for(let i = 1; i <= numDays; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const data = calendarData[dateStr];
            const isSelected = selectedDateStr === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            let badgeColor = 'bg-gray-100 text-gray-500';
            if (data?.day_order && data.day_order !== 'Holiday' && data.day_order !== 'None') badgeColor = 'bg-emerald-100 text-emerald-700';
            if (data?.day_order === 'Holiday') badgeColor = 'bg-rose-100 text-rose-700';

            days.push(
                <div key={dateStr} 
                     onClick={() => { setSelectedDateStr(dateStr); setDayOrderInput(data?.day_order || '1'); }}
                     className={`p-2 md:p-4 border border-gray-100 min-h-[80px] md:min-h-[100px] flex flex-col justify-between cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 border-solid z-10 relative' : isToday ? 'bg-amber-50 hover:bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
                    
                    <div className="flex justify-between items-start">
                       <span className={`font-bold ${isToday ? 'text-amber-600' : 'text-gray-700'} ${isSelected ? 'text-indigo-700' : ''}`}>{i}</span>
                    </div>

                    {data?.day_order && (
                        <div className={`mt-2 text-center text-[10px] md:text-xs font-extrabold uppercase py-1 rounded w-full ${badgeColor}`}>
                           {data.day_order === 'Holiday' ? 'Holiday' : `Order ${data.day_order}`}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-indigo-500" /> College Calendar Planner
                </h2>
                <p className="text-gray-500 text-xs mt-1">Manage Daily Orders and Holidays to display directly on Student Dashboards.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 {/* Sidebar Editor */}
                 <div className="lg:col-span-1">
                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                         <h3 className="font-extrabold text-sm text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Edit Day Order</h3>
                         
                         {selectedDateStr ? (
                             <form onSubmit={handleSave} className="space-y-4 animate-scale-in">
                                 <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Selected Date</label>
                                    <div className="w-full px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm">{selectedDateStr}</div>
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Day Order</label>
                                    <select value={dayOrderInput} onChange={e=>setDayOrderInput(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:bg-white text-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-medium">
                                        <option value="1">Order 1</option>
                                        <option value="2">Order 2</option>
                                        <option value="3">Order 3</option>
                                        <option value="4">Order 4</option>
                                        <option value="5">Order 5</option>
                                        <option value="6">Order 6</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="None">None (Clear)</option>
                                    </select>
                                 </div>
                                 <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-extrabold text-sm shadow-md flex justify-center items-center gap-2 transition-all">
                                    <Save className="w-4 h-4"/> Apply to Date
                                 </button>
                             </form>
                         ) : (
                             <div className="text-center py-10 text-gray-400">
                                 <CalendarIcon className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                                 <p className="text-sm font-semibold">Click any date on the calendar to edit its Day Order.</p>
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Calendar Grid */}
                 <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                     <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                         <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600"/></button>
                         <h3 className="font-extrabold text-lg text-gray-800 tracking-wide">
                             {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                         </h3>
                         <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-gray-600"/></button>
                     </div>
                     
                     <div className="grid grid-cols-7 text-center border-b border-gray-100">
                         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                             <div key={day} className="py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{day}</div>
                         ))}
                     </div>

                     {loading ? (
                         <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                     ) : (
                         <div className="grid grid-cols-7 auto-rows-fr">
                             {renderCalendarGrid()}
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};
export default CollegeCalendar;
