import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, X, Zap, Smartphone, CreditCard, ShieldCheck, RefreshCw, QrCode, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      if (window.Razorpay) return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function DepositModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, sysConfig, fetchSysConfig } = useAuthStore();
  const { submitRecharge, autoRechargeWallet, createPaymentOrder, verifyRazorpayPayment, recharging } = useWalletStore();

  const [rechargeAmount, setRechargeAmount] = useState(500);
  const [utrNumber, setUtrNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Strictly follow Admin configured active payment method (No extra tabs)
  const activeMethod = sysConfig?.activePaymentMethod || 'MANUAL_UPI';

  const amountRef = useRef(rechargeAmount);
  useEffect(() => {
    amountRef.current = rechargeAmount;
  }, [rechargeAmount]);

  useEffect(() => {
    if (isOpen) {
      fetchSysConfig();
      setCreatingOrder(false);
    }
  }, [isOpen]);

  // Reset loading spinner whenever user switches back from UPI app to website
  useEffect(() => {
    const handleFocus = () => setCreatingOrder(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Register NPCI UPI Intent Result Callback on window for Android WebView
  useEffect(() => {
    window.onUpiPaymentResult = async (responseStr, resultCode) => {
      console.log('[NPCI UPI Result]', responseStr, 'ResultCode:', resultCode);
      if (!responseStr) return;

      // 1. Android Activity Result check (RESULT_OK is -1)
      if (resultCode !== -1 && resultCode !== "-1") {
        toast.error("Payment was cancelled.");
        return;
      }

      const params = {};
      (responseStr || '').split('&').forEach((p) => {
        const [k, v] = p.split('=');
        if (k) params[k.trim().toLowerCase()] = decodeURIComponent((v || '').trim());
      });

      const status = (params.status || '').toUpperCase();
      const responseCode = (params.responsecode || '').toUpperCase();
      const rawLower = (responseStr || '').toLowerCase();

      // 2. Strict failure/cancellation check
      const isFailedOrCancelled =
        status === 'FAILURE' ||
        status === 'FAILED' ||
        status === 'CANCEL' ||
        status === 'CANCELLED' ||
        rawLower.includes('fail') ||
        rawLower.includes('cancel') ||
        responseCode === 'ZM' ||
        responseCode === 'Y1' ||
        responseCode === 'CANCELLED';

      // 3. Strict SUCCESS check: MUST be SUCCESS or responseCode 00 / 0
      const isSuccess =
        !isFailedOrCancelled &&
        (status === 'SUCCESS' || responseCode === '00' || responseCode === '0');

      if (isSuccess) {
        const toastId = toast.loading('Payment verified! Adding balance to wallet...', { id: 'upi-auto-credit' });
        const numAmt = Number(amountRef.current || params.am || rechargeAmount);
        const txnId = params.txnid || params.approvalrefno || `UPI_${Date.now()}`;
        const approvalRef = params.approvalrefno || params.txnref || txnId;

        const res = await autoRechargeWallet(numAmt, txnId, approvalRef, responseCode);
        if (res.success) {
          toast.success(`₹${numAmt} Wallet Recharge Successful! 🎉`, { id: toastId, duration: 5000 });
          onClose();
        } else {
          toast.error(res.error || 'Auto-credit failed. Please submit UTR manually.', { id: toastId });
        }
      } else {
        if (params.error === 'NO_APP') {
          toast.error('No UPI payment application found on this device.');
        } else {
          toast.error('Payment cancelled or failed in UPI app.');
        }
      }
    };

    return () => {
      window.onUpiPaymentResult = null;
    };
  }, [autoRechargeWallet, onClose, rechargeAmount]);

  const minDeposit = sysConfig?.minDepositAmount || 100;
  const upiId = sysConfig?.upiId || '9136799526-2@ybl';
  const appName = encodeURIComponent(sysConfig?.appName || 'ColorPredictPro');

  const triggerUpiPayment = (link) => {
    if (window.AndroidUpi && typeof window.AndroidUpi.startUpiPayment === 'function') {
      window.AndroidUpi.startUpiPayment(link);
    } else {
      window.location.href = link;
    }
  };

  const handleLaunchUpi = (appType = 'generic') => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    const txnRef = `CP${Date.now()}`;
    let link = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;

    if (appType === 'gpay') {
      link = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    } else if (appType === 'phonepe') {
      link = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    } else if (appType === 'paytm') {
      link = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    }

    triggerUpiPayment(link);
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(upiId);
    }
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleManualRechargeSubmit = async (e) => {
    e.preventDefault();
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 8) {
      toast.error('Please enter a valid 12-digit UTR/Reference Number');
      return;
    }

    const toastId = toast.loading('Submitting deposit request for Admin verification...');
    const res = await submitRecharge(numAmt, utrNumber.trim());

    if (res.success) {
      toast.success(res.message || 'Deposit request submitted successfully!', { id: toastId, duration: 5000 });
      setUtrNumber('');
      onClose();
    } else {
      toast.error(res.error || 'Failed to submit deposit request', { id: toastId });
    }
  };

  const handleAutomatedRazorpayPay = async () => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Loading Razorpay Checkout Modal...');

    const orderRes = await createPaymentOrder(numAmt, 'AUTOMATED_RAZORPAY');

    if (!orderRes.success || !orderRes.data) {
      setCreatingOrder(false);
      toast.error(orderRes.error || 'Failed to initialize Razorpay payment', { id: toastId });
      return;
    }

    const orderData = orderRes.data;
    const rzpKey = orderData.keyId || orderData.razorpayKey || 'rzp_test_1DP5mmOlF5G5ag';

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      // Fallback: If SDK fails to load due to adblock/offline, simulate test payment
      toast.loading('Razorpay SDK blocked. Simulating Test Payment...', { id: toastId });
      const testPaymentId = `pay_test_${Date.now()}`;
      const verifyRes = await verifyRazorpayPayment({
        orderId: orderData.orderId || orderData.txnId,
        razorpay_payment_id: testPaymentId
      });
      setCreatingOrder(false);
      if (verifyRes.success) {
        toast.success('Test Payment Verified & Wallet Auto-Credited! 🎉', { id: toastId, duration: 4000 });
        onClose();
      } else {
        toast.error('Payment verification failed', { id: toastId });
      }
      return;
    }

    toast.dismiss(toastId);

    const options = {
      key: rzpKey,
      amount: numAmt * 100,
      currency: 'INR',
      name: sysConfig?.appName || 'COLOR PREDICT PRO',
      description: `Wallet Recharge #${orderData.orderId || orderData.txnId}`,
      image: sysConfig?.appLogoUrl || undefined,
      prefill: {
        name: user?.fullName || user?.username || 'Player',
        email: user?.email || `${user?.username || 'user'}@colorpredict.com`,
        contact: user?.phone || '9999999999'
      },
      theme: { color: '#10B981' },
      handler: async function (response) {
        const verifyToast = toast.loading('Verifying Razorpay payment...');
        const verifyRes = await verifyRazorpayPayment({
          orderId: orderData.orderId || orderData.txnId,
          razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`,
          razorpay_order_id: response.razorpay_order_id
        });

        if (verifyRes.success) {
          toast.success(verifyRes.message || 'Payment verified! Wallet credited.', { id: verifyToast, duration: 4000 });
          onClose();
        } else {
          toast.error(verifyRes.error || 'Verification failed', { id: verifyToast });
        }
      },
      modal: {
        ondismiss: function () {
          setCreatingOrder(false);
        }
      }
    };

    if (orderData.razorpayOrderId && orderData.razorpayOrderId.startsWith('order_')) {
      options.order_id = orderData.razorpayOrderId;
    }

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.warn('Razorpay open exception:', err);
      // Direct test payment simulation on checkout modal error
      const testPaymentId = `pay_test_${Date.now()}`;
      const verifyRes = await verifyRazorpayPayment({
        orderId: orderData.orderId || orderData.txnId,
        razorpay_payment_id: testPaymentId
      });
      setCreatingOrder(false);
      if (verifyRes.success) {
        toast.success('Test Payment Verified & Wallet Auto-Credited! 🎉', { duration: 4000 });
        onClose();
      } else {
        toast.error('Could not launch Razorpay.');
      }
    }
  };

  const handleSimulateTestPayment = async () => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Processing Test Razorpay payment...');
    const orderRes = await createPaymentOrder(numAmt, 'AUTOMATED_RAZORPAY');

    if (!orderRes.success || !orderRes.data) {
      setCreatingOrder(false);
      toast.error(orderRes.error || 'Failed to initialize payment', { id: toastId });
      return;
    }

    const orderData = orderRes.data;
    const testPaymentId = `pay_test_${Date.now()}`;
    const verifyRes = await verifyRazorpayPayment({
      orderId: orderData.orderId || orderData.txnId,
      razorpay_payment_id: testPaymentId
    });
    setCreatingOrder(false);

    if (verifyRes.success) {
      toast.success('Test Payment Verified & ₹' + numAmt + ' Credited! 🎉', { id: toastId, duration: 4000 });
      onClose();
    } else {
      toast.error(verifyRes.error || 'Verification failed', { id: toastId });
    }
  };

  const qrImageUrl = sysConfig?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${appName}&am=${rechargeAmount}&cu=INR&tn=Wallet%20Recharge`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="glass-card max-w-sm w-full mx-auto p-4 space-y-3.5 relative overflow-hidden shadow-2xl border border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Deposit Wallet</h3>
              <p className="text-[9px] text-slate-400">Add funds to your betting balance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg btn-touch">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deposit Preset Amount Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 flex justify-between">
            <span>Select Amount (₹)</span>
            <span className="text-amber-400 font-extrabold text-[10px]">Min: ₹{minDeposit}</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[100, 500, 1000, 2000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setRechargeAmount(amt)}
                className={`py-2 rounded-xl text-xs font-mono font-black border transition-all btn-touch ${
                  Number(rechargeAmount) === amt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-1">
          <input
            type="number"
            min={minDeposit}
            value={rechargeAmount === '' ? '' : rechargeAmount}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setRechargeAmount(val === '' ? '' : val);
            }}
            onKeyDown={e => {
              if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            placeholder={`Enter custom amount (Min: ₹${minDeposit})`}
          />
        </div>

        {/* METHOD 1: DIRECT ADMIN UPI INTENT (AUTOMATED_UPI_GATEWAY) */}
        {activeMethod === 'AUTOMATED_UPI_GATEWAY' && (
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => handleLaunchUpi('generic')}
              disabled={creatingOrder || recharging}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pay ₹{rechargeAmount || minDeposit} via Any UPI App</span>
            </button>

            {/* Quick App Selectors */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleLaunchUpi('gpay')}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 btn-touch"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> GPay
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpi('phonepe')}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 btn-touch"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> PhonePe
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpi('paytm')}
                className="py-2 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 btn-touch"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Paytm
              </button>
            </div>

            {/* Fallback UTR Entry Form */}
            <form onSubmit={handleManualRechargeSubmit} className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Didn't auto-credit? Submit 12-digit UTR:</span>
              </div>
              <input
                type="text"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="Enter 12-digit UTR / Ref No."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={recharging || !utrNumber}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-xl transition-all border border-slate-700 btn-touch flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{recharging ? 'Submitting...' : 'Submit UTR Manually'}</span>
              </button>
            </form>
          </div>
        )}

        {/* METHOD 2: MANUAL UPI WITH QR CODE & UTR (MANUAL_UPI) */}
        {activeMethod === 'MANUAL_UPI' && (
          <form onSubmit={handleManualRechargeSubmit} className="space-y-3 pt-1 border-t border-slate-800">
            {/* QR Code Container */}
            <div className="bg-white p-2 rounded-2xl w-40 h-40 mx-auto shadow-md border border-slate-700 flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Admin Payment QR Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${appName}&am=${rechargeAmount}&cu=INR&tn=Wallet%20Recharge`)}`;
                }}
              />
            </div>

            {/* UPI ID Row with Copy */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <span className="text-[10px] text-slate-400 block font-bold">Admin UPI ID:</span>
                <span className="text-emerald-400 font-mono font-bold select-all">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0 btn-touch border border-slate-700"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Launch Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'gpay', label: 'GPay', color: 'bg-blue-500' },
                { id: 'phonepe', label: 'PhonePe', color: 'bg-purple-500' },
                { id: 'paytm', label: 'Paytm', color: 'bg-cyan-500' },
                { id: 'generic', label: 'Other', color: 'bg-emerald-500' }
              ].map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleLaunchUpi(app.id)}
                  className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 btn-touch"
                >
                  <span className={`w-2 h-2 rounded-full ${app.color}`} />
                  <span>{app.label}</span>
                </button>
              ))}
            </div>

            {/* 12-Digit UTR Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex justify-between">
                <span>Enter 12-Digit UTR Number</span>
                <span className="text-slate-500 text-[10px]">After Payment</span>
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="e.g. 428412984521"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={recharging || !utrNumber}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{recharging ? 'Submitting UTR...' : `Submit ₹${rechargeAmount || minDeposit} Deposit`}</span>
            </button>
          </form>
        )}

        {/* METHOD 3: AUTOMATED RAZORPAY (AUTOMATED_RAZORPAY) */}
        {activeMethod === 'AUTOMATED_RAZORPAY' && (
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Razorpay Gateway
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Test Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Supports UPI Apps, Cards, NetBanking, and Wallets with instant auto-credit.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutomatedRazorpayPay}
              disabled={creatingOrder}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{creatingOrder ? 'Opening Razorpay...' : `Pay ₹${rechargeAmount || minDeposit} with Razorpay`}</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateTestPayment}
              disabled={creatingOrder}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-[11px] rounded-xl transition-all btn-touch flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Instant Test Pay & Auto-Credit (Simulate)</span>
            </button>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 pt-1">
          💡 Payment hone ke baad aapka wallet balance turant update ho jayega.
        </p>
      </motion.div>
    </div>
  );
}
