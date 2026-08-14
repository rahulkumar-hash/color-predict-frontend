import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';

export default function SecurityPage() {
  const { user, changePassword } = useAuthStore();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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
    if (confirmPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Updating security credentials...');
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      toast.success('Password updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.error || 'Failed to change password', { id: toastId });
    }
  };

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
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0" /> Security & Account Credentials
              </h2>
              <p className="text-[11px] text-slate-400">Manage your account login password and authentication protections.</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-slate-400 hover:text-white font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl btn-touch"
            >
              ← Profile
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Password Change Form (lg:col-span-7) */}
            <form onSubmit={handleChangePassword} className="lg:col-span-7 glass-card p-5 space-y-4 w-full">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" /> Change Login Password
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Use a strong password with a mix of letters, numbers, and symbols.</p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

            {/* Security Highlights & Tips (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 space-y-3.5 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white">Security Checklist</h4>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Never share your password or OTP with anyone, including customer support.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>All payout transactions are strictly authenticated and encrypted.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Session IPs and devices are actively audited to detect unauthorized access.</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/login-history')}
                  className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl btn-touch text-center"
                >
                  View Active Login Devices →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      <BottomNav onOpenDeposit={() => setShowDepositModal(true)} />
    </div>
  );
}
