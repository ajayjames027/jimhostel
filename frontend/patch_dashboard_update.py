import os

# 1. Update app.py backend endpoints
app_py = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\backend\app.py"
with open(app_py, "r", encoding="utf-8") as f:
    app_text = f.read()

new_routes = """
@app.route('/api/dashboard/summary', methods=['GET'])
@token_required
def dashboard_summary(current_user):
    db = get_db()
    total_st = db["students"].count_documents({})
    import datetime
    today_str = datetime.date.today().isoformat()
    present = db["attendance"].count_documents({"date": today_str, "status": "Present"})
    absent = db["attendance"].count_documents({"date": today_str, "status": "Absent"})
    total_rm = db["rooms"].count_documents({})
    appr_leaves = db["leave_requests"].count_documents({"status": "Approved"})
    pend_maint = db["maintenance"].count_documents({"status": "Pending"})
    return jsonify({
        "total_students": total_st,
        "present_today": present,
        "absent_today": absent,
        "approved_leaves": appr_leaves,
        "pending_maintenance": pend_maint,
        "total_rooms": total_rm,
        "rooms_pending": total_rm,
        "rooms_completed": 0,
        "attendance_taken_today": (present + absent) > 0
    })

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    db = get_db()
    return jsonify({
        "occupancy": {"percentage": 100},
        "trends": [],
        "student_status": {"active": db["students"].count_documents({"status": "Active"}), "leave": db["students"].count_documents({"status": "On Leave"}), "suspended": db["students"].count_documents({"status": "Suspended"}) }
    })

@app.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    return jsonify([])

@app.route('/api/announcements', methods=['GET'])
@token_required
def get_announcements(current_user):
    db = get_db()
    ann_list = list(db["announcements"].find().sort([("timestamp", -1)]))
    return jsonify(ann_list)

@app.route('/api/announcements', methods=['POST'])
@token_required
def create_announcement(current_user):
    db = get_db()
    data = request.json
    import datetime
    ann = {
        "message": data['message'],
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "author": current_user['name'],
        "author_role": current_user['role']
    }
    result = db["announcements"].insert_one(ann)
    ann["_id"] = str(result.inserted_id)
    return jsonify(ann), 201

@app.route('/api/announcements/<ann_id>', methods=['DELETE'])
@token_required
def delete_announcement(current_user, ann_id):
    db = get_db()
    from bson import ObjectId
    try: query = {"_id": ObjectId(ann_id)}
    except: query = {"_id": ann_id}
    db["announcements"].delete_one(query)
    return jsonify({"message": "Deleted"})

# =====================================================================
# AUTH ROUTES
"""
if "dashboard_summary" not in app_text:
    app_text = app_text.replace("# =====================================================================\n# AUTH ROUTES", new_routes)
    with open(app_py, "w", encoding="utf-8") as f:
        f.write(app_text)


# 2. Create Announcements.jsx
ann_jsx = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Shared\Announcements.jsx"
ann_code = """import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import { Bell, Trash2, Send } from 'lucide-react';

const Announcements = () => {
    const { showToast } = useToast();
    const [announcements, setAnnouncements] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const res = await API.get('/announcements');
            setAnnouncements(res.data);
        } catch(e) {}
        setLoading(false);
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const postAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await API.post('/announcements', { message });
            showToast('Announcement posted!', 'success');
            setMessage('');
            fetchAnnouncements();
        } catch(e) { showToast('Error posting', 'error'); }
    };

    const deleteAnnouncement = async (id) => {
        if(window.confirm('Delete announcement?')) {
            try {
                await API.delete(`/announcements/${id}`);
                fetchAnnouncements();
            } catch(e) { showToast('Error deleting', 'error'); }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">System Announcements</h2>
                <p className="text-gray-500 text-xs mt-1">Broadcast messages to all student dashboards</p>
            </div>
            
            <form onSubmit={postAnnouncement} className="premium-card p-6 flex items-start gap-4">
                <textarea 
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none h-24"
                    placeholder="Type an announcement to broadcast..."
                    value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                    required
                />
                <button type="submit" className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm flex items-center gap-2 h-fit">
                    <Send className="w-4 h-4"/> Broadcast
                </button>
            </form>

            <div className="space-y-3">
                {announcements.map(a => (
                    <div key={a._id} className="premium-card p-4 flex justify-between items-start">
                        <div>
                            <p className="text-gray-800 font-bold text-sm mb-1">{a.message}</p>
                            <span className="text-[10px] text-gray-400 font-semibold">{new Date(a.timestamp).toLocaleString()} • Posted by {a.author} ({a.author_role})</span>
                        </div>
                        <button onClick={() => deleteAnnouncement(a._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Announcements;
"""
with open(ann_jsx, "w", encoding="utf-8") as f:
    f.write(ann_code)


# 3. Update Sidebar.jsx
side_jsx = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\components\Sidebar.jsx"
with open(side_jsx, "r", encoding="utf-8") as f:
    side_text = f.read()

side_text = side_text.replace("import {", "import {\n  Bell,")
side_text = side_text.replace("{ to: '/mark-attendance', label: 'Mark Attendance', icon: UserCheck },", "{ to: '/mark-attendance', label: 'Mark Attendance', icon: UserCheck },\n    { to: '/announcements', label: 'Announcements', icon: Bell },")
side_text = side_text.replace("{ to: '/manage-students', label: 'Manage Students', icon: Users },", "{ to: '/manage-students', label: 'Manage Students', icon: Users },\n    { to: '/announcements', label: 'Announcements', icon: Bell },")

with open(side_jsx, "w", encoding="utf-8") as f:
    f.write(side_text)


# 4. Update App.jsx routing
app_f = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\App.jsx"
with open(app_f, "r", encoding="utf-8") as f:
    app_jsx_text = f.read()
    
if "Announcements from" not in app_jsx_text:
    app_jsx_text = app_jsx_text.replace("import MaintenanceRegistry from './pages/AD/MaintenanceRegistry';", "import MaintenanceRegistry from './pages/AD/MaintenanceRegistry';\nimport Announcements from './pages/Shared/Announcements';")
    
    routes_insert = """<Route path="/maintenance" element={<RoleGuard allowedRoles={['Admin', 'AD']}><MaintenanceRegistry /></RoleGuard>} />
              <Route path="/announcements" element={<RoleGuard allowedRoles={['Admin', 'AD']}><Announcements /></RoleGuard>} />"""
    app_jsx_text = app_jsx_text.replace("<Route path=\"/maintenance\" element={<RoleGuard allowedRoles={['Admin', 'AD']}><MaintenanceRegistry /></RoleGuard>} />", routes_insert)

    with open(app_f, "w", encoding="utf-8") as f:
        f.write(app_jsx_text)


# 5. DirectorDashboard patch details
dir_f = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Director\DirectorDashboard.jsx"
with open(dir_f, "r", encoding="utf-8") as f:
    dir_text = f.read()
dir_text = dir_text.replace("{stats?.rooms_completed} Rooms", "{stats?.attendance_taken_today ? 'Completed' : 'Not Started'}")
dir_text = dir_text.replace("Roll Calls Pending", "Maintenance Pending")
dir_text = dir_text.replace("stats?.rooms_pending", "stats?.pending_maintenance")
dir_text = dir_text.replace("Hostel Occupancy", "Approved Leaves")
dir_text = dir_text.replace("analytics?.occupancy?.percentage || 0", "stats?.approved_leaves || 0")
dir_text = dir_text.replace("%", "")
with open(dir_f, "w", encoding="utf-8") as f:
    f.write(dir_text)


# 6. StudentDashboard scrolling marquee
stud_d = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Student\StudentDashboard.jsx"
with open(stud_d, "r", encoding="utf-8") as f:
    sd_text = f.read()

marq_logic = """
  const [maintenanceForm, setMaintenanceForm] = useState({ issue: '', description: '', photo_data: '' });
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get(`/students/${user.username}`);
        setMyProfile(res.data);
        const mres = await API.get(`/maintenance`);
        setMaintenanceHistory(mres.data);
        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
      } catch(e) {}
    }
"""
if "const [announcements, setAnnouncements]" not in sd_text:
    sd_text = sd_text.replace("""
  const [maintenanceForm, setMaintenanceForm] = useState({ issue: '', description: '', photo_data: '' });
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get(`/students/${user.username}`);
        setMyProfile(res.data);
        
        const mres = await API.get(`/maintenance`);
        setMaintenanceHistory(mres.data);
      } catch(e) {}
    }""", marq_logic)

marq_ui = """
      {/* Header Profile Section */}
      
      {announcements.length > 0 && (
         <div className="bg-amber-100 text-amber-800 p-2 rounded-xl border border-amber-200 overflow-hidden relative shadow-sm mb-4 flex items-center font-bold text-xs">
            <span className="whitespace-nowrap px-3 tracking-wider uppercase shrink-0 z-10 bg-amber-100 border-r border-amber-200">📢 HEADS UP:</span>
            <marquee behavior="scroll" direction="left" scrollamount="4" className="ml-2 pt-0.5">
               {announcements.map((a, i) => (
                   <span key={i} className="mr-8">{" "}{a.message} <span className="font-normal text-[9px]">({a.author})</span>{" "}</span>
               ))}
            </marquee>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
"""
if "📢 HEADS UP:" not in sd_text:
    sd_text = sd_text.replace("""
      {/* Header Profile Section */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">""", marq_ui)

with open(stud_d, "w", encoding="utf-8") as f:
    f.write(sd_text)

print("Comprehensive patch logic executed smoothly!")
