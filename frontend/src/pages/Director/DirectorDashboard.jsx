import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Users, UserCheck, AlertTriangle, ClipboardList, ShieldAlert, ChevronRight, Home, HelpCircle, CheckCircle2, Wrench } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DirectorDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await API.get('/dashboard/summary');
      setStats(statsRes.data);

      const analyticsRes = await API.get('/analytics');
      setAnalytics(analyticsRes.data);

      const alertsRes = await API.get('/alerts');
      // Take top 5 recent alerts
      setAlerts(alertsRes.data.slice(0, 5));
    } catch (e) {
      showToast('Error loading Director analytics dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chart 1: Attendance Trends (Line Chart)
  const lineChartData = {
    labels: analytics?.trends.map((t) => t.label) || [],
    datasets: [
      {
        label: 'Roll Call Attendance ',
        data: analytics?.trends.map((t) => t.percentage) || [],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#1E3A8A',
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}`
        }
      }
    }
  };

  // Chart 2: Student Status (Doughnut Chart)
  const doughnutChartData = {
    labels: ['Active', 'On Leave', 'Suspended'],
    datasets: [
      {
        data: [
          analytics?.student_status?.active || 0,
          analytics?.student_status?.leave || 0,
          analytics?.student_status?.suspended || 0
        ],
        backgroundColor: ['#22C55E', '#2563EB', '#EF4444'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
            family: 'Outfit'
          }
        }
      }
    },
    cutout: '65'
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="font-extrabold text-2xl text-gray-800 tracking-tight">Director Dashboard</h2>
        <p className="text-gray-500 text-xs mt-1">Hostel performance metrics, attendance trends, and compliance tracking</p>
      </div>

      {/* Stats summary cards */}
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
      </div>

      {/* Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend line chart */}
        <div className="premium-card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Roll Call Attendance trends (Last 7 Days)
          </h3>
          <div className="h-72">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Right: Doughnut chart */}
        <div className="premium-card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Student Status Distribution
          </h3>
          <div className="h-72 relative flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Alerts and Defaulters lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Alerts feed */}
        <div className="premium-card p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-danger" /> Continuous Absence Alerts
            </h3>
            <span className="px-2 py-0.5 bg-rose-50 text-danger rounded text-[9px] font-extrabold uppercase animate-pulse">
              Director Monitor
            </span>
          </div>

          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-12">No high-risk attendance alerts currently triggered.</p>
            ) : (
              alerts.map((a) => (
                <div key={a._id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${a.level === 'High Risk' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {a.title}
                    </h4>
                    <p className="text-gray-500 text-[11px] mt-1 leading-normal">{a.message}</p>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-1.5">
                      {new Date(a.timestamp).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <Link
                    to={`/students/${a.student_id}`}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-primary rounded-lg text-[10px] font-bold transition-all uppercase shrink-0 border border-gray-100/50"
                  >
                    View profile
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Quick actions menu */}
        <div className="premium-card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-3">
            Operation Actions
          </h3>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/defaulters"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5" /> Defaulters Risk lists
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-3.5 bg-blue-50/20 hover:bg-blue-50 border border-blue-100/40 hover:border-primary/20 text-primary font-bold rounded-xl text-xs transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5" /> Download Report PDF/Excel
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
