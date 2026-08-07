import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const confirmBtnStyles = {
    warning: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
    info: 'bg-purple-600 hover:bg-purple-500 text-white'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-card w-full max-w-xs p-4 space-y-4 relative shadow-2xl"
        >
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 bg-purple-500/20 border-purple-500/30 text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-white truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{message}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl btn-touch"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 font-black text-xs rounded-xl shadow-lg btn-touch ${confirmBtnStyles[variant] || confirmBtnStyles.info}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
