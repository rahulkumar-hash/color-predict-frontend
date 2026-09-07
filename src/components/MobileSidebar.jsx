import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Gamepad2,
  TrendingUp,
  Receipt,
  Gift,
  User,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  KeyRound,
  Clock,
  Headphones,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function MobileSidebar({
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenRules,
  onOpenSupport,
  onRequestLogout
}) {
  const { user, sysConfig } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  const handleAction = (action) => {
    onClose();
    if (action) action();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden"
          />

          {/* Slide-over Drawer from Left */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] bg-[#0c1220] border-r border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden lg:hidden"
          >
            {/* Top User Info & Brand Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {sysConfig.appLogoUrl ? (
                    <img
                      src={sysConfig.appLogoUrl}
                      alt="Logo"
                      className="h-8 w-auto max-w-[100px] object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 via-purple-500 to-rose-500 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md">
                      C
                    </div>
                  )}
                  <div className="truncate">
                    <span className="text-xs font-black text-white tracking-tight block truncate">
                      {sysConfig.appName || 'COLOR PREDICT'}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Fair Play Arena
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity Banner */}
              <div
                onClick={() => handleNav('/profile')}
                className="p-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 rounded-2xl border border-slate-800/90 flex items-center gap-3 cursor-pointer hover:border-purple-500/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 shrink-0 shadow-md">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_SOCKET_URL || 'http://160.191.14.113:5000'}${user.avatarUrl}`}
                      alt="Avatar"
                      className="w-full h-full rounded-[10px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center font-bold text-white text-xs">
                      {user?.username?.slice(0, 2)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {user?.fullName || user?.username || 'Player'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      VIP
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    {user?.phone || user?.email || `@${user?.username}`}
                  </div>
                  <div className="text-[11px] font-black text-amber-400 font-mono mt-0.5">
                    ₹{user?.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation & Separate Pages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {/* SECTION 1: MAIN GAMEPLAY & BETS */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                  Main Navigation
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNav('/')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                      <span>Game Arena</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleNav('/trends')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/trends'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Trends & Chart</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* PROMINENT MY BETS OPTION */}
                  <button
                    onClick={() => handleNav('/bets')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/bets'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900/90 border border-slate-800/80 text-amber-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold">My Bets (मेरी बेट्स)</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      History
                    </span>
                  </button>

                  <button
                    onClick={() => handleNav('/referral')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      location.pathname === '/referral'
                        ? 'bg-purple-600 text-white shadow-md font-black'
                        : 'text-purple-300 hover:bg-purple-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <span>Refer & Earn</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: SEPARATE ACCOUNT & WALLET PAGES */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                  <span>Account & Services</span>
                  <span className="text-[9px] text-emerald-400 lowercase">pages</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNav('/profile')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      location.pathname === '/profile'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Account Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => handleAction(onOpenDeposit)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-950/30 font-semibold"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      <span>Deposit Cash (जमा करें)</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 font-mono">+Add</span>
                  </button>

                  <button
                    onClick={() => handleNav('/withdrawals')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      location.pathname === '/withdrawals' || location.pathname === '/payouts'
                        ? 'bg-slate-800 text-rose-300 font-bold'
                        : 'text-rose-300 hover:bg-rose-950/30 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                      <span>Withdraw Payouts (निकासी)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => handleNav('/transactions')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      location.pathname === '/transactions'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-slate-400" />
                      <span>Transaction Ledger</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => handleNav('/security')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      location.pathname === '/security'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Change Password & PIN</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <button
                    onClick={() => handleNav('/login-history')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      location.pathname === '/login-history'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Login Sessions & Devices</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: SUPPORT & GAME RULES */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                  Help & Fair Play
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleAction(onOpenSupport)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-purple-300 hover:bg-purple-950/40 font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Headphones className="w-4 h-4 text-purple-400" />
                      <span>24/7 Support Desk</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                      Live
                    </span>
                  </button>

                  <button
                    onClick={() => handleAction(onOpenRules)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/60 font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Game Rules & Multipliers</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Sign Out Bar */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  if (onRequestLogout) onRequestLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
