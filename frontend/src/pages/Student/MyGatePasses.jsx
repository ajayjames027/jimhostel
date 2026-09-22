import React, { useState, useEffect } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Clock, CheckCircle, Ban, QrCode } from 'lucide-react';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="bg-gray-900 border-2 border-gray-800 text-white rounded-xl p-3 my-4 w-full text-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-12 h-[200%] bg-white/10 rotate-45 transform -translate-x-[150%] -translate-y-1/2 group-hover:translate-x-[500%] transition-transform duration-[2000ms] ease-in-out pointer-events-none"></div>
            <p className="font-mono text-3xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{time.toLocaleTimeString('en-US', { hour12: true })}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mt-1.5 flex items-center justify-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
               Live Security Verification
            </p>
        </div>
    );
};

const MyGatePasses = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const passRes = await API.get('/egate-pass');
      setPasses(passRes.data);
    } catch(e) {
      showToast('Error loading E-Gate data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> My Express Gate Passes
          </h2>
          <p className="text-gray-500 text-xs mt-1">View your short-term Outpasses generated directly by your AD.</p>
        </div>
      </div>

      <div className="premium-card p-6 min-h-[50vh]">
         {loading ? (
             <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
         ) : passes.length === 0 ? (
             <div className="text-center p-12 text-gray-400 font-medium flex flex-col items-center">
                 <ShieldCheck className="w-12 h-12 text-gray-200 mb-3" />
                 <p>No Express Gate Passes found.</p>
                 <span className="text-xs text-gray-400 mt-1">If you receive an outpass from the AD, it will reliably show up here.</span>
             </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {passes.map(p => {
                   const [outH, outM] = p.out_time.split(':');
                   const [inH, inM] = p.in_time.split(':');
                   
                   const current = new Date();
                   const passIn = new Date(p.date);
                   passIn.setHours(parseInt(inH), parseInt(inM), 0);
                   
                   const isExpired = current > passIn || p.status === 'Disabled';

                   return (
                     <div key={p._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:border-gray-200 transition-all relative overflow-hidden group">
                        {isExpired && <div className="absolute inset-0 bg-gray-50/70 pointer-events-none z-0"></div>}
                        
                        <div className="relative z-10 flex justify-between items-start w-full">
                           <div className="flex-1">
                              <p className="text-xs text-gray-500 font-semibold mb-2 bg-gray-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 border border-gray-100">
                                 <Clock className="w-3.5 h-3.5 text-emerald-500"/> 
                                 {p.out_time} to {p.in_time} <span className="font-light text-gray-400">|</span> {new Date(p.date).toLocaleDateString('en-GB')}
                              </p>
                              
                              <p className="text-sm font-extrabold text-gray-800 leading-snug">"{p.reason}"</p>
                              
                              <div className="mt-4 flex items-center gap-3">
                                 <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${p.status === 'Disabled' ? 'bg-rose-50 text-rose-500' : !isExpired ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-500'}`}>
                                     {p.status === 'Disabled' ? 'Revoked' : !isExpired ? 'Active' : 'Expired'}
                                 </span>
                                 {!isExpired && p.status === 'Active' && (
                                     <button onClick={() => setSelectedPass(p)} className="px-3 py-1 bg-gray-900 text-white rounded-md text-[10px] font-extrabold uppercase flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-sm">
                                         <QrCode className="w-3 h-3" /> View Pass
                                     </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                   );
                })}
            </div>
         )}
      </div>

      {selectedPass && (() => {
        const [outH, outM] = selectedPass.out_time.split(':');
        const [inH, inM] = selectedPass.in_time.split(':');
        
        const current = new Date();
        const passIn = new Date(selectedPass.date);
        passIn.setHours(parseInt(inH), parseInt(inM), 0);
        
        const isExpired = current > passIn || selectedPass.status !== 'Active';

        const baseQRData = `JIM-EXPRESS-PASS-${selectedPass._id}`;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden relative border border-white/20 scale-enter">
              
              <div className={`p-4 text-center ${!isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                <h2 className="text-white font-extrabold tracking-widest uppercase text-sm">Express Digital Pass</h2>
                <p className="text-white/80 text-[10px] font-bold uppercase mt-0.5">JIM Boys Hostel</p>
              </div>

              <div className="p-6 flex flex-col items-center relative">
                
                <div className={`absolute top-4 right-4 px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${!isExpired ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-rose-100 text-rose-700'}`}>
                    {!isExpired ? 'ACTIVE' : 'EXPIRED'}
                </div>

                <div className="w-16 h-16 rounded-full bg-gray-100 mb-3 flex items-center justify-center overflow-hidden border-2 border-gray-100">
                    {selectedPass.photo ? <img src={selectedPass.photo} className="w-full h-full object-cover" alt="Profile" /> : <span className="font-bold text-gray-400 text-xl">{user.name.charAt(0)}</span>}
                </div>

                <h3 className="font-extrabold text-lg text-gray-900">{user.name}</h3>
                <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">
                  {selectedPass.room_number ? `Room ${selectedPass.room_number}` : 'N/A'}
                </p>

                <div className="w-full h-px bg-gray-100 my-2 border-dashed border"></div>
                
                {!isExpired && <LiveClock />}

                <div className={`p-3 rounded-2xl ${!isExpired ? 'bg-emerald-50 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-rose-50 border-2 border-rose-500 opacity-60'} relative ${!isExpired ? 'mt-2' : 'mt-6'}`}>
                    {isExpired && <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-rose-600 text-white font-extrabold px-3 py-1 rounded text-lg rotate-[-15deg] shadow-lg">INVALID</span></div>}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${!isExpired ? '100x100' : '150x150'}&data=${baseQRData}`} alt="QR" className={`rounded-lg mix-blend-multiply ${isExpired ? 'opacity-30' : ''}`} />
                </div>

                <p className="text-[9px] text-gray-400 mt-2 font-mono font-semibold">{baseQRData}</p>

                <div className="w-full bg-gray-50 rounded-xl p-3 mt-4 space-y-2 border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Valid Date</span>
                      <span className="font-extrabold text-gray-800">{new Date(selectedPass.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Timing</span>
                      <span className="font-extrabold text-gray-800">{selectedPass.out_time} to {selectedPass.in_time}</span>
                    </div>
                </div>

                <div className="w-full border-t border-gray-100 mt-4 pt-4 text-center">
                   <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Digitally Signed By</p>
                   <p className="font-serif italic text-emerald-800 font-medium text-sm">Ajay James</p>
                   <p className="text-[10px] text-gray-500 font-semibold">Assistant Director</p>
                </div>

                <button onClick={() => setSelectedPass(null)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors">
                    Close Pass
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export default MyGatePasses;
