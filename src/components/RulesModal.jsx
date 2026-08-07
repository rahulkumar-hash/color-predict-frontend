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
        className="glass-card max-w-xl w-full mx-auto space-y-4 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <ShieldCheck className="w-5 h-5" /> Game Rules & Payout Guide
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p><strong>1. Round Cycle:</strong> Each round runs for 60 seconds (50s active betting + 10s countdown freeze).</p>
          
          <p><strong>2. Color Multipliers:</strong></p>
          <ul className="pl-4 space-y-1 list-disc">
            <li><span className="text-emerald-400 font-bold">Green (1, 3, 7, 9):</span> Pays 2X contract cost (1.5X on 5).</li>
            <li><span className="text-rose-400 font-bold">Red (2, 4, 6, 8):</span> Pays 2X contract cost (1.5X on 0).</li>
            <li><span className="text-purple-400 font-bold">Violet (0 or 5):</span> Pays 4.5X contract cost.</li>
          </ul>

          <p><strong>3. Direct Number Prediction (0-9):</strong></p>
          <p>Predicting the exact number 0 through 9 pays a massive <strong>9X Multiplier</strong>!</p>

          <p><strong>4. Provably Fair Security:</strong></p>
          <p>Every period outcome is generated via cryptographic server seed hashes before the betting phase begins.</p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl transition-all btn-touch"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
}
