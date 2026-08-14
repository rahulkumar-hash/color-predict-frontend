import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight, Wallet, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';

export default function WithdrawalsPage() {
  const { user } = useAuthStore();
  const { withdrawalHistory, fetchWithdrawalHistory } = useWalletStore();
  const navigate = useNavigate();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [payoutPage, setPayoutPage] = useState(1);
  const pageSize = 8;

  const loadData = async () => {
    setLoading(true);
    await fetchWithdrawalHistory();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPages = Math.ceil(withdrawalHistory.length / pageSize) || 1;
  const currentPage = Math.min(payoutPage, totalPages);
  const paginatedPayouts = withdrawalHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center">
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      <main className="w-full max-w-7xl px-3 sm:px-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-4 w-full"
        >
          {/* Header Title & Breadcrumb */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-400 shrink-0" /> Payout & Withdrawal Records
              </h2>
              <p className="text-[11px] text-slate-400">Track submitted cashout requests, UPI/bank accounts, and approval status.</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-slate-400 hover:text-white font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl btn-touch"
            >
              ← Profile
            </button>
          </div>

          {/* Quick Balance & Action Card */}
          <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Withdrawable Balance</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  ₹{user?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 btn-touch flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" /> Request Cashout
              </button>
              <button
                onClick={loadData}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 border border-slate-700 btn-touch"
                title="Refresh Payouts"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Card List View (< sm) */}
          <div className="block sm:hidden space-y-2.5">
            {loading ? (
              <div className="glass-card p-8 text-center text-slate-400 font-bold animate-pulse">
                Loading payout records...
              </div>
            ) : withdrawalHistory.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500 font-bold space-y-3">
                <p>No payout requests recorded yet</p>
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create First Withdrawal
                </button>
              </div>
            ) : (
              paginatedPayouts.map((w) => (
                <div key={w._id} className="glass-card p-3.5 space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-base text-amber-400">
                      ₹{w.amount?.toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      w.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                      w.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {w.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-purple-300 font-mono flex items-center gap-1">
                    <span className="text-slate-500 font-sans">Payout To:</span> {w.upiId || w.bankDetails || 'Direct UPI'}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <span>ID: #{w._id?.slice(-6)?.toUpperCase()}</span>
                    <span>{new Date(w.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop & Tablet Table View (>= sm) */}
          <div className="hidden sm:block glass-card p-4 space-y-4 overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900">
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payout Account / UPI</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 font-bold animate-pulse">Loading payout records...</td>
                    </tr>
                  ) : withdrawalHistory.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500 font-bold">No payout history recorded yet</td>
                    </tr>
                  ) : (
                    paginatedPayouts.map((w) => (
                      <tr key={w._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-amber-400 text-sm">₹{w.amount?.toFixed(2)}</td>
                        <td className="py-3 px-4 font-mono text-purple-300">{w.upiId || w.bankDetails || 'Direct UPI'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            w.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                            w.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] text-right">{new Date(w.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setPayoutPage(p => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <WithdrawalModal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      <BottomNav onOpenDeposit={() => setShowDepositModal(true)} />
    </div>
  );
}
