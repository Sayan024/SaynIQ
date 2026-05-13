import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const UniversalModal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-theme-card border border-theme-border p-6 rounded-2xl shadow-sleek overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-bold text-theme-textPrimary tracking-tight">{title}</h2>
              <button onClick={onClose} className="p-1.5 text-theme-textSecondary hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UniversalModal;
