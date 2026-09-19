import React, { useState, useEffect } from 'react';
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
