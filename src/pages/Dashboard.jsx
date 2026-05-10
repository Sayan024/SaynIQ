import { useState, useEffect } from 'react';
import { Users, Bell, Zap, UserCheck, Download, Smartphone, Monitor } from 'lucide-react';
import StatCard from '../components/StatCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { fetchRealAnalytics } from '../services/expoNotifications';
import { useTheme } from '../context/ThemeContext';
import { downloadCSV } from '../utils/csvExport';

const Dashboard = () => {
  const { currentTheme, themes } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Get current theme primary color for charts
  const activeTheme = themes.find(t => t.id === currentTheme);
  const primaryColor = activeTheme?.color || '#6d28d9';

  useEffect(() => {
    const getStats = async () => {
      const data = await fetchRealAnalytics();
      setStats(data);
      setLoading(false);
    };
    getStats();
  }, []);

  const handleExport = () => {
    if (!stats?.allUsers) return;
    setIsExporting(true);
    
    // Prepare data for export
    const exportData = stats.allUsers.map(user => ({
      ID: user.id,
      Email: user.email || 'Anonymous',
      Device: user.deviceName || 'Unknown',
      OS: user.os || 'N/A',
      Version: user.appVersion || '1.0.0',
      Last_Active: user.lastActive?.toDate ? user.lastActive.toDate().toISOString() : 'N/A'
    }));

    setTimeout(() => {
      downloadCSV(exportData, `SaynIQ_Users_Report_${new Date().toLocaleDateString()}.csv`);
      setIsExporting(false);
    }, 800);
  };

  // Compute real chart data
  const chartData = stats?.allUsers ? (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return { 
        name: days[d.getDay()], 
        users: 0, 
        notifications: 0,
        fullDate: d.toLocaleDateString()
      };
    });

    stats.allUsers.forEach(u => {
      if (u.lastActive) {
        const lastActiveDate = u.lastActive.toDate ? u.lastActive.toDate() : new Date(u.lastActive);
        const dayMatch = last7Days.find(d => d.fullDate === lastActiveDate.toLocaleDateString());
        if (dayMatch) dayMatch.users++;
      }
    });

    // Today's notifications
    const today = last7Days[6];
    today.notifications = stats.totalNotifications || 0;

    return last7Days;
  })() : [
    { name: 'Mon', users: 0, notifications: 0 },
    { name: 'Tue', users: 0, notifications: 0 },
    { name: 'Wed', users: 0, notifications: 0 },
    { name: 'Thu', users: 0, notifications: 0 },
    { name: 'Fri', users: 0, notifications: 0 },
    { name: 'Sat', users: 0, notifications: 0 },
    { name: 'Sun', users: 0, notifications: 0 },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Zap className="animate-spin text-premium-purple" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm">Real-time metrics for SaynIQ platform.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full sm:w-auto bg-premium-purple hover:bg-premium-purple/90 px-6 py-3 sm:py-2 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm disabled:opacity-50 shadow-lg shadow-premium-purple/20 active:scale-95"
        >
          {isExporting ? <Zap className="animate-spin" size={18} /> : <Download size={18} />}
          <span>{isExporting ? 'Generating CSV...' : 'Export Analytics'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Registered Users" 
          value={stats?.totalUsers?.toLocaleString() || "0"} 
          icon={Users} 
          trend={stats?.totalUsers > 0 ? "Real-time" : "No users"} 
          color="purple" 
        />
        <StatCard 
          title="iOS Installations" 
          value={stats?.iosCount?.toLocaleString() || "0"} 
          icon={Smartphone} 
          trend={`${Math.round((stats?.iosCount / stats?.totalUsers) * 100) || 0}% share`}
          color="blue" 
        />
        <StatCard 
          title="Android Installations" 
          value={stats?.androidCount?.toLocaleString() || "0"} 
          icon={Smartphone} 
          trend={`${Math.round((stats?.androidCount / stats?.totalUsers) * 100) || 0}% share`}
          color="orange" 
        />
        <StatCard 
          title="Active Today" 
          value={stats?.activeToday?.toLocaleString() || "0"} 
          icon={UserCheck} 
          trend="Last 24h" 
          color="green" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="glass-card p-6 border-white/5">
          <h2 className="text-lg font-bold mb-6 text-white">System Growth</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1445" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: primaryColor }}
                />
                <Area type="monotone" dataKey="users" stroke={primaryColor} fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications Chart */}
        <div className="glass-card p-6 border-white/5">
          <h2 className="text-lg font-bold mb-6 text-white">Broadcast Volume</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1445" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="notifications" fill={primaryColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card p-6 overflow-hidden border-white/5">
        <h2 className="text-lg font-bold mb-6 text-white">Latest User Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b border-white/5 text-xs font-black uppercase tracking-widest">
                <th className="pb-4 px-2">Device Info</th>
                <th className="pb-4 px-2">Platform</th>
                <th className="pb-4 px-2">App Build</th>
                <th className="pb-4 px-2">Last Heartbeat</th>
                <th className="pb-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.users?.map((user, i) => (
                <tr key={i} className="hover:bg-premium-purple/5 transition-colors group">
                  <td className="py-4 px-2">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-premium-lightPurple transition-colors">
                           {user.os?.toLowerCase().includes('ios') ? <Smartphone size={16} /> : <Monitor size={16} />}
                        </div>
                        <span className="font-bold text-sm">{user.deviceName || "Unknown Device"}</span>
                     </div>
                  </td>
                  <td className="py-4 px-2 text-gray-400 text-sm font-medium">{user.os || "N/A"}</td>
                  <td className="py-4 px-2">
                     <span className="px-2 py-0.5 bg-premium-purple/10 text-premium-lightPurple rounded text-[10px] font-black uppercase">
                        v{user.appVersion || "1.0.0"}
                     </span>
                  </td>
                  <td className="py-4 px-2 text-gray-400 text-sm">{user.lastActive?.toDate?.().toLocaleTimeString() || "Just now"}</td>
                  <td className="py-4 px-2 text-right">
                    <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.users || stats.users.length === 0) && (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500 italic">No real user sessions detected in Firestore.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
