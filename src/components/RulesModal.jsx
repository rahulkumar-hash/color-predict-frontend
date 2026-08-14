import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="glass-card max-w-md w-full mx-auto max-h-[85vh] flex flex-col relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5" /> Game Rules & Payout Guide
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3.5 text-xs text-slate-300 leading-relaxed pt-3 pr-0.5">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block font-bold">1. Round Cycle & Timing:</strong>
            <p className="text-slate-400 text-[11px]">Each round runs for 60 seconds (50s active betting phase + 10s countdown lock & calculation freeze).</p>
          </div>
          
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-white block font-bold">2. Color Prediction Multipliers:</strong>
            <ul className="space-y-1.5 pl-2 text-[11px]">
              <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" /><span className="text-emerald-400 font-bold">Green (1, 3, 7, 9):</span> Pays 2X contract cost (1.5X if 5 appears).</li>
              <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" /><span className="text-rose-400 font-bold">Red (2, 4, 6, 8):</span> Pays 2X contract cost (1.5X if 0 appears).</li>
              <li className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" /><span className="text-purple-400 font-bold">Violet (0 or 5):</span> Pays 4.5X contract cost.</li>
            </ul>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-amber-400 block font-bold">3. Direct Number Prediction (0-9):</strong>
            <p className="text-slate-300 text-[11px]">Predicting the exact single digit 0 through 9 pays a massive <strong className="text-amber-400">9X Multiplier</strong> payout!</p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block font-bold">4. Provably Fair Verification:</strong>
            <p className="text-slate-400 text-[11px]">Every period outcome is generated via cryptographic SHA-256 server seed hashes before the betting phase begins.</p>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md btn-touch"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
}
