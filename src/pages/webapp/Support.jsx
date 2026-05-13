import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Paperclip, 
  X, 
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from '../../services/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useWebAuth } from '../../context/WebAuthContext';

const Support = () => {
  const { currentUser, loading: authLoading, openAuthModal } = useWebAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    description: '',
    attachment: null
  });
  
  // Reply State
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, 'support_tickets'), 
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(q, 
      (snap) => {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setTickets(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }
    
    setIsUploading(true);
    try {
      let attachmentUrl = null;
      if (formData.attachment) {
        const storageRef = ref(storage, `support/${currentUser.uid}/${Date.now()}_${formData.attachment.name}`);
        const snapshot = await uploadBytes(storageRef, formData.attachment);
        attachmentUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'support_tickets'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userEmail: currentUser.email,
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
        attachmentUrl,
        status: 'Open',
        priority: 'Medium',
        messages: [{
          sender: 'user',
          text: formData.description,
          timestamp: new Date()
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setIsModalOpen(false);
      setFormData({ subject: '', category: 'General', description: '', attachment: null });
      alert("Intelligence Request Logged. Our team will review your ticket shortly.");
    } catch (error) {
      console.error("Critical error in support submission:", error);
      alert(`Submission Failure: ${error.message || 'Unknown error'}. Please check your connection or console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      const newMessage = {
        sender: 'user',
        text: reply,
        timestamp: new Date()
      };

      await updateDoc(ticketRef, {
        messages: [...selectedTicket.messages, newMessage],
        status: 'Open', // Re-open if closed or mark as open for admin
        updatedAt: serverTimestamp()
      });

      setReply('');
    } catch (error) {
      console.error("Error sending reply:", error);
    }
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

  if (authLoading || loading) return <div className="h-full flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-theme-accent" size={32} /></div>;

  if (error) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center">
      <AlertCircle size={48} className="text-theme-danger mb-4" />
      <h2 className="text-xl font-bold mb-2">Sync Error</h2>
      <p className="text-theme-textSecondary mb-6 max-w-md">{error}</p>
      {error.includes('index') && (
        <p className="text-xs text-theme-accent font-bold uppercase tracking-widest bg-theme-accent/5 p-4 rounded-xl">
          Check your browser console for a Firebase link to generate the required index.
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Support Center</h1>
          <p className="text-theme-textSecondary font-medium mt-1">Get help from the SaynIQ intelligence team.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 rounded-2xl bg-white text-theme-textDark font-black hover:bg-theme-accent hover:text-white transition-all shadow-premium flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket List */}
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-16rem)] overflow-y-auto no-scrollbar pr-2">
          {tickets.length === 0 ? (
            <div className="glass-card p-10 text-center border-dashed">
              <MessageCircle size={40} className="mx-auto mb-4 text-theme-textSecondary/30" />
              <p className="text-sm font-bold text-theme-textSecondary">No tickets found</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <motion.div 
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
                  <span className="text-[10px] font-bold text-white/20">
                    {ticket.updatedAt?.toDate ? ticket.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{ticket.subject}</h3>
                <p className="text-[11px] text-theme-textSecondary font-medium">{ticket.category}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Ticket Detail / Conversation */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-16rem)]">
          {selectedTicket ? (
            <div className="glass-card flex-1 flex flex-col overflow-hidden">
              {/* Ticket Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-theme-accent uppercase tracking-widest">{selectedTicket.category}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] font-bold text-theme-textSecondary uppercase tracking-widest">ID: {selectedTicket.id.slice(0, 8)}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-theme-accent/10 border border-theme-accent/20 text-white rounded-tr-none' 
                        : 'bg-white/[0.03] border border-white/10 text-theme-textSecondary rounded-tl-none'
                    }`}>
                      <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                      <div className="mt-2 text-[9px] font-bold opacity-30 text-right uppercase tracking-widest">
                        {new Date(msg.timestamp?.seconds * 1000 || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' ? (
                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                  <div className="relative flex items-center gap-4">
                    <input 
                      type="text" 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                      className="flex-1 bg-[#0b041a] border border-white/5 rounded-xl py-3 px-5 text-sm font-medium focus:outline-none focus:border-theme-accent transition-all"
                      placeholder="Type your response..."
                    />
                    <button 
                      onClick={handleSendReply}
                      className="w-12 h-12 bg-white text-theme-textDark rounded-xl flex items-center justify-center hover:bg-theme-accent hover:text-white transition-all shadow-premium shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-t border-white/5 bg-white/[0.01] text-center">
                   <p className="text-[11px] font-black text-theme-success uppercase tracking-widest py-2">
                     This intelligence request has been resolved. The communication channel is now archival.
                   </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card flex-1 flex flex-col items-center justify-center text-center p-20 border-dashed">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-theme-textSecondary/30 mb-6">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No Ticket Selected</h3>
              <p className="text-sm text-theme-textSecondary font-medium max-w-xs">Select a ticket from the left to view the conversation or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => !isUploading && setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-xl p-10 relative z-10 border-theme-accent/20"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black tracking-tight uppercase">New Support Ticket</h2>
                <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-theme-textSecondary hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all text-sm font-bold appearance-none"
                    >
                      <option value="General">General Inquiry</option>
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Feature">Feature Request</option>
                      <option value="Bug">Bug Report</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-theme-accent transition-all font-bold"
                      placeholder="Summary of issue"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0b041a] border border-white/5 rounded-xl py-4 px-4 focus:outline-none focus:border-theme-accent transition-all text-sm h-32 resize-none"
                    placeholder="Provide as much detail as possible..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-theme-textSecondary uppercase tracking-widest ml-1">Attachments (Optional)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })}
                      className="hidden" 
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="w-full bg-white/[0.03] border border-dashed border-white/10 rounded-xl py-6 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.05] hover:border-theme-accent/30 transition-all"
                    >
                      <Paperclip size={20} className="text-theme-textSecondary" />
                      <span className="text-[13px] font-bold text-theme-textSecondary">
                        {formData.attachment ? formData.attachment.name : 'Click to upload screenshot/file'}
                      </span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-white text-theme-textDark py-4 rounded-2xl font-black text-lg transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-theme-accent hover:text-white"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  Submit Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Support;
