import os

dir_f = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Director\DirectorDashboard.jsx"
with open(dir_f, "r", encoding="utf-8") as f:
    text = f.read()

# Replace Imports
text = text.replace(
    "import { Users, UserCheck, AlertTriangle, ClipboardList, ShieldAlert, ChevronRight, Home, HelpCircle } from 'lucide-react';",
    "import { Users, UserCheck, AlertTriangle, ClipboardList, ShieldAlert, ChevronRight, Home, HelpCircle, CheckCircle2, Wrench } from 'lucide-react';"
)

old_cards_start = """      {/* Stats summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Students</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.total_students}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-success">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Present today</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.present_today}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-danger animate-pulse-subtle">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Absent today</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.absent_today}</h3>
          </div>
        </div>

        <div className="premium-card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-secondary">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Approved Leaves</span>
            <h3 className="font-extrabold text-xl text-gray-800 mt-0.5">{stats?.approved_leaves || 0}</h3>
          </div>
        </div>
      </div>"""

new_cards = """      {/* Stats summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Total Students</span>
            <h3 className="font-extrabold text-lg text-gray-800 mt-0.5">{stats?.total_students}</h3>
          </div>
        </div>

        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Total Rooms</span>
            <h3 className="font-extrabold text-lg text-gray-800 mt-0.5">{stats?.total_rooms}</h3>
          </div>
        </div>
        
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Roll Call Check</span>
            <h3 className={`font-extrabold text-[13px] mt-0.5 ${stats?.attendance_taken_today ? 'text-emerald-700' : 'text-gray-400'}`}>
               {stats?.attendance_taken_today ? 'COMPLETED' : 'PENDING'}
            </h3>
          </div>
        </div>

        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-danger animate-pulse-subtle">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Absent today</span>
            <h3 className="font-extrabold text-lg text-rose-600 mt-0.5">{stats?.absent_today}</h3>
          </div>
        </div>

        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-secondary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Approved Leaves</span>
            <h3 className="font-extrabold text-lg text-gray-800 mt-0.5">{stats?.approved_leaves || 0}</h3>
          </div>
        </div>
        
        <div className="premium-card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">Maintenance</span>
            <h3 className="font-extrabold text-lg text-gray-800 mt-0.5">{stats?.pending_maintenance || 0} pending</h3>
          </div>
        </div>
      </div>"""

text = text.replace(old_cards_start, new_cards)

with open(dir_f, "w", encoding="utf-8") as f:
    f.write(text)
