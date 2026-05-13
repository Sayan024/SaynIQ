import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useWebAuth } from '../../context/WebAuthContext';

const AIChat = () => {
  const { currentUser } = useWebAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: `Hello! I'm your SaynIQ AI assistant. How can I help you be more productive today?` }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm currently in demo mode. In the full version, I'll be able to analyze your notes, summarize links, and help you manage your tasks!" }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex flex-col items-center justify-center mb-8 shrink-0">
        <div className="w-12 h-12 bg-theme-accent/10 border border-theme-accent/20 text-theme-accent rounded-xl flex items-center justify-center mb-3 shadow-sleek">
          <Bot size={22} />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-theme-textPrimary">SaynIQ AI</h1>
        <p className="text-theme-textSecondary text-[13px] font-medium mt-1">Intelligent workspace assistant</p>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                ? 'bg-theme-cardSecondary border-theme-border text-theme-textSecondary' 
                : 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent shadow-sleek'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-theme-primary text-theme-textDark rounded-tr-sm font-medium' 
                : 'bg-theme-cardSecondary border border-theme-border text-theme-textPrimary rounded-tl-sm'
              }`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-theme-border bg-theme-card/50 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="relative group">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-theme-background border border-theme-border rounded-xl py-3 pl-4 pr-12 text-[13px] font-medium text-theme-textPrimary placeholder:text-theme-textSecondary/40 focus:outline-none focus:border-theme-accent/50 focus:bg-white/[0.02] transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-theme-primary hover:bg-white text-theme-textDark flex items-center justify-center transition-all shadow-sleek active:scale-90"
            >
              <Send size={14} />
            </button>
          </form>
          <div className="mt-3 flex justify-center gap-4">
             <div className="flex items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity cursor-default">
                <Sparkles size={10} className="text-theme-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-theme-textSecondary">Gemini Pro 1.5</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
