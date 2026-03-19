import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, ExclamationTriangleIcon, 
  InformationCircleIcon, XMarkIcon, XCircleIcon 
} from '@heroicons/react/24/outline';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: {
    icon: CheckCircleIcon,
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-200',
  },
  error: {
    icon: XCircleIcon,
    bg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-400',
    textColor: 'text-rose-200',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-200',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    iconColor: 'text-indigo-400',
    textColor: 'text-indigo-200',
  }
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 ${config.bg}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
                <p className={`text-sm font-medium flex-1 ${config.textColor}`}>{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-500 hover:text-white transition p-0.5 rounded hover:bg-white/10 shrink-0"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return toast;
};
