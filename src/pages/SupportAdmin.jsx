import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Mail, 
  Send,
  Loader2,
  ChevronDown,
  Download,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const SupportAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setTickets(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePriority = async (ticketId, newPriority) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        priority: newPriority,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      const newMessage = {
        sender: 'admin',
        text: reply,
        timestamp: new Date()
      };

      await updateDoc(ticketRef, {
        messages: [...selectedTicket.messages, newMessage],
        status: 'In Progress',
        updatedAt: serverTimestamp()
      });

      setReply('');
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteDoc(doc(db, 'support_tickets', id));
      setSelectedTicketId(null);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                         t.userName.toLowerCase().includes(search.toLowerCase()) ||
                         t.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-theme-accent/10 text-theme-accent border-theme-accent/20';
      case 'In Progress': return 'bg-theme-highlight/10 text-theme-highlight border-theme-highlight/20';
      case 'Resolved': return 'bg-theme-success/10 text-theme-success border-theme-success/20';
      case 'Closed': return 'bg-white/5 text-theme-textSecondary border-white/10';
      default: return 'bg-white/5 text-white border-white/10';
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-theme-accent" size={48} /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Support Management</h1>
          <p className="text-theme-textSecondary font-medium">Manage and resolve user support requests.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-all">
             <Download size={20} />
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: stats.total, icon: MessageCircle, color: 'text-white' },
          { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-theme-accent' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-theme-highlight' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-theme-success' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 border-white/5">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                 <stat.icon size={20} />
               </div>
            </div>
            <p className="text-2xl font-black text-white tabular-nums">{stat.value}</p>
            <p className="text-[11px] font-black text-theme-textSecondary uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-22rem)]">
        {/* Left: Ticket List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-textSecondary" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-theme-accent transition-all"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0b041a] border border-white/5 rounded-xl px-4 text-[11px] font-black uppercase tracking-widest appearance-none outline-none focus:border-theme-accent transition-all"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">Active</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`glass-card p-5 cursor-pointer border-l-4 transition-all ${
                  selectedTicketId === ticket.id ? 'border-l-theme-accent bg-white/[0.04]' : 'border-l-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.priority === 'High' ? 'bg-theme-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                    ticket.priority === 'Medium' ? 'bg-theme-warning' : 'bg-theme-success'
                  }`} />
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{ticket.subject}</h3>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-theme-accent/20 flex items-center justify-center text-[10px] font-black text-theme-accent">
                      {ticket.userName[0]}
                    </div>
                    <span className="text-[10px] font-bold text-theme-textSecondary">{ticket.userName}</span>
                  </div>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    {ticket.updatedAt?.toDate ? ticket.updatedAt.toDate().toLocaleDateString() : 'Now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Conversation & Details */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {selectedTicket ? (
            <div className="glass-card flex-1 flex flex-col overflow-hidden">
              {/* Detail Header */}
              <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <User size={14} className="text-theme-textSecondary" />
                        <span className="text-xs font-bold">{selectedTicket.userName}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <Mail size={14} className="text-theme-textSecondary" />
                        <span className="text-xs font-bold text-theme-textSecondary">{selectedTicket.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[10px] font-black text-theme-textSecondary uppercase tracking-widest">Priority</span>
                        <select 
                          value={selectedTicket.priority}
                          onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                          className="bg-transparent outline-none text-xs font-black uppercase text-white"
                        >
                          <option value="High" className="bg-theme-card">High</option>
                          <option value="Medium" className="bg-theme-card">Medium</option>
                          <option value="Low" className="bg-theme-card">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <select 
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer outline-none ${getStatusStyle(selectedTicket.status)}`}
                    >
                      <option value="Open" className="bg-theme-card">Open</option>
                      <option value="In Progress" className="bg-theme-card">In Progress</option>
                      <option value="Resolved" className="bg-theme-card">Resolved</option>
                      <option value="Closed" className="bg-theme-card">Closed</option>
                    </select>
                    <button onClick={() => handleDeleteTicket(selectedTicket.id)} className="text-theme-textSecondary hover:text-theme-danger transition-colors p-2 rounded-lg hover:bg-theme-danger/10">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {selectedTicket.attachmentUrl && (
                  <a 
                    href={selectedTicket.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-theme-accent text-[11px] font-black uppercase tracking-widest hover:bg-theme-accent/20 transition-all"
                  >
                    <Download size={14} />
                    View Attachment
                  </a>
                )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-black/20">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                       <span className="text-[9px] font-black text-theme-textSecondary uppercase tracking-[0.2em] mb-2 px-2">
                         {msg.sender === 'admin' ? 'SYSTEM ARCHITECT' : selectedTicket.userName}
                       </span>
                       <div className={`p-5 rounded-3xl ${
                        msg.sender === 'admin' 
                          ? 'bg-theme-highlight/10 border border-theme-highlight/20 text-white rounded-tr-none' 
                          : 'bg-white/[0.03] border border-white/10 text-theme-textSecondary rounded-tl-none shadow-premium'
                      }`}>
                        <p className="text-[14px] font-medium leading-relaxed">{msg.text}</p>
                        <div className="mt-3 text-[9px] font-bold opacity-30 text-right uppercase tracking-[0.2em]">
                          {new Date(msg.timestamp?.seconds * 1000 || msg.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                 <div className="relative flex items-center gap-4">
                    <input 
                      type="text" 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      className="flex-1 bg-[#0b041a] border border-white/5 rounded-2xl py-4 px-6 text-[14px] font-medium focus:outline-none focus:border-theme-highlight transition-all shadow-sleek"
                      placeholder="Type your official response..."
                    />
                    <button 
                      onClick={handleSendReply}
                      className="w-14 h-14 bg-theme-highlight text-white rounded-2xl flex items-center justify-center hover:bg-theme-highlight/90 transition-all shadow-premium shrink-0 group"
                    >
                      <Send size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="glass-card flex-1 flex flex-col items-center justify-center text-center p-20 border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center text-theme-textSecondary/20 mb-8">
                <MessageCircle size={40} />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-3 uppercase">Command Protocol Required</h3>
              <p className="text-sm text-theme-textSecondary font-medium max-w-sm leading-relaxed">Select an active intelligence request from the registry to begin diagnostics and resolution.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportAdmin;
