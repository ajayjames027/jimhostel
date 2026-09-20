import React, { useState, useEffect } from 'react';
import API from '../../api';
import { Send, User } from 'lucide-react';

const FeedbackViewer = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await API.get('/feedback');
        setFeedbacks(res.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-fuchsia-50 flex items-center justify-center">
                 <Send className="w-5 h-5 text-fuchsia-600" />
             </div>
             Feedback & Suggestions
          </h2>
          <p className="text-sm font-semibold text-gray-400 mt-1 ml-14">View all student-submitted feedback and creative suggestions.</p>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400">Loading student feedback...</p>
         </div>
      ) : feedbacks.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-500">No student feedback or suggestions have been lodged yet.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map(f => (
               <div key={f._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
                             <User className="w-4 h-4 text-gray-500" />
                         </div>
                         <div>
                            <p className="text-xs font-extrabold text-gray-900">{f.student_id}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{f.room_number ? `Room ${f.room_number}` : 'No Room Assigned'}</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block">
                          {new Date(f.timestamp).toLocaleDateString()}
                      </span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm font-semibold text-gray-700 leading-relaxed group-hover:border-fuchsia-100 transition-colors">
                      {f.message}
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};
export default FeedbackViewer;
