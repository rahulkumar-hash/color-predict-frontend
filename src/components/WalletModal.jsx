import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, Copy, QrCode, ShieldAlert, X, Zap, Smartphone, ExternalLink, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import apiClient from '../api/axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function WalletModal({ onClose, initialTab = 'recharge' }) {
  const { user, sysConfig, updateBalance } = useAuthStore();
  const { submitRecharge, submitWithdrawal, recharging, withdrawing } = useWalletStore();

  const [activeTab, setActiveTab] = useState(initialTab); // 'recharge' or 'withdraw'

  // Recharge form state
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [utrNumber, setUtrNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Active Payment Method Toggles from Admin Config
  const activeMethod = sysConfig?.activePaymentMethod || 'MANUAL_UPI';
  const manualEnabled = activeMethod === 'MANUAL_UPI' || sysConfig?.manualUpiEnabled;
  const autoUpiEnabled = activeMethod === 'AUTOMATED_UPI_GATEWAY' || sysConfig?.automatedUpiGatewayEnabled;
  const razorpayEnabled = activeMethod === 'AUTOMATED_RAZORPAY' || sysConfig?.automatedRazorpayEnabled;

  // Selected active payment channel tab on frontend
  const [selectedChannel, setSelectedChannel] = useState(activeMethod);

  useEffect(() => {
    if (activeMethod) setSelectedChannel(activeMethod);
    else if (manualEnabled) setSelectedChannel('MANUAL_UPI');
    else if (autoUpiEnabled) setSelectedChannel('AUTOMATED_UPI_GATEWAY');
    else if (razorpayEnabled) setSelectedChannel('AUTOMATED_RAZORPAY');
  }, [activeMethod, manualEnabled, autoUpiEnabled, razorpayEnabled]);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState(200);
  const [withdrawUpi, setWithdrawUpi] = useState('');

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(sysConfig.upiId || 'merchant@upi');
    toast.success('UPI ID copied to clipboard!');
  };

  const handleManualRechargeSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      toast.error('Please enter a valid 12-digit UTR/Reference Number');
      return;
    }

    const toastId = toast.loading('Submitting deposit request for Admin verification...');
    const res = await submitRecharge(Number(rechargeAmount), utrNumber.trim());

    if (res.success) {
      toast.success(res.message, { id: toastId, duration: 5000 });
      setUtrNumber('');
      onClose();
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  const handleAutomatedRazorpayPay = async () => {
    if (!rechargeAmount || rechargeAmount < 10) {
      toast.error('Minimum deposit amount is ₹10');
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Loading Razorpay Checkout Modal...');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setCreatingOrder(false);
      toast.error('Failed to load Razorpay SDK. Please check your internet connection.', { id: toastId });
      return;
    }

    try {
      const res = await apiClient.post('/v1/payment/create-order', {
        amount: Number(rechargeAmount),
        paymentMethod: 'AUTOMATED_RAZORPAY'
      });
      const details = res.data?.data;
      setCreatingOrder(false);

      if (details) {
        toast.dismiss(toastId);
        const rzpKey = details.razorpayKey;

        if (!rzpKey || rzpKey === 'rzp_test_demo' || rzpKey.trim() === '') {
          toast.error('Please enter a valid Razorpay Test Key (rzp_test_...) in Admin Panel -> Settings!', { duration: 6000 });
          return;
        }

        const options = {
          key: rzpKey,
          amount: Number(rechargeAmount) * 100,
          currency: 'INR',
          name: sysConfig.appName || 'COLOR PREDICT PRO',
          description: `Wallet Recharge #${details.orderId}`,
          image: sysConfig.appLogoUrl || undefined,
          ...(details.razorpayOrderId && details.razorpayOrderId.startsWith('order_') ? { order_id: details.razorpayOrderId } : {}),
          handler: async function (response) {
            const verifyToast = toast.loading('Verifying Razorpay payment...');
            try {
              await apiClient.post('/v1/payment/webhook/razorpay', {
                orderId: details.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                status: 'APPROVED'
              });
              toast.success('Razorpay Payment Verified & Wallet Auto-Credited!', { id: verifyToast });
              onClose();
            } catch (err) {
              toast.error('Razorpay verification error', { id: verifyToast });
            }
          },
          prefill: {
            name: user?.fullName || user?.username,
            email: user?.email || `${user?.username}@colorpredict.com`,
            contact: user?.phone || '9999999999'
          },
          theme: {
            color: '#10B981'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Failed to create Razorpay order', { id: toastId });
      }
    } catch (err) {
      setCreatingOrder(false);
      toast.error(err.response?.data?.message || 'Error creating Razorpay order', { id: toastId });
    }
  };

  const handleAutomatedUpiPay = async (appType = 'generic') => {
    if (!rechargeAmount || rechargeAmount < 10) {
      toast.error('Minimum deposit amount is ₹10');
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Initializing 1-Tap Automated UPI payment...');

    try {
      const res = await apiClient.post('/v1/payment/create-order', {
        amount: Number(rechargeAmount),
        paymentMethod: 'AUTOMATED_UPI_GATEWAY'
      });
      const details = res.data?.data;

      setCreatingOrder(false);

      if (details) {
        toast.success(`Order created #${details.orderId}! Opening UPI App...`, { id: toastId });

        let targetUrl = details.intentUrl;
        if (details.gateways && details.gateways[appType]) {
          targetUrl = details.gateways[appType];
        }

        if (targetUrl) {
          window.location.href = targetUrl;
        } else {
          toast.error('UPI Intent URL generation failed');
        }
      } else {
        toast.error('Failed to create payment order', { id: toastId });
      }
    } catch (err) {
      setCreatingOrder(false);
      toast.error(err.response?.data?.message || 'Error creating payment order', { id: toastId });
    }
  };

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
      if (typeof res.newBalance === 'number') {
        updateBalance(res.newBalance);
      }
      setWithdrawUpi('');
      onClose();
    } else {
      toast.error(res.error, { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card max-w-md w-full max-h-[85vh] flex flex-col mx-auto relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Wallet Management</h2>
              <p className="text-[10px] text-slate-400">Instant deposits & cash withdrawals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 pt-3 pr-0.5">
          {/* Current Balance Summary Banner */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-slate-900 to-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-md"
          >
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Balance</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">₹{user?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>

          {/* Tab Switcher: Recharge vs Withdraw */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 btn-touch ${
              activeTab === 'recharge' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" /> Deposit Funds
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 btn-touch ${
              activeTab === 'withdraw' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw Cash
          </button>
        </div>

        {/* Animated Panel Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'recharge' ? (
            <motion.div
              key="recharge-panel"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              {/* Select Recharge Amount */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">Select Deposit Amount (₹)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all btn-touch ${
                        rechargeAmount === amt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={e => setRechargeAmount(Number(e.target.value))}
                  min={10}
                  className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              {/* Dynamic Payment Channel Selection Bar (if multiple enabled by Admin) */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-bold block">Choose Active Deposit Method</span>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[11px] font-extrabold">
                  {manualEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('MANUAL_UPI')}
                      className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 btn-touch ${
                        selectedChannel === 'MANUAL_UPI' ? 'bg-emerald-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> Manual QR
                    </button>
                  )}

                  {autoUpiEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('AUTOMATED_UPI_GATEWAY')}
                      className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 btn-touch ${
                        selectedChannel === 'AUTOMATED_UPI_GATEWAY' ? 'bg-indigo-500 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" /> 1-Tap UPI
                    </button>
                  )}

                  {razorpayEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('AUTOMATED_RAZORPAY')}
                      className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1 btn-touch ${
                        selectedChannel === 'AUTOMATED_RAZORPAY' ? 'bg-blue-600 text-white shadow-sm font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Razorpay
                    </button>
                  )}
                </div>
              </div>

              {/* DYNAMIC CHANNEL FORM RENDER */}
              {selectedChannel === 'MANUAL_UPI' && manualEnabled ? (
                /* Mode 1: Manual QR Code + UTR Submission */
                <form onSubmit={handleManualRechargeSubmit} className="space-y-3.5">
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-extrabold text-slate-300 block">Manual UPI Payment QR & Details</span>

                    {sysConfig.qrCodeUrl && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-700 shadow-md"
                      >
                        <img src={sysConfig.qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                      </motion.div>
                    )}

                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">{sysConfig.upiId || 'merchant@upi'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="px-2.5 py-1 bg-purple-600/30 text-purple-300 text-[10px] font-bold rounded-lg hover:bg-purple-600/50 shrink-0 flex items-center gap-1 btn-touch"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">UPI UTR / Reference Number</label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      placeholder="Enter 12-digit UTR No. after payment"
                      className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={recharging}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg btn-touch transition-all disabled:opacity-50"
                  >
                    {recharging ? 'Submitting...' : 'Submit Deposit for Verification'}
                  </button>
                </form>
              ) : selectedChannel === 'AUTOMATED_RAZORPAY' && razorpayEnabled ? (
                /* Mode 2: Automated Razorpay Checkout Modal Launcher */
                <div className="bg-slate-900/60 p-4 rounded-xl border border-blue-500/30 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-black text-white block">Automated Razorpay Checkout</span>
                      <span className="text-[10px] text-blue-400 font-bold">Cards, NetBanking, UPI & Wallets</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">Tap below to open the Razorpay Popup Modal and complete your ₹{rechargeAmount} deposit:</p>

                  <button
                    type="button"
                    disabled={creatingOrder}
                    onClick={handleAutomatedRazorpayPay}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 btn-touch transition-all disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                    {creatingOrder ? 'Opening Razorpay Modal...' : `Pay ₹${rechargeAmount} with Razorpay`}
                  </button>
                </div>
              ) : selectedChannel === 'AUTOMATED_UPI_GATEWAY' && autoUpiEnabled ? (
                /* Mode 3: Automated UPI Intent App Launcher Buttons */
                <div className="bg-slate-900/60 p-4 rounded-xl border border-purple-500/30 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-black text-white block">1-Tap Automated Instant UPI Payment</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Instant Auto-Credit Webhook Active</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">Tap your preferred UPI payment app to complete ₹{rechargeAmount} deposit automatically:</p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={creatingOrder}
                      onClick={() => handleAutomatedUpiPay('phonepe')}
                      className="py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" /> PhonePe
                    </button>

                    <button
                      type="button"
                      disabled={creatingOrder}
                      onClick={() => handleAutomatedUpiPay('gpay')}
                      className="py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-blue-400" /> Google Pay
                    </button>

                    <button
                      type="button"
                      disabled={creatingOrder}
                      onClick={() => handleAutomatedUpiPay('paytm')}
                      className="py-3 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-sky-400" /> Paytm
                    </button>

                    <button
                      type="button"
                      disabled={creatingOrder}
                      onClick={() => handleAutomatedUpiPay('generic')}
                      className="py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 btn-touch transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" /> Any UPI App
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  No active payment channel enabled. Please contact support.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="withdraw-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleWithdrawSubmit}
              className="space-y-3.5"
            >
              {!sysConfig.withdrawalsEnabled && (
                <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Withdrawals are temporarily paused by Admin.
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  min={50}
                  max={user?.balance || 0}
                  className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">Payout UPI ID / PhonePe / Paytm</label>
                <input
                  type="text"
                  value={withdrawUpi}
                  onChange={e => setWithdrawUpi(e.target.value)}
                  placeholder="e.g. user@upi or 9876543210@paytm"
                  className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={withdrawing || !sysConfig.withdrawalsEnabled}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg btn-touch transition-all disabled:opacity-40"
              >
                {withdrawing ? 'Processing...' : 'Request Instant Cashout'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
