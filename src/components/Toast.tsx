import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-auto pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
  };

  const bgStyles = {
    success: 'bg-white/95 dark:bg-slate-900/95 border-emerald-300 dark:border-emerald-500/40 text-slate-800 dark:text-emerald-200 shadow-lg',
    error: 'bg-white/95 dark:bg-slate-900/95 border-rose-300 dark:border-rose-500/40 text-slate-800 dark:text-rose-200 shadow-lg',
    warning: 'bg-white/95 dark:bg-slate-900/95 border-amber-300 dark:border-amber-500/40 text-slate-800 dark:text-amber-200 shadow-lg',
    info: 'bg-white/95 dark:bg-slate-900/95 border-cyan-300 dark:border-cyan-500/40 text-slate-800 dark:text-cyan-200 shadow-lg'
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 text-xs ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && <span className="font-bold block text-slate-900 dark:text-white leading-tight mb-0.5">{toast.title}: </span>}
        <span className="text-slate-700 dark:text-slate-300 leading-snug">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-black dark:hover:text-white p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
