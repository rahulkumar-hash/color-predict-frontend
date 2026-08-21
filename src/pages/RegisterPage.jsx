import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, ArrowRight, Sparkles, Zap, ShieldCheck, Gift, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useSearchParams, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register, isBackendOnline, sysConfig } = useAuthStore();
  const [searchParams] = useSearchParams();

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }
  }, [searchParams]);

  // Signup Submit
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!phone || !email || !password) {
      toast.error('Please fill in phone, email and password');
      return;
    }
    const toastId = toast.loading('Creating account...');
    setLoading(true);

    const res = await register({
      email,
      phone,
      password,
      referralCode: referralCode || undefined
    });
    setLoading(false);

    if (res.success) {
      toast.success(res.message || 'Account created successfully!', { id: toastId });
    } else {
      toast.error(res.error || 'Registration failed', { id: toastId });
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

        {/* RIGHT COLUMN: Dedicated Register Card */}
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
            <p className="text-xs text-slate-400 font-medium">Join thousands of daily traders</p>
          </div>

          <div className="glass-card-premium p-6 sm:p-8 space-y-5">
            {/* Header Title */}
            <div className="border-b border-slate-800/80 pb-3">
              <h2 className="text-lg font-black text-white">Create Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Register now to claim your welcome bonus</p>
            </div>

            {/* SIGNUP FORM */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-dark-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
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
                  placeholder="Create Strong Password"
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

              <div className="relative">
                <Gift className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Referral Code (optional)"
                  className={`w-full bg-dark-950/80 border rounded-xl pl-10 pr-3.5 py-3 text-xs text-white font-mono focus:outline-none transition-colors ${referralCode ? 'border-purple-500/60 focus:border-purple-400' : 'border-slate-700/80 focus:border-emerald-500'}`}
                  maxLength={8}
                />
                {referralCode && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                    +₹25 Bonus
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 btn-touch flex items-center justify-center gap-2 neon-glow-green"
              >
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Link to Login Page */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-black tracking-wide ml-1 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}