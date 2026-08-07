import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';

export default function BetModal({ isOpen, betInfo, onClose, onSuccess }) {
  if (!isOpen || !betInfo) return null;

  const selection = betInfo.selection;

  const { user } = useAuthStore();
  const { placeBet } = useGameStore();

  const [contractMoney, setContractMoney] = useState(10);
  const [multiplier, setMultiplier] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = contractMoney * multiplier;

  const getSelectionTitle = () => {
    if (typeof selection === 'number') return `Predict Number ${selection}`;
    return `Predict ${selection}`;
  };

  const getSelectionBadge = () => {
    if (typeof selection === 'number') {
      let bg = 'bg-slate-700';
      if (selection === 0 || selection === 5) bg = 'bg-gradient-to-tr from-rose-500 to-purple-600';
      else if (selection % 2 === 0) bg = 'bg-rose-500';
      else bg = 'bg-emerald-500';
      return <span className={`px-3 py-1 rounded-full text-white font-mono font-black text-sm shadow-md ${bg}`}>#{selection}</span>;
    }

    if (selection === 'Green') return <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">Green (2X)</span>;
    if (selection === 'Red') return <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md">Red (2X)</span>;
    if (selection === 'Violet') return <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-md">Violet (4.5X)</span>;

    return null;
  };

  const handleConfirmBet = async (e) => {
    e.preventDefault();
    if (totalAmount > (user?.balance || 0)) {
      toast.error('Insufficient wallet balance! Please recharge.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting contract bet to server...');

    const res = await placeBet({
      selection,
      amount: contractMoney,
      multiplier
    });

    setSubmitting(false);

    if (res.success) {
      toast.success(res.message, { id: toastId });
      onSuccess();
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card max-w-xl w-full mx-auto space-y-4 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {getSelectionBadge()}
            <span className="text-xs font-black text-white">{getSelectionTitle()}</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Money Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Contract Money Unit (₹)</label>
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 1000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setContractMoney(amt)}
                className={`py-2 rounded-xl text-xs font-mono font-black border transition-all btn-touch ${
                  contractMoney === amt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Contract Multiplier</label>
          <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMultiplier(m => Math.max(1, m - 1))}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-lg btn-touch flex items-center justify-center"
            >
              -
            </button>
            <span className="font-mono font-black text-base text-emerald-400">{multiplier}X</span>
            <button
              type="button"
              onClick={() => setMultiplier(m => m + 1)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-lg btn-touch flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Multiplier Presets */}
        <div className="flex gap-2">
          {[1, 5, 10, 20, 50].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMultiplier(m)}
              className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                multiplier === m ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {m}X
            </button>
          ))}
        </div>

        {/* Total Cost Summary */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">Total Bet Amount:</span>
          <span className="text-amber-400 font-mono font-black text-sm">₹{totalAmount}</span>
        </div>

        <button
          onClick={handleConfirmBet}
          disabled={submitting || totalAmount > (user?.balance || 0)}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" /> {submitting ? 'Confirming Bet...' : `Confirm Bet ₹${totalAmount}`}
        </button>
      </motion.div>
    </div>
  );
}
