import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, RefreshCw, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { loginWithPassword, forgotPassword, isBackendOnline, sysConfig } = useAuthStore();

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter identifier and password');
      return;
    }
    const toastId = toast.loading('Authenticating...');
    setLoading(true);

    const res = await loginWithPassword(identifier, password);
    setLoading(false);

    if (res.success) {
      toast.success(`Welcome back @${res.user?.username || 'User'}!`, { id: toastId });
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  /* =========================================================================
     [NOTE: OTP LOGIN IS CURRENTLY COMMENTED OUT AS PER REQUIREMENT]
     =========================================================================
  const [loginType, setLoginType] = useState('password'); // 'password' | 'otp'
  const [otpCode, setOtpCode] = useState('');

  const handleSendOtp = async (targetId, purpose) => {
    if (!targetId) {
      toast.error('Please enter email or phone number');
      return;
    }
    const toastId = toast.loading('Sending code...');
    setLoading(true);
    const res = await sendOtp(targetId, purpose);
    setLoading(false);
    if (res.success) {
      toast.success(res.message, { id: toastId });
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Verifying code...');
    setLoading(true);
    const res = await verifyOtpLogin(identifier, otpCode);
    setLoading(false);
    if (res.success) {
      toast.success(res.message, { id: toastId });
    } else {
      toast.error(res.error, { id: toastId });
    }
  };
  ========================================================================= */

  // Forgot Password
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Resetting password...');
    setLoading(true);

    const res = await forgotPassword(forgotEmail, forgotOtp, newPassword);
    setLoading(false);

    if (res.success) {
      toast.success(res.message, { id: toastId });
      setShowForgotModal(false);
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {!isBackendOnline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-amber-400" /> Connecting to Game Server...
        </div>
      )}

      {/* Main Container: Split-Screen on Desktop, Centered Column on Mobile */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* DESKTOP LEFT COLUMN: Promotional Gaming Showcase Banner */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:col-span-7 flex-col space-y-6 pr-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider w-fit">
            <Sparkles className="w-4 h-4" /> 99.9% Provably Fair Trading Arena
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight font-display tracking-tight">
            Predict Colors. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400">
              Win Real Cash Rewards.
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Experience next-generation color prediction trading with 60-second period cycles, instant automated UPI withdrawals, and risk-controlled algorithm transparency.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white">60s Turbo Rounds</h4>
              <p className="text-[11px] text-slate-400">Fast 1-minute period cycles with real-time socket updates.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white">Instant UPI Payouts</h4>
              <p className="text-[11px] text-slate-400">Direct wallet deposit & withdrawal gateway integration.</p>
            </div>
          </div>

          {/* Live Statistics Ticker Bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-white font-mono">₹2.4Cr+</span>
              <span className="text-[11px] text-slate-400 block font-bold">Total Winnings Paid</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-2xl font-black text-emerald-400 font-mono">120K+</span>
              <span className="text-[11px] text-slate-400 block font-bold">Active Traders</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-2xl font-black text-purple-400 font-mono">0.05s</span>
              <span className="text-[11px] text-slate-400 block font-bold">Socket Execution</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Dedicated Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          {/* Dynamic Brand Logo & Header */}
          <div className="text-center mb-6 space-y-2">
            {sysConfig?.appLogoUrl ? (
              <img
                src={sysConfig.appLogoUrl}
                alt={sysConfig?.appName || 'Logo'}
                className="h-14 w-auto max-w-[180px] mx-auto object-contain drop-shadow-lg"
              />
            ) : (
              <img
                src="/logo.png"
                alt={sysConfig?.appName || 'Logo'}
                onError={(e) => { e.target.style.display = 'none'; }}
                className="h-14 w-auto max-w-[180px] mx-auto object-contain drop-shadow-lg"
              />
            )}
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 font-display uppercase tracking-wider">
              {sysConfig?.appName || 'COLOR PREDICT'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Welcome back! Sign in to your account</p>
          </div>

          <div className="glass-card-premium p-6 sm:p-8 space-y-5">
            {/* Header Title */}
            <div className="border-b border-slate-800/80 pb-3">
              <h2 className="text-lg font-black text-white">Sign In</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access trading arena</p>
            </div>

            {/* PASSWORD LOGIN FORM */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Email, Phone, or Username"
                  className="w-full bg-dark-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-dark-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 btn-touch flex items-center justify-center gap-2 neon-glow-green"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Link to Register Page */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-emerald-400 hover:text-emerald-300 font-black tracking-wide ml-1 transition-colors"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Reset Password</h3>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <input
                type="text"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Registered Email / Phone"
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />

              <input
                type="text"
                value={forgotOtp}
                onChange={e => setForgotOtp(e.target.value)}
                placeholder="Enter 6-digit OTP / Secret Code"
                maxLength={6}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                required
              />

              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter New Password"
                  className="w-full bg-dark-950 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}