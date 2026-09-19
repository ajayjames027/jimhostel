import os

stud = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\StudentManagement.jsx"
with open(stud, 'r', encoding='utf-8') as f:
    text = f.read()
    
stud_btn = """        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => window.open('http://localhost:5000/api/reports/students-export?format=pdf&token=' + localStorage.getItem('token'), '_blank')} 
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export PDF
            </button>
            <button
                onClick={() => window.open('http://localhost:5000/api/reports/students-export?format=excel&token=' + localStorage.getItem('token'), '_blank')} 
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export Excel
            </button>
            <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center max-h-[36px] justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" /> Add Student
            </button>
        </div>"""

text = text.replace("""        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>""", stud_btn)

with open(stud, 'w', encoding='utf-8') as f:
    f.write(text)


room = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\RoomManagement.jsx"
with open(room, 'r', encoding='utf-8') as f:
    text2 = f.read()
    
room_btn = """        <div className="flex flex-col sm:flex-row gap-2">
            <button
                onClick={() => window.open('http://localhost:5000/api/reports/rooms-export?format=pdf&token=' + localStorage.getItem('token'), '_blank')} 
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export PDF
            </button>
            <button
                onClick={() => window.open('http://localhost:5000/api/reports/rooms-export?format=excel&token=' + localStorage.getItem('token'), '_blank')} 
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Export Excel
            </button>
            <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center max-h-[36px] justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
            >
                <Plus className="w-4 h-4" /> Add Room
            </button>
        </div>"""
        
text2 = text2.replace("""        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Room
        </button>""", room_btn)

with open(room, 'w', encoding='utf-8') as f:
    f.write(text2)
