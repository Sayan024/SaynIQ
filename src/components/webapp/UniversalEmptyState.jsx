import React from 'react';

const UniversalEmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 animate-fade-in-up">
      <div className="w-16 h-16 bg-theme-accent/5 border border-dashed border-theme-accent/30 text-theme-accent rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h2 className="text-[18px] font-bold mb-2 text-theme-textPrimary tracking-tight">{title}</h2>
      <p className="text-[14px] text-theme-textSecondary max-w-xs mb-8 leading-relaxed font-medium">{description}</p>
      {actionText && (
        <button 
          onClick={onAction}
          className="bg-theme-accent hover:bg-white text-white hover:text-theme-textDark px-8 py-2.5 rounded-xl text-sm font-bold shadow-sleek transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default UniversalEmptyState;
