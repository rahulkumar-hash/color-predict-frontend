import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldAlert, Wallet, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';

export default function WithdrawalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, sysConfig, updateBalance } = useAuthStore();
  const { submitWithdrawal, withdrawing } = useWalletStore();

  const [withdrawAmount, setWithdrawAmount] = useState(200);
  const [withdrawUpi, setWithdrawUpi] = useState('');

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!sysConfig.withdrawalsEnabled) {
      toast.error('Withdrawals are currently disabled by Admin');
      return;
    }
    if (withdrawAmount > (user?.balance || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    const toastId = toast.loading('Processing withdrawal request...');
    const res = await submitWithdrawal(Number(withdrawAmount), withdrawUpi.trim());

    if (res.success) {
      toast.success(res.message, { id: toastId });
      setWithdrawUpi('');
      onClose();
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
        className="glass-card max-w-md w-full mx-auto space-y-4 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase">
            <ArrowUpRight className="w-5 h-5" /> Request Cash Out
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance</span>
            <span className="text-xl font-black text-amber-400 font-mono">₹{user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
              sysConfig.withdrawalsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {sysConfig.withdrawalsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Withdrawal Amount (₹)</label>
            <input
              type="number"
              min="100"
              max={user?.balance || 0}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(Number(e.target.value))}
              required
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Target UPI ID / PhonePe VPA</label>
            <input
              type="text"
              placeholder="e.g. user@upi or mobile@ybl"
              value={withdrawUpi}
              onChange={e => setWithdrawUpi(e.target.value)}
              required
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-[11px] text-rose-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Withdrawals are reviewed and processed by Admin within 15 to 30 minutes during bank operational hours.</span>
          </div>

          <button
            type="submit"
            disabled={withdrawing || !sysConfig.withdrawalsEnabled}
            className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-500/20 btn-touch disabled:opacity-50"
          >
            {withdrawing ? 'Submitting Request...' : 'Confirm Cashout Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
