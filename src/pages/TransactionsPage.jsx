import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Receipt, RefreshCw, ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { transactions, transactionsLoading, fetchTransactions } = useWalletStore();
  const navigate = useNavigate();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [txnPage, setTxnPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const currentPage = Math.min(txnPage, totalPages);
  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                <Receipt className="w-5 h-5 text-emerald-400 shrink-0" /> Wallet Transaction Ledger
              </h2>
              <p className="text-[11px] text-slate-400">Opening balance, credit/debit records, and closing balance statement.</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-slate-400 hover:text-white font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl btn-touch"
            >
              ← Profile
            </button>
          </div>

          {/* Quick Balance & Refresh Card */}
          <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Current Wallet Balance</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  ₹{user?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md btn-touch flex items-center gap-1"
              >
                <ArrowDownRight className="w-4 h-4" /> Deposit
              </button>
              <button
                onClick={fetchTransactions}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 border border-slate-700 btn-touch"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-4 h-4 ${transactionsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Card List View (< sm) */}
          <div className="block sm:hidden space-y-2.5">
            {transactionsLoading ? (
              <div className="glass-card p-8 text-center text-slate-400 font-bold animate-pulse">
                Loading transaction ledger...
              </div>
            ) : transactions.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500 font-bold">
                No transaction records found
              </div>
            ) : (
              paginatedTransactions.map((t) => {
                const isCredit = t.amount >= 0;
                return (
                  <div key={t._id} className="glass-card p-3.5 space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        t.type === 'RECHARGE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                        t.type === 'BET_WIN' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                        t.type === 'WITHDRAWAL_REFUND' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                        t.type === 'BET_PLACED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {t.type}
                      </span>
                      <span className={`font-mono font-black text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? `+₹${t.amount?.toFixed(2)}` : `-₹${Math.abs(t.amount)?.toFixed(2)}`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-mono">{t.description || 'Transaction'}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <span>Open: ₹{t.openingBalance?.toFixed(2)} → Close: ₹{t.closingBalance?.toFixed(2)}</span>
                      <span>{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop & Tablet Table View (>= sm) */}
          <div className="hidden sm:block glass-card p-4 space-y-4 overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900">
                    <th className="py-3 px-4">Type & Details</th>
                    <th className="py-3 px-4">Opening</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Closing</th>
                    <th className="py-3 px-4 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold animate-pulse">Loading transaction ledger...</td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">No transaction records found</td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((t) => {
                      const isCredit = t.amount >= 0;
                      return (
                        <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                              t.type === 'RECHARGE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                              t.type === 'BET_WIN' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                              t.type === 'WITHDRAWAL_REFUND' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                              t.type === 'BET_PLACED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                              'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            }`}>
                              {t.type}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">{t.description}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">₹{t.openingBalance?.toFixed(2)}</td>
                          <td className={`py-3 px-4 font-mono font-black text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? `+₹${t.amount?.toFixed(2)}` : `-₹${Math.abs(t.amount)?.toFixed(2)}`}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-amber-400">₹{t.closingBalance?.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px] text-right">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      );
                    })
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
                onClick={() => setTxnPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setTxnPage(p => Math.min(totalPages, p + 1))}
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
