import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, KeyRound, LogOut, Camera, Clock, Copy, Laptop, Smartphone, ArrowUpRight, Wallet, ChevronRight, ChevronLeft, Receipt, RefreshCw, Gift, Headphones, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import { useReferralStore } from '../store/useReferralStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfilePage() {
  const { user, sysConfig, logout, updateProfile, changePassword, fetchLoginHistory } = useAuthStore();
  const {
    withdrawalHistory,
    fetchWithdrawalHistory,
    transactions,
    transactionsLoading,
    fetchTransactions
  } = useWalletStore();
  const { referralData, fetchReferralInfo } = useReferralStore();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('details'); // 'details', 'transactions', 'payouts', 'history', 'security'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Editable Profile States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : '');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Login History States
  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Pagination States for Ledger & Payouts
  const [txnPage, setTxnPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const ledgerPageSize = 7;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWithdrawalHistory();
    fetchTransactions();
    fetchReferralInfo();
  }, []);

  const loadLoginHistory = async (page = 1) => {
    setHistoryLoading(true);
    const res = await fetchLoginHistory(page);
    setHistoryLoading(false);

    if (res.success && res.data) {
      setHistoryList(res.data.history);
      setTotalPages(res.data.pagination.totalPages);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadLoginHistory(historyPage);
    } else if (activeTab === 'payouts') {
      fetchWithdrawalHistory();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, historyPage]);

  // Instant Auto-Upload Profile Picture
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const toastId = toast.loading('Uploading profile photo...');
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await updateProfile(formData);
    if (res.success) {
      toast.success('Profile photo updated instantly!', { id: toastId });
    } else {
      toast.error(res.error || 'Photo upload failed', { id: toastId });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving profile details...');

    const formData = new FormData();
    if (fullName !== user?.fullName) formData.append('fullName', fullName);
    if (username !== user?.username) formData.append('username', username);
    if (email !== user?.email) formData.append('email', email);
    if (phone !== user?.phone) formData.append('phone', phone);

    const res = await updateProfile(formData);
    setSaving(false);

    if (res.success) {
      toast.success('Profile updated successfully!', { id: toastId });
    } else {
      toast.error(res.error || 'Failed to update profile', { id: toastId });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    const toastId = toast.loading('Updating security credentials...');
    const res = await changePassword(currentPassword, newPassword);

    if (res.success) {
      toast.success('Password updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
    } else {
      toast.error(res.error || 'Failed to change password', { id: toastId });
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  // Transaction Ledger Pagination
  const totalTxnPages = Math.ceil(transactions.length / ledgerPageSize) || 1;
  const currentTxnPageClamped = Math.min(txnPage, totalTxnPages);
  const paginatedTransactions = transactions.slice(
    (currentTxnPageClamped - 1) * ledgerPageSize,
    currentTxnPageClamped * ledgerPageSize
  );

  // Payout History Pagination
  const totalPayoutPages = Math.ceil(withdrawalHistory.length / ledgerPageSize) || 1;
  const currentPayoutPageClamped = Math.min(payoutPage, totalPayoutPages);
  const paginatedPayouts = withdrawalHistory.slice(
    (currentPayoutPageClamped - 1) * ledgerPageSize,
    currentPayoutPageClamped * ledgerPageSize
  );

  const menuNavItems = [
    { id: 'details', label: 'Edit Profile', icon: User, desc: 'Personal details & avatar' },
    { id: 'transactions', label: 'Transaction Ledger', icon: Receipt, desc: 'Opening, debit/credit & closing' },
    { id: 'payouts', label: 'Payout History', icon: ArrowUpRight, desc: 'Cashout requests & status' },
    { id: 'history', label: 'Login Audit', icon: Clock, desc: 'Security log & devices' },
    { id: 'security', label: 'Security', icon: KeyRound, desc: 'Password & credentials' }
  ];

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center">
      {/* Header Bar */}
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenWithdrawal={() => setShowWithdrawalModal(true)}
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400 shrink-0" /> User Profile & Account Center
          </h2>
          <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-white font-bold">
            ← Back to Game Arena
          </button>
        </div>

        {/* TOP USER PROFILE BANNER CARD (Renders on top for both mobile & desktop) */}
        <div className="glass-card p-4 sm:p-5 space-y-4 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative group shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-purple-600 flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-xl overflow-hidden border-2 border-slate-700">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-500 shadow-md btn-touch">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                </label>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">{user?.fullName || user?.username}</h3>
                  <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-0.5 shrink-0">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">@{user?.username}</p>
              </div>
            </div>

            {/* Wallet Balance & Cashout button */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-400 font-mono font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
                Wallet: ₹{user?.balance?.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  setActiveTab('payouts');
                  setShowWithdrawalModal(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold hover:bg-emerald-500/30 btn-touch flex items-center gap-1"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Request Cashout
              </button>
            </div>
          </div>

          {/* Referral Banner & Mobile Logout Action */}
          {(() => {
            const referrerBonus = referralData?.settings?.referrerBonus ?? 50;
            const refereeBonus = referralData?.settings?.refereeBonus ?? 25;
            const minDeposit = referralData?.settings?.minDepositForBonus ?? 100;

            return (
              <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 p-3 sm:p-4 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
                      Refer & Earn Program
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black border border-purple-500/30">
                        +₹{referrerBonus} You
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                        +₹{refereeBonus} Friend
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Earn ₹{referrerBonus} when friend joins & deposits min ₹{minDeposit}. Friend receives ₹{refereeBonus} welcome bonus!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span
                    onClick={() => {
                      navigator.clipboard.writeText(user?.referralCode || '');
                      toast.success('Referral code copied!');
                    }}
                    className="font-mono font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-1.5 text-xs cursor-pointer hover:bg-purple-500/20 btn-touch"
                  >
                    {user?.referralCode} <Copy className="w-3.5 h-3.5 text-purple-400" />
                  </span>

                  <button
                    onClick={() => navigate('/referral')}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md btn-touch shrink-0 flex items-center gap-1"
                  >
                    Open Hub <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Help & Support Desk Banner Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-3 sm:p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  24/7 Customer Help & Support Desk
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">Live 24/7</span>
                </h4>
                <p className="text-[11px] text-slate-400">Need help with deposits, withdrawals, or gameplay? Connect instantly.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  const num = (sysConfig?.supportWhatsapp || '+919876543210').replace(/[^\d+]/g, '');
                  window.open(`https://wa.me/${num.replace('+', '')}`, '_blank');
                }}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 btn-touch flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                onClick={() => setShowSupportModal(true)}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md btn-touch shrink-0 flex items-center gap-1"
              >
                Support Hub <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sign Out Banner Action (Always visible on mobile) */}
        <div className="block lg:hidden w-full">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2.5 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out Account
          </button>
        </div>

        {/* MOBILE HORIZONTAL NAVIGATION TAB BAR (< lg) */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-bold w-full max-w-full">
          {menuNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg transition-all shrink-0 flex items-center gap-1.5 btn-touch ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* DESKTOP SIDEBAR NAVIGATION (lg:col-span-3 lg:sticky lg:top-20) */}
          <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 space-y-4 w-full">
            <div className="glass-card p-2 space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider px-3 py-1.5 block">
                Account Navigation
              </span>

              {menuNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-3.5 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all btn-touch ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <div className="leading-tight">{item.label}</div>
                        <div className={`text-[10px] font-normal ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
                  </button>
                );
              })}

              <div className="pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-2.5 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch"
                >
                  <LogOut className="w-4 h-4" /> Sign Out Account
                </button>
              </div>
            </div>
          </div>

          {/* MAIN TAB CONTENT DISPLAY (lg:col-span-9) */}
          <div className="lg:col-span-9 space-y-4 w-full min-w-0">
            <AnimatePresence mode="wait">
              {/* EDIT PROFILE TAB */}
              {activeTab === 'details' && (
                <motion.form
                  key="tab-details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleUpdateProfile}
                  className="glass-card p-5 space-y-4 w-full"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" /> Account Personal Details
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Update your personal account credentials and profile display identity.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Username Handle</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* TRANSACTION LEDGER TAB */}
              {activeTab === 'transactions' && (
                <motion.div
                  key="tab-transactions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-5 space-y-4 w-full overflow-hidden"
                >
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-400" /> Wallet Transaction Ledger
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Opening balance, credit/debit amounts, and closing balance statement.</p>
                    </div>

                    <button
                      onClick={fetchTransactions}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 btn-touch"
                      title="Refresh Ledger"
                    >
                      <RefreshCw className={`w-4 h-4 ${transactionsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900">
                          <th className="py-3 px-4">Transaction Type</th>
                          <th className="py-3 px-4">Opening Balance</th>
                          <th className="py-3 px-4">Amount (+/-)</th>
                          <th className="py-3 px-4">Closing Balance</th>
                          <th className="py-3 px-4 text-right">Timestamp</th>
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
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                      t.type === 'RECHARGE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                      t.type === 'BET_WIN' ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' :
                                      t.type === 'WITHDRAWAL_REFUND' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                                      t.type === 'BET_PLACED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                                      'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                    }`}>
                                      {t.type}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">{t.description}</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-300">
                                  ₹{t.openingBalance?.toFixed(2)}
                                </td>
                                <td className={`py-3 px-4 font-mono font-black text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isCredit ? `+₹${t.amount?.toFixed(2)}` : `-₹${Math.abs(t.amount)?.toFixed(2)}`}
                                </td>
                                <td className="py-3 px-4 font-mono font-black text-amber-400">
                                  ₹{t.closingBalance?.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-400 text-[11px] text-right">
                                  {new Date(t.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalTxnPages > 1 && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button
                        disabled={currentTxnPageClamped === 1}
                        onClick={() => setTxnPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Page {currentTxnPageClamped} of {totalTxnPages}
                      </span>

                      <button
                        disabled={currentTxnPageClamped === totalTxnPages}
                        onClick={() => setTxnPage(p => Math.min(totalTxnPages, p + 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* PAYOUT & CASHOUT HISTORY TAB */}
              {activeTab === 'payouts' && (
                <motion.div
                  key="tab-payouts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-5 space-y-4 w-full overflow-hidden"
                >
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Payout & Cashout History
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Track submitted withdrawal requests and approval status.</p>
                    </div>

                    <button
                      onClick={() => setShowWithdrawalModal(true)}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold hover:bg-emerald-500/30 btn-touch flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Request Cashout
                    </button>
                  </div>

                  <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold bg-slate-900">
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payout Address / UPI</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {withdrawalHistory.length === 0 ? (
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

                  {totalPayoutPages > 1 && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button
                        disabled={currentPayoutPageClamped === 1}
                        onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Page {currentPayoutPageClamped} of {totalPayoutPages}
                      </span>

                      <button
                        disabled={currentPayoutPageClamped === totalPayoutPages}
                        onClick={() => setPayoutPage(p => Math.min(totalPayoutPages, p + 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* LOGIN AUDIT HISTORY TAB */}
              {activeTab === 'history' && (
                <motion.div
                  key="tab-history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-5 space-y-4 w-full overflow-hidden"
                >
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" /> Account Security & Login Audit Log
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Real-time IP logs, device details, and session locations.</p>
                    </div>

                    <button
                      onClick={() => loadLoginHistory(historyPage)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 btn-touch"
                      title="Refresh Audit Log"
                    >
                      <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="w-full max-w-full overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
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
                                <td className="py-3 px-4 text-slate-300 font-medium">{log.browser || 'Browser'}</td>
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

                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Page {historyPage} of {totalPages}
                      </span>

                      <button
                        disabled={historyPage === totalPages}
                        onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 btn-touch"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.form
                  key="tab-security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleChangePassword}
                  className="glass-card p-5 space-y-4 w-full"
                >
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" /> Account Security Credentials
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Update account login password and security settings.</p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">New Security Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch"
                    >
                      Update Password
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      </main>

      {/* Dedicated Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of your account?"
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenDeposit={() => setShowDepositModal(true)}
      />
    </div>
  );
}
