import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Smartphone, Monitor, Shield, Calendar, Mail, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastActive', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsersList(data);
        setTotalCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.deviceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-400">Direct interface to SaynIQ's registered user base.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by email or device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-premium-purple transition-all w-full md:w-72"
            />
          </div>
          <button 
            onClick={() => setUsersList([...usersList].reverse())}
            className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-gray-400 hover:text-white hover:border-premium-purple/50 transition-all active:scale-95 group sm:w-auto w-full flex justify-center"
            title="Reverse Sort"
          >
            <Filter size={20} className="group-hover:rotate-180 transition-transform" />
          </button>
        </div>
      </div>

      <div className="glass-card border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-premium-purple" size={40} />
            <p className="text-gray-500 font-medium">Synchronizing with Firestore...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">User Identity</th>
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Device Metadata</th>
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Version</th>
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Heartbeat</th>
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-premium-purple/5 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-premium-purple/10 flex items-center justify-center text-premium-lightPurple font-black text-lg border border-premium-purple/10">
                          {user.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{user.email || 'Anonymous'}</p>
                          <p className="text-[9px] text-gray-500 uppercase tracking-tighter font-black mt-0.5">UID: {user.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/40 rounded-xl text-gray-500 group-hover:text-premium-lightPurple transition-colors">
                          {user.os?.toLowerCase().includes('ios') ? <Smartphone size={16} /> : <Monitor size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-200">{user.deviceName || 'Unknown Device'}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{user.os || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-premium-purple/10 border border-premium-purple/20 text-premium-lightPurple px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                        v{user.appVersion || '1.0.0'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-600" />
                        {user.lastActive?.toDate?.().toLocaleString() || 'Recently'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Online</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-gray-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl active:scale-90">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-500 italic text-sm font-medium">
                      No matching records found in the user ecosystem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="bg-black/40 px-6 py-5 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Registry: {totalCount} nodes found</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-500 disabled:opacity-30 cursor-not-allowed" disabled>Previous</button>
            <button 
              onClick={() => alert('No additional user segments available in current Firestore snapshot.')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-premium-lightPurple hover:bg-premium-purple/10 hover:border-premium-purple transition-all active:scale-95"
            >
              Next Cluster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
