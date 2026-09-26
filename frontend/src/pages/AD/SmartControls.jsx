import React, { useState, useEffect } from 'react';
import { Power, ThermometerSnowflake, Activity, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SmartControls = () => {
  const { showToast } = useToast();
  // Simulating the 14 AC Rooms
  const initialRooms = Array.from({ length: 14 }, (_, i) => ({
    id: `AC-${101 + i}`,
    room_number: 101 + i,
    status: i % 3 === 0 ? 'ON' : 'OFF',
    temperature: i % 3 === 0 ? 22 : null,
    uptime: i % 3 === 0 ? '4h 12m' : '0m',
    power_draw: i % 3 === 0 ? '2.4 kW' : '0 kW'
  }));

  const [acUnits, setAcUnits] = useState(initialRooms);
  const [processing, setProcessing] = useState(null);
  const [masterProcessing, setMasterProcessing] = useState(false);

  const toggleAC = (id, currentStatus) => {
    setProcessing(id);
    // Simulate API delay for IoT Relay firing
    setTimeout(() => {
      setAcUnits(prev => prev.map(ac => {
        if (ac.id === id) {
          const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON';
          return {
            ...ac,
            status: newStatus,
            temperature: newStatus === 'ON' ? 24 : null,
            power_draw: newStatus === 'ON' ? '2.5 kW' : '0 kW',
            uptime: newStatus === 'ON' ? '1m' : '0m'
          };
        }
        return ac;
      }));
      setProcessing(null);
      showToast(`Command successful: ${id} turned ${currentStatus === 'ON' ? 'OFF' : 'ON'}`, 'success');
    }, 800);
  };

  const emergencyShutoff = () => {
    setMasterProcessing(true);
    setTimeout(() => {
      setAcUnits(prev => prev.map(ac => ({
        ...ac,
        status: 'OFF',
        temperature: null,
        power_draw: '0 kW',
        uptime: '0m'
      })));
      setMasterProcessing(false);
      showToast('MASTER OVERRIDE: All AC units successfully shut down to conserve power.', 'success');
    }, 1500);
  };

  const activeCount = acUnits.filter(a => a.status === 'ON').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight flex items-center gap-2">
             <ThermometerSnowflake className="w-7 h-7 text-blue-500" /> Smart IoT Controls
          </h2>
          <p className="text-gray-500 text-xs mt-1">Wirelessly monitor and control centralized AC relays to prevent power wastage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50/50">
           <h3 className="text-amber-600 font-extrabold text-sm uppercase flex items-center gap-2"><Zap className="w-4 h-4"/> Live Power Draw</h3>
           <p className="text-3xl font-black text-gray-800 mt-2">{(activeCount * 2.4).toFixed(1)} <span className="text-sm text-gray-400 uppercase">kW/h</span></p>
        </div>
        
        <div className="premium-card p-6 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 transform transition hover:scale-[1.02]">
           <h3 className="text-blue-600 font-extrabold text-sm uppercase flex items-center gap-2"><Activity className="w-4 h-4"/> Active AC Units</h3>
           <div className="flex items-end gap-2 mt-2">
              <p className="text-3xl font-black text-gray-800 leading-none">{activeCount}</p>
              <p className="text-sm font-bold text-gray-400 uppercase leading-none pb-0.5">/ 14 Rooms</p>
           </div>
        </div>

        <div className="premium-card p-6 bg-gray-900 border border-gray-800 text-white flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-black transition-colors" onClick={emergencyShutoff}>
            {masterProcessing ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="font-bold text-red-500 tracking-widest uppercase text-sm">Force Tripping Relays...</span>
                </div>
            ) : (
                <>
                   <AlertTriangle className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                   <h3 className="font-extrabold text-white">MASTER SHUTOFF</h3>
                   <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Kill Power to All ACs</p>
                </>
            )}
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/20">
          <h3 className="font-bold flex items-center gap-2 text-sm text-gray-700">
             <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> Relay Dashboards
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:gap-px bg-gray-100">
           {acUnits.map(unit => (
              <div key={unit.id} className="bg-white p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                      <div>
                          <p className="font-black text-xl text-gray-800">RM {unit.room_number}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">{unit.id}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest flex items-center gap-1 ${unit.status === 'ON' ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-gray-100 text-gray-400'}`}>
                          {unit.status === 'ON' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>}
                          {unit.status}
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                      <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500">Temp: <span className="text-gray-800">{unit.temperature ? `${unit.temperature}°C` : '--'}</span></p>
                          <p className="text-xs font-bold text-gray-500">Draw: <span className="text-gray-800">{unit.power_draw}</span></p>
                      </div>
                      
                      <button 
                         onClick={() => toggleAC(unit.id, unit.status)}
                         disabled={processing === unit.id || masterProcessing}
                         className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                            processing === unit.id 
                            ? 'bg-gray-200 text-gray-400'
                            : unit.status === 'ON' 
                               ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100' 
                               : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-100'
                         }`}
                      >
                         {processing === unit.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                            <Power className="w-5 h-5" />
                         )}
                      </button>
                  </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};
export default SmartControls;
