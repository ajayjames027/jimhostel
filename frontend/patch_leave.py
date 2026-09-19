import os

file_path = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Student\StudentDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. State
text = text.replace(
    "const [myProfile, setMyProfile] = useState(null);",
    "const [myProfile, setMyProfile] = useState(null);\n  const [myLeaves, setMyLeaves] = useState([]);"
)

# 2. Fetch
old_fetch = """        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
      } catch(e) {}"""
new_fetch = """        const ares = await API.get(`/announcements`);
        setAnnouncements(ares.data);
        const lres = await API.get(`/my-leaves`);
        setMyLeaves(lres.data);
      } catch(e) {}"""
text = text.replace(old_fetch, new_fetch)


# 3. Reload after apply
old_submit = """       setLeaveForm({ leave_from: '', leave_to: '', reason: '' });
     } catch(e) { showToast('Error applying for leave', 'error'); }"""
new_submit = """       setLeaveForm({ leave_from: '', leave_to: '', reason: '' });
       const lres = await API.get(`/my-leaves`);
       setMyLeaves(lres.data);
     } catch(e) { showToast('Error applying for leave', 'error'); }"""
text = text.replace(old_submit, new_submit)


# 4. UI
old_ui = """                 </button>
              </form>
            </div>
            
            <div className="premium-card p-8 border-t-4 border-t-amber-500"""
new_ui = """                 </button>
              </form>

              {/* Leave History Tracker */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                 <h4 className="font-extrabold text-sm text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/> Past Leave Requests Tracker</h4>
                 {myLeaves.length === 0 ? (
                     <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 font-semibold text-xs">No leave requests logged yet.</div>
                 ) : (
                     <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                         {myLeaves.map(l => (
                             <div key={l._id} className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                   <p className="font-extrabold text-xs text-gray-700 tracking-wide">{new Date(l.leave_from).toLocaleDateString('en-GB')} <span className="opacity-40">→</span> {new Date(l.leave_to).toLocaleDateString('en-GB')}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-[9px] uppercase font-extrabold rounded-md flex shrink-0 ${
                                    l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                    l.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                   {l.status}
                                </span>
                             </div>
                         ))}
                     </div>
                 )}
              </div>
            </div>
            
            <div className="premium-card p-8 border-t-4 border-t-amber-500"""
text = text.replace(old_ui, new_ui)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("Patch applied for leave records securely")
