import os

# 1. MaintenanceRegistry.jsx
file_maint = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\AD\MaintenanceRegistry.jsx'
with open(file_maint, 'r', encoding='utf-8') as f:
    text_maint = f.read()

# Add useAuth and Trash2
text_maint = text_maint.replace(
    "import { Wrench, CheckCircle2, Clock, MapPin, User } from 'lucide-react';",
    "import { Wrench, CheckCircle2, Clock, MapPin, User, Trash2 } from 'lucide-react';\nimport { useAuth } from '../../context/AuthContext';"
)

text_maint = text_maint.replace(
    "const { showToast } = useToast();",
    "const { showToast } = useToast();\n   const { user } = useAuth();"
)

delete_logic = """
   const deleteIssue = async (id) => {
       if(window.confirm('Delete this maintenance record?')) {
           try {
               await API.delete(`/maintenance/${id}`);
               showToast('Deleted record', 'success');
               fetchIssues();
           } catch(e) { showToast('Error deleting', 'error'); }
       }
   };
"""

text_maint = text_maint.replace("return (", delete_logic + "\n   return (")

delete_button = """
                               <span className="text-[10px] font-bold text-gray-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                           </div>
                           {user?.role === 'Admin' && (
                               <button onClick={() => deleteIssue(m._id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors bg-white rounded p-1"><Trash2 className="w-4 h-4"/></button>
                           )}
"""

text_maint = text_maint.replace("""
                               <span className="text-[10px] font-bold text-gray-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                           </div>""", delete_button)

with open(file_maint, 'w', encoding='utf-8') as f:
    f.write(text_maint)

# 2. LeaveManagement.jsx
file_leave = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Shared\LeaveManagement.jsx'
with open(file_leave, 'r', encoding='utf-8') as f:
    text_leave = f.read()

text_leave = text_leave.replace(
    "import { Calendar, CheckCircle, XCircle, Send } from 'lucide-react';",
    "import { Calendar, CheckCircle, XCircle, Send, Trash2 } from 'lucide-react';"
)

delete_leave_logic = """
  const handleAction = async (id, status) => {
"""
delete_leave_func = """
  const deleteLeave = async (id) => {
      if(window.confirm('Delete this leave request permanently?')) {
          try {
              await API.delete(`/leave/${id}`);
              showToast('Leave request deleted', 'success');
              loadData();
          } catch(e) { showToast('Error deleting', 'error'); }
      }
  };

  const handleAction = async (id, status) => {
"""
text_leave = text_leave.replace(delete_leave_logic, delete_leave_func)

delete_leave_btn = """
                     <div className="flex flex-col items-end gap-2 relative">
                        {user.role === 'Admin' && <button onClick={()=>deleteLeave(l._id)} className="absolute -top-2 -right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
"""
text_leave = text_leave.replace("""<div className="flex flex-col items-end gap-2">""", delete_leave_btn)

with open(file_leave, 'w', encoding='utf-8') as f:
    f.write(text_leave)

# 3. StudentManagement.jsx
file_stud = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\StudentManagement.jsx'
with open(file_stud, 'r', encoding='utf-8') as f:
    text_stud = f.read()

export_stud_buttons = """
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => window.open('http://localhost:5000/api/reports/students-export?format=pdf&token=' + localStorage.getItem('token'), '_blank')} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">Export PDF</button>
            <button onClick={() => window.open('http://localhost:5000/api/reports/students-export?format=excel&token=' + localStorage.getItem('token'), '_blank')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">Export Excel</button>
          </div>
          <button
"""
text_stud = text_stud.replace("""
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button""", export_stud_buttons)

with open(file_stud, 'w', encoding='utf-8') as f:
    f.write(text_stud)

# 4. RoomManagement.jsx
file_room = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\RoomManagement.jsx'
with open(file_room, 'r', encoding='utf-8') as f:
    text_room = f.read()

export_room_buttons = """
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-slide-in">
          <div className="flex gap-2">
            <button onClick={() => window.open('http://localhost:5000/api/reports/rooms-export?format=pdf&token=' + localStorage.getItem('token'), '_blank')} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">Export PDF</button>
            <button onClick={() => window.open('http://localhost:5000/api/reports/rooms-export?format=excel&token=' + localStorage.getItem('token'), '_blank')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">Export Excel</button>
          </div>
          <button"""

text_room = text_room.replace("""
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-slide-in">
          <button""", export_room_buttons)

with open(file_room, 'w', encoding='utf-8') as f:
    f.write(text_room)

print("Frontend patched smoothly!")
