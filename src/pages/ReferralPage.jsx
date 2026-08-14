import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Copy, Check, Users, Wallet, ChevronRight,
  Share2, Trophy, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useReferralStore } from '../store/useReferralStore';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';

export default function ReferralPage() {
  const { referralData, loading, applying, fetchReferralInfo, applyReferralCode } = useReferralStore();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    fetchReferralInfo();
  }, []);

  const handleCopyCode = () => {
    const code = referralData?.referralCode || user?.referralCode || '';
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyLink = () => {
    const link = referralData?.referralLink || '';
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Referral link copied!');
    });
  };

  const handleShare = async () => {
    const link = referralData?.referralLink || '';
    const code = referralData?.referralCode || '';
    const shareText = `🎯 Join Color Predict Pro and earn ₹${referralData?.settings?.refereeBonus || 25} bonus on sign-up!\n\nUse my referral code: ${code}\n\nJoin here: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join Color Predict Pro!', text: shareText, url: link });
      } catch (e) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  const handleApplyCode = async (e) => {
    e.preventDefault();
    if (!applyCode.trim()) return;
    const result = await applyReferralCode(applyCode.trim());
    if (result.success) {
      toast.success(result.message);
      setApplyCode('');
      setShowApplyForm(false);
      fetchReferralInfo();
    } else {
      toast.error(result.error);
    }
  };

  const referralCode = referralData?.referralCode || user?.referralCode || '------';
  const settings = referralData?.settings || { referrerBonus: 50, refereeBonus: 25, minDepositForBonus: 100 };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-[#070b14]">
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenWithdrawal={() => setShowWithdrawalModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      <main className="w-full max-w-7xl px-3 sm:px-6 space-y-4">
        {/* Responsive Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (lg:col-span-6): Hero Banner & Code Share Box */}
          <div className="lg:col-span-6 space-y-4">
            {/* Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-slate-900/80 border border-purple-500/30 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent pointer-events-none" />
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-purple-600/10 blur-2xl" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-black text-purple-300 uppercase tracking-widest">Refer & Earn Program</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Invite Friends,<br />
                    <span className="text-purple-400">Earn ₹{settings.referrerBonus}</span> Each!
                  </h1>
                  <p className="text-xs text-slate-300 mt-2">
                    Your friend gets <span className="text-emerald-400 font-bold">₹{settings.refereeBonus} welcome bonus</span> on sign-up! Minimum first deposit ₹{settings.minDepositForBonus} unlocks bonuses.
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
                    <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* How It Works Steps */}
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { step: '1', label: 'Share Code', desc: 'Send link or code' },
                  { step: '2', label: 'Friend Joins', desc: `They get ₹${settings.refereeBonus}` },
                  { step: '3', label: 'You Earn', desc: `+₹${settings.referrerBonus} bonus` }
                ].map((s) => (
                  <div key={s.step} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center mx-auto mb-1">{s.step}</div>
                    <div className="text-[10px] sm:text-xs font-black text-white">{s.label}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">{s.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Your Personal Referral Code</span>
              </div>

              {/* Code Display */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-900 border border-purple-500/40 rounded-xl py-3.5 px-4 text-center shadow-inner">
                  <div className="font-mono font-black text-2xl sm:text-3xl text-purple-300 tracking-[0.3em]">
                    {loading ? '------' : referralCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-600/30 transition-all btn-touch shrink-0"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-all btn-touch"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Share Link
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-950/40 btn-touch"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Now
                </button>
              </div>
            </motion.div>

            {/* Apply a Code Section */}
            {!referralData?.referrals?.length && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" /> Received a Referral Code?
                  </span>
                  <button
                    onClick={() => setShowApplyForm(!showApplyForm)}
                    className="text-xs text-purple-400 font-bold hover:underline"
                  >
                    {showApplyForm ? 'Cancel' : 'Apply Code'}
                  </button>
                </div>

                {showApplyForm && (
                  <form onSubmit={handleApplyCode} className="flex gap-2">
                    <input
                      type="text"
                      value={applyCode}
                      onChange={e => setApplyCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-purple-500 outline-none"
                      maxLength={8}
                    />
                    <button
                      type="submit"
                      disabled={applying || !applyCode.trim()}
                      className="px-4 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all btn-touch"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN (lg:col-span-6): Stats Row & Referral Friends List */}
          <div className="lg:col-span-6 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Total Referrals',
                  value: referralData?.totalReferrals ?? 0,
                  icon: Users,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/30'
                },
                {
                  label: 'Total Earned',
                  value: `₹${referralData?.totalEarnings ?? 0}`,
                  icon: Wallet,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/30'
                },
                {
                  label: 'Pending',
                  value: referralData?.pendingReferrals ?? 0,
                  icon: Clock,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/30'
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className={`p-3.5 rounded-2xl border ${stat.bg} text-center`}
                  >
                    <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                    <div className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Referral List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card space-y-4"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Referred Friends Ledger ({referralData?.totalReferrals ?? 0})
              </h3>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 animate-pulse">Loading referral history...</div>
              ) : !referralData?.referrals?.length ? (
                <div className="py-12 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">No referrals yet</p>
                  <p className="text-[10px] text-slate-500">Share your referral link to start earning ₹{settings.referrerBonus} per friend!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {referralData.referrals.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between py-3 px-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                          {(ref.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">@{ref.username}</div>
                          <div className="text-[10px] text-slate-500">
                            Joined: {new Date(ref.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {ref.bonusStatus === 'CREDITED' ? (
                          <>
                            <div className="text-xs font-black text-emerald-400">+₹{ref.referrerBonus}</div>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Credited
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-amber-400">Pending</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <AlertCircle className="w-3 h-3" /> Awaiting deposit
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Terms */}
            <div className="text-[10px] text-slate-500 text-center pb-2 leading-relaxed">
              Referral bonus is credited when your friend completes a minimum first deposit of ₹{settings.minDepositForBonus}+.
              Self-referral is strictly forbidden.
            </div>
          </div>

        </div>
      </main>

      {/* Action Modals */}
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

      <BottomNav onOpenDeposit={() => setShowDepositModal(true)} />
    </div>
  );
}
