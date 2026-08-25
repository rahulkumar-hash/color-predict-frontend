import React, { useState, useEffect, useRef } from 'react';
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
  const { submitRecharge, autoRechargeWallet, createPaymentOrder, verifyRazorpayPayment, recharging } = useWalletStore();

  const [rechargeAmount, setRechargeAmount] = useState(500);
  const [utrNumber, setUtrNumber] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('UPI');

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

      const params = {};
      (responseStr || '').split('&').forEach((p) => {
        const [k, v] = p.split('=');
        if (k) params[k.trim().toLowerCase()] = decodeURIComponent((v || '').trim());
      });

      const status = (params.status || '').toUpperCase();
      const responseCode = params.responsecode || '';
      const rawLower = (responseStr || '').toLowerCase();

      // Check explicit failure or cancellation
      const isFailedOrCancelled =
        status === 'FAILURE' ||
        status === 'FAILED' ||
        status === 'CANCEL' ||
        status === 'CANCELLED' ||
        rawLower.includes('fail') ||
        rawLower.includes('cancel') ||
        responseCode === 'ZM' ||
        responseCode === 'Y1';

      const isSuccess =
        !isFailedOrCancelled &&
        (status === 'SUCCESS' ||
          status === 'SUBMITTED' ||
          responseCode === '00' ||
          responseCode === '0');

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
        } else if (isFailedOrCancelled) {
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

  const handleLaunchUpi = (appType) => {
    const numAmt = Number(rechargeAmount);
    if (!numAmt || numAmt < minDeposit) {
      toast.error(`Minimum deposit amount is ₹${minDeposit}`);
      return;
    }

    const txnRef = `CP${Date.now()}`;
    let link = '';

    if (appType === 'gpay') {
      link = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    } else if (appType === 'phonepe') {
      link = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    } else if (appType === 'paytm') {
      link = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    } else {
      link = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${appName}&am=${numAmt}&cu=INR&tr=${txnRef}&tn=Wallet%20Recharge`;
    }

    triggerUpiPayment(link);
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

        {/* Payment Tabs: Instant UPI Apps vs QR / UTR */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedGateway('UPI')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedGateway === 'UPI' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Instant UPI
          </button>
          <button
            type="button"
            onClick={() => setSelectedGateway('QR')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              selectedGateway === 'QR' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> QR / UTR
          </button>
        </div>

        {/* OPTION 1: INSTANT UPI APPS (GPay, PhonePe, Paytm, Any UPI) */}
        {selectedGateway === 'UPI' && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLaunchUpi('gpay')}
                className="py-3 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm btn-touch"
              >
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Google Pay
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpi('phonepe')}
                className="py-3 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm btn-touch"
              >
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> PhonePe
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpi('paytm')}
                className="py-3 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm btn-touch"
              >
                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> Paytm
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpi('other')}
                className="py-3 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm btn-touch"
              >
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Other UPI
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              💡 Payment complete hone ke baad wallet automatic recharge ho jayega.
            </p>
          </div>
        )}

        {/* OPTION 2: QR CODE & MANUAL UTR SUBMISSION */}
        {selectedGateway === 'QR' && (
          <form onSubmit={handleManualRechargeSubmit} className="space-y-3 pt-1">
            {sysConfig?.qrCodeUrl && (
              <div className="w-32 h-32 mx-auto bg-white p-1.5 rounded-xl shadow-md border border-slate-700">
                <img src={sysConfig.qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">UPI ID: <span className="text-emerald-400 font-mono font-bold">{upiId}</span></span>
              <input
                type="text"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="Enter 12-digit UTR / Ref No."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>
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
