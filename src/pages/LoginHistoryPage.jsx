import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, Smartphone, Laptop, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';

export default function LoginHistoryPage() {
  const { fetchLoginHistory } = useAuthStore();
  const navigate = useNavigate();

  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const loadLoginHistory = async (page = 1) => {
    setHistoryLoading(true);
    const res = await fetchLoginHistory(page);
    setHistoryLoading(false);

    if (res.success && res.data) {
      setHistoryList(res.data.history || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    }
  };

  useEffect(() => {
    loadLoginHistory(historyPage);
  }, [historyPage]);

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
                <Clock className="w-5 h-5 text-sky-400 shrink-0" /> Login Sessions & Device Audit
              </h2>
              <p className="text-[11px] text-slate-400">Track connected devices, browser environments, and IP access records.</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-slate-400 hover:text-white font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl btn-touch"
            >
              ← Profile
            </button>
          </div>

          {/* Mobile Card List View (< sm) */}
          <div className="block sm:hidden space-y-2.5">
            {historyLoading ? (
              <div className="glass-card p-8 text-center text-slate-400 font-bold animate-pulse">
                Loading login history...
              </div>
            ) : historyList.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500 font-bold">
                No login audit logs found
              </div>
            ) : (
              historyList.map((log) => {
                const isMobile = log.deviceType === 'Mobile';
                return (
                  <div key={log._id} className="glass-card p-3.5 space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        {isMobile ? (
                          <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                          <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span>{log.os || 'OS'} • {log.deviceType || 'Device'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 text-xs font-bold">{log.ipAddress}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{log.browser || 'Browser'}</span>
                      <span>{log.location || 'Unknown Location'}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80 text-right">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop & Tablet Table View (>= sm) */}
          <div className="hidden sm:block glass-card p-4 space-y-4 overflow-hidden">
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Device History Records</span>
              <button
                onClick={() => loadLoginHistory(historyPage)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 btn-touch"
                title="Refresh Audit Log"
              >
                <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900">
                    <th className="py-3 px-4">Device & OS</th>
                    <th className="py-3 px-4">Browser</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Login Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {historyLoading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 font-bold animate-pulse">Loading login history...</td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">No login audit logs found</td>
                    </tr>
                  ) : (
                    historyList.map((log) => {
                      const isMobile = log.deviceType === 'Mobile';
                      return (
                        <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 font-bold text-white">
                              {isMobile ? <Smartphone className="w-4 h-4 text-purple-400 shrink-0" /> : <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />}
                              <span>{log.os || 'Unknown OS'} ({log.deviceType})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{log.browser || 'Browser'}</td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{log.ipAddress}</td>
                          <td className="py-3 px-4 text-slate-400">{log.location || 'Unknown Location'}</td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px] text-right">{new Date(log.createdAt).toLocaleString()}</td>
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
                disabled={historyPage === 1}
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Page {historyPage} of {totalPages}
              </span>

              <button
                disabled={historyPage === totalPages}
                onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      <BottomNav onOpenDeposit={() => setShowDepositModal(true)} />
    </div>
  );
}
