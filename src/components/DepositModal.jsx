import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, X, Zap, Smartphone, CreditCard, ShieldCheck, RefreshCw, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';

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

export default function DepositModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, sysConfig, fetchSysConfig } = useAuthStore();
  const { submitRecharge, createPaymentOrder, verifyRazorpayPayment, recharging } = useWalletStore();

  const [rechargeAmount, setRechargeAmount] = useState(500);
  const [utrNumber, setUtrNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

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

  const activeMethod = sysConfig?.activePaymentMethod || 'MANUAL_UPI';

  const minDeposit = sysConfig?.minDepositAmount || 100;

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

    const toastId = toast.loading('Submitting UTR verification...');
    const res = await submitRecharge(numAmt, utrNumber.trim());

    if (res.success) {
      toast.success(res.message || 'UTR submitted successfully!', { id: toastId, duration: 4000 });
      setUtrNumber('');
      onClose();
    } else {
      toast.error(res.error || 'Failed to submit UTR', { id: toastId });
    }
  };

  const handleAutomatedRazorpayPay = async () => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Opening Razorpay...');

    const res = await createPaymentOrder(numAmt, 'AUTOMATED_RAZORPAY');
    setCreatingOrder(false);

    if (!res.success || !res.data) {
      toast.error(res.error || 'Failed to initialize Razorpay checkout', { id: toastId });
      return;
    }

    const resLoaded = await loadRazorpayScript();
    if (!resLoaded) {
      toast.error('Razorpay SDK failed to load.', { id: toastId });
      return;
    }

    toast.dismiss(toastId);

    const orderData = res.data?.order || res.data;
    const razorpayKey = orderData.keyId || orderData.razorpayKey || sysConfig?.razorpayConfig?.keyId || 'rzp_test_demo123';
    const amountInPaisa = orderData.amountInPaisa || (numAmt * 100);

    const options = {
      key: razorpayKey,
      amount: amountInPaisa,
      currency: orderData.currency || 'INR',
      name: sysConfig.appName || 'Color Predict Pro',
      description: `Deposit ₹${numAmt}`,
      image: sysConfig.appLogoUrl || '',
      prefill: {
        name: user?.fullName || user?.username,
        email: user?.email || 'user@example.com',
        contact: user?.phone || '9999999999'
      },
      theme: { color: '#10B981' },
      handler: async function (response) {
        const verifyToast = toast.loading('Verifying payment...');
        const verifyRes = await verifyRazorpayPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          txnId: orderData.txnId || orderData.orderId
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

    if (orderData.razorpayOrderId || orderData.order_id) {
      options.order_id = orderData.razorpayOrderId || orderData.order_id;
    }

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Could not launch Razorpay.');
    }
  };

  const handleGPay = () => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }
    const upiId = sysConfig?.upiId || '9136799526-2@ybl';
    const appName = encodeURIComponent(sysConfig?.appName || 'RRR');
    window.location.href = `tez://upi/pay?pa=${upiId}&pn=${appName}&am=${numAmt}&cu=INR&tn=Recharge`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="glass-card max-w-sm w-full mx-auto p-4 space-y-4 relative overflow-hidden shadow-2xl border border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Deposit Wallet</h3>
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

        {/* GATEWAY 1: AUTOMATED RAZORPAY */}
        {activeMethod === 'AUTOMATED_RAZORPAY' && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleAutomatedRazorpayPay}
              disabled={creatingOrder}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {creatingOrder ? 'Opening Razorpay...' : `Pay ₹${rechargeAmount} with Razorpay`}
            </button>
          </div>
        )}

        {/* GATEWAY 2: DIRECT GOOGLE PAY INTENT */}
        {activeMethod === 'AUTOMATED_UPI_GATEWAY' && (
          <div className="pt-2 border-t border-slate-800 space-y-3">
            {/* Direct Google Pay Launch Button */}
            <button
              type="button"
              onClick={handleGPay}
              disabled={creatingOrder}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pay ₹{rechargeAmount} via Google Pay</span>
            </button>

            {/* Simple UTR Entry Form */}
            <form onSubmit={handleManualRechargeSubmit} className="space-y-2 pt-1 border-t border-slate-800/80">
              <input
                type="text"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="Enter 12-digit UTR / Ref No."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={recharging}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" /> {recharging ? 'Submitting...' : 'Submit UTR'}
              </button>
            </form>
          </div>
        )}

        {/* GATEWAY 3: MANUAL UPI (QR CODE) */}
        {activeMethod === 'MANUAL_UPI' && (
          <form onSubmit={handleManualRechargeSubmit} className="pt-2 border-t border-slate-800 space-y-3">
            {sysConfig?.qrCodeUrl && (
              <div className="w-32 h-32 mx-auto bg-white p-1.5 rounded-xl shadow-md border border-slate-700">
                <img src={sysConfig.qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
              </div>
            )}
            <input
              type="text"
              value={utrNumber}
              onChange={e => setUtrNumber(e.target.value)}
              placeholder="Enter 12-digit UTR / Ref No."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              required
            />
            <button
              type="submit"
              disabled={recharging}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {recharging ? 'Submitting...' : 'Submit UTR'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
