import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-52 md:bottom-28 right-4 md:right-8 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#11100E] text-[#F5F1EB] p-4 border border-[#2C2925] shadow-2xl flex items-start gap-3 animate-fade-up"
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info size={18} className="text-[#A99684] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          )}

          <p className="text-xs font-sans tracking-wider leading-relaxed flex-1">
            {toast.message}
          </p>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#A99684] hover:text-white p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
