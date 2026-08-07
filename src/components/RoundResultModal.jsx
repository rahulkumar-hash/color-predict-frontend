import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, X, Sparkles } from 'lucide-react';

export default function RoundResultModal({ result, onClose }) {
  if (!result) return null;

  const { periodId, winningNumber, colors, winAmount, isWin } = result;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [result]);

  const getColorClass = (num) => {
    if (num === 0) return 'from-red-600 via-purple-600 to-violet-600 border-purple-400 text-white shadow-purple-500/30';
    if (num === 5) return 'from-emerald-500 via-teal-500 to-purple-600 border-emerald-400 text-white shadow-emerald-500/30';
    if ([1, 3, 7, 9].includes(num)) return 'from-emerald-500 to-teal-600 border-emerald-400 text-slate-950 shadow-emerald-500/30';
    return 'from-rose-500 to-red-600 border-rose-400 text-white shadow-rose-500/30';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-card max-w-sm w-full mx-auto p-6 relative text-center space-y-4 overflow-hidden border-2 border-emerald-500/40 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Badge */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Round Result Declared
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-mono font-bold block">Period ID</span>
            <h3 className="text-base font-black font-mono text-white">#{periodId}</h3>
          </div>

          {/* Large Winning Number Display */}
          <div className="py-2">
            <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr ${getColorClass(winningNumber)} flex flex-col items-center justify-center border-4 shadow-2xl transition-transform transform hover:scale-105`}>
              <span className="text-4xl font-black font-mono drop-shadow-md">{winningNumber}</span>
              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5 opacity-90">
                {colors?.join(' + ')}
              </span>
            </div>
          </div>

          {/* Win Status Banner */}
          {isWin && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-emerald-500/20 border border-emerald-500/50 p-3 rounded-2xl space-y-1 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-black text-sm">
                <Trophy className="w-4 h-4" /> CONGRATULATIONS!
              </div>
              <p className="text-xs text-amber-300 font-mono font-bold">
                You won +₹{winAmount?.toFixed(2)}
              </p>
            </motion.div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg btn-touch"
          >
            Continue Playing
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
