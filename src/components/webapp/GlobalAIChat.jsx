import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebAuth } from '../../context/WebAuthContext';

const GlobalAIChat = () => {
  const { currentUser } = useWebAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: `Hello ${currentUser?.displayName?.split(' ')[0] || 'Initiate'}. Neural Link established. I am monitoring your workspace context. How can I augment your intelligence today?` }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [chatHistory, isOpen, isMinimized, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "I've analyzed your current workspace state. Your cognitive load seems balanced. I've archived your query into your secondary brain for later synthesis." 
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Cinematic FAB */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 lg:bottom-10 right-8 z-[90] w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 border ${
          isOpen 
          ? 'bg-white text-theme-textDark border-white shadow-premium' 
          : 'bg-[#0A0A0A] text-theme-accent border-theme-accent/20 shadow-premium'
        }`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} fill="currentColor" />}
        {!isOpen && (
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute -top-1 -right-1 w-5 h-5 bg-theme-accent rounded-full border-4 border-[#020202] flex items-center justify-center"
           >
              <Sparkles size={10} className="text-white" />
           </motion.div>
        )}
      </motion.button>

      {/* AI Intelligence Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              filter: 'blur(0px)',
              height: isMinimized ? '80px' : '600px'
            }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            className="fixed bottom-44 lg:bottom-28 right-8 z-[90] w-[420px] bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-premium overflow-hidden flex flex-col ai-border-glow"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-theme-accent shadow-pink-glow">
                  <Sparkles size={20} />
                </div>
                <div>
                   <h3 className="text-[14px] font-black text-white tracking-tight uppercase">SaynIQ Intelligence</h3>
                   <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
                      <p className="text-[9px] font-black text-theme-textSecondary uppercase tracking-widest">Neural Link Active</p>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-theme-textSecondary hover:text-white transition-colors bg-white/5 rounded-xl">
                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-2 text-theme-textSecondary hover:text-white transition-colors bg-white/5 rounded-xl">
                    <X size={16} />
                 </button>
              </div>
            </div>

            {/* Chat Intelligence Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                  {chatHistory.map((msg, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-white/5 text-white' : 'bg-theme-accent/10 text-theme-accent'
                      }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`max-w-[80%] p-4 rounded-3xl text-[13px] font-medium leading-relaxed shadow-premium ${
                        msg.role === 'user' 
                        ? 'bg-white text-theme-textDark rounded-tr-none' 
                        : 'bg-white/[0.03] border border-white/5 text-white rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                         <Bot size={16} />
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1">
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-theme-accent rounded-full" />
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-theme-accent rounded-full" />
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-theme-accent rounded-full" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Cognitive Input */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5">
                  <form onSubmit={handleSendMessage} className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-theme-textSecondary group-focus-within:text-theme-accent transition-colors">
                       <Sparkles size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask your second brain... (Cmd + J)"
                      className="w-full bg-[#020202] border border-white/5 rounded-[1.5rem] py-4 pl-12 pr-14 text-[13px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-theme-accent/50 focus:ring-4 focus:ring-theme-accent/5 transition-all"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-theme-accent text-white flex items-center justify-center shadow-pink-glow hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center mt-4">
                    Context Aware Intelligence Engine v1.5
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalAIChat;
