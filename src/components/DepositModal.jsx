import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Copy, QrCode, X, Zap, Smartphone, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
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

  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [utrNumber, setUtrNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Fetch fresh system payment config whenever modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSysConfig();
    }
  }, [isOpen]);

  // Single Active Payment Gateway configured by Admin ('AUTOMATED_RAZORPAY' | 'AUTOMATED_UPI_GATEWAY' | 'MANUAL_UPI')
  const activeMethod = sysConfig?.activePaymentMethod || 'MANUAL_UPI';

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
    const toastId = toast.loading('Initializing Razorpay Checkout Gateway...');

    const res = await createPaymentOrder(Number(rechargeAmount), 'AUTOMATED_RAZORPAY');
    setCreatingOrder(false);

    if (!res.success || !res.data) {
      toast.error(res.error || 'Failed to initialize Razorpay checkout', { id: toastId });
      return;
    }

    const resLoaded = await loadRazorpayScript();
    if (!resLoaded) {
      toast.error('Razorpay SDK failed to load. Please check internet connection.', { id: toastId });
      return;
    }

    toast.dismiss(toastId);

    const orderData = res.data?.order || res.data;
    const razorpayKey = orderData.keyId || orderData.razorpayKey || sysConfig?.razorpayConfig?.keyId || 'rzp_test_demo123';
    const amountInPaisa = orderData.amountInPaisa || (Number(rechargeAmount) * 100);

    const options = {
      key: razorpayKey,
      amount: amountInPaisa,
      currency: orderData.currency || 'INR',
      name: sysConfig.appName || 'Color Predict Pro',
      description: `Wallet Deposit ₹${rechargeAmount}`,
      image: sysConfig.appLogoUrl || '',
      prefill: {
        name: user?.fullName || user?.username,
        email: user?.email || 'user@example.com',
        contact: user?.phone || '9999999999'
      },
      theme: {
        color: '#10B981'
      },
      handler: async function (response) {
        const verifyToast = toast.loading('Verifying payment signature & auto-crediting balance...');
        const verifyRes = await verifyRazorpayPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          txnId: orderData.txnId || orderData.orderId
        });

        if (verifyRes.success) {
          toast.success(verifyRes.message || 'Payment verified! Wallet credited instantly.', { id: verifyToast, duration: 5000 });
          onClose();
        } else {
          toast.error(verifyRes.error || 'Payment verification failed', { id: verifyToast });
        }
      },
      modal: {
        ondismiss: function () {
          toast('Razorpay checkout window closed.', { icon: 'ℹ️' });
        }
      }
    };

    if (orderData.razorpayOrderId || orderData.order_id) {
      options.order_id = orderData.razorpayOrderId || orderData.order_id;
    }

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (resp) {
        toast.error(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
      });
      paymentObject.open();
    } catch (err) {
      console.error('Razorpay Modal Error:', err);
      toast.error('Could not launch Razorpay checkout modal.');
    }
  };

  const handleAutomatedUpiPay = async () => {
    if (!rechargeAmount || rechargeAmount < 10) {
      toast.error('Minimum deposit amount is ₹10');
      return;
    }

    setCreatingOrder(true);
    const toastId = toast.loading('Generating Instant UPI Payment Intent...');

    const res = await createPaymentOrder(Number(rechargeAmount), 'AUTOMATED_UPI_GATEWAY');
    setCreatingOrder(false);

    const orderData = res.data?.order || res.data;

    if (res.success && (orderData?.paymentUrl || orderData?.intentUrl)) {
      toast.success('Redirecting to UPI Payment App...', { id: toastId });
      window.location.href = orderData.paymentUrl || orderData.intentUrl;
    } else {
      toast.error(res.error || 'Failed to generate UPI payment link', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card-premium max-w-xl w-full mx-auto space-y-4 sm:space-y-5 relative my-auto shadow-2xl border border-slate-700/80 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Wallet Deposit & Recharge</h3>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-time Gateway Sync Active
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deposit Preset Amount Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-300">Select Deposit Amount (₹)</label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setRechargeAmount(amt)}
                className={`py-2 rounded-xl text-xs font-mono font-black border transition-all btn-touch ${
                  rechargeAmount === amt
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400">Or Enter Custom Amount (₹)</label>
          <input
            type="number"
            min="10"
            value={rechargeAmount}
            onChange={e => setRechargeAmount(Number(e.target.value))}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* SINGLE ACTIVE GATEWAY 1: AUTOMATED RAZORPAY */}
        {activeMethod === 'AUTOMATED_RAZORPAY' && (
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-center">
              <CreditCard className="w-8 h-8 mx-auto text-emerald-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider block">Razorpay Auto-Deposit Checkout</span>
              <p className="text-[11px] text-slate-400">Instant credit via UPI, Cards, NetBanking, or Wallets using official Razorpay modal.</p>
            </div>

            <button
              type="button"
              onClick={handleAutomatedRazorpayPay}
              disabled={creatingOrder}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" /> {creatingOrder ? 'Opening Razorpay...' : `Pay ₹${rechargeAmount} with Razorpay`}
            </button>
          </div>
        )}

        {/* SINGLE ACTIVE GATEWAY 2: AUTOMATED UPI GATEWAY */}
        {activeMethod === 'AUTOMATED_UPI_GATEWAY' && (
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-center">
              <Smartphone className="w-8 h-8 mx-auto text-purple-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider block">Automated Instant UPI Gateway</span>
              <p className="text-[11px] text-slate-400">1-Tap instant redirection to GPay, PhonePe, Paytm, or BHIM UPI apps.</p>
            </div>

            <button
              type="button"
              onClick={handleAutomatedUpiPay}
              disabled={creatingOrder}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 btn-touch flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" /> {creatingOrder ? 'Generating Link...' : `Pay ₹${rechargeAmount} via UPI App`}
            </button>
          </div>
        )}

        {/* SINGLE ACTIVE GATEWAY 3: MANUAL UPI (QR + UTR) */}
        {activeMethod === 'MANUAL_UPI' && (
          <form onSubmit={handleManualRechargeSubmit} className="space-y-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-3 text-center">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">Manual UPI Payment Portal</span>

              {sysConfig?.qrCodeUrl ? (
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl shadow-lg border-2 border-amber-500/30">
                  <img src={sysConfig.qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <QrCode className="w-10 h-10 mb-1 text-amber-400" />
                  <span className="text-[10px] font-bold">QR Code Preview</span>
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 font-bold block">Official UPI VPA ID</span>
                  <span className="text-xs font-mono font-bold text-white">{sysConfig?.upiId || 'merchant@upi'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30 btn-touch flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-200">Payment 12-Digit UTR / Ref Number</label>
              <input
                type="text"
                placeholder="Enter 12-digit UTR from GPay/PhonePe"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                required
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={recharging}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 btn-touch disabled:opacity-50"
            >
              {recharging ? 'Submitting UTR...' : 'Submit Deposit Order'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
