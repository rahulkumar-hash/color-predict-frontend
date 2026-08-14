import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Mail, MessageCircle, X, ChevronDown, ChevronUp, ShieldCheck, Zap, HelpCircle, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user, sysConfig } = useAuthStore();
  const [openFaq, setOpenFaq] = useState(null);

  const whatsappNum = (sysConfig?.supportWhatsapp || '+919876543210').replace(/[^\d+]/g, '');
  const emailAddr = sysConfig?.supportEmail || 'support@colorpredictpro.com';
  const welcomeMsg = sysConfig?.supportWelcomeMsg || 'Our 24/7 dedicated support team is available via WhatsApp and Email to assist you.';

  const handleOpenWhatsapp = () => {
    const text = encodeURIComponent(
      `Hello Support Team,\n\nI need assistance with my account.\n- Username: @${user?.username || 'Guest'}\n- User ID: ${user?._id || 'N/A'}`
    );
    const url = `https://wa.me/${whatsappNum.replace('+', '')}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`Account Support Request - @${user?.username || 'Guest'}`);
    const body = encodeURIComponent(
      `Hello Support Team,\n\nI need assistance with my account.\n\nUsername: @${user?.username || 'Guest'}\nUser ID: ${user?._id || 'N/A'}\n\nDetails of my query:\n`
    );
    const url = `mailto:${emailAddr}?subject=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const faqs = [
    {
      q: 'How do I deposit funds into my wallet?',
      a: 'Click on the Wallet Balance badge (₹0.00) or Deposit button. Choose custom amount or preset (₹100, ₹500, etc.) and complete payment via UPI QR or Razorpay.'
    },
    {
      q: 'When will my withdrawal request be processed?',
      a: 'Withdrawal requests are processed instantly or within 15-30 minutes after admin verification. Ensure your UPI ID is correct.'
    },
    {
      q: 'How does the Refer & Earn program work?',
      a: 'Share your referral code from Profile/Referral page. When your friend registers and completes their first deposit (₹100+), you get ₹50 and your friend gets ₹25 bonus!'
    },
    {
      q: 'Is the game engine provably fair?',
      a: 'Yes! Every period uses SHA-256 cryptographic server seeds generated before round start, ensuring 100% un-alterable fair game outcomes.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex min-h-full items-center justify-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card-premium max-w-xl w-full mx-auto space-y-5 relative my-auto shadow-2xl border border-slate-700/80 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Help & Support Desk</h3>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 24/7 Live Support Active
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 btn-touch">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Welcome Card */}
        <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 p-4 rounded-2xl border border-purple-500/30 text-xs text-slate-300 space-y-1">
          <span className="text-white font-black flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Dedicated Customer Care
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">{welcomeMsg}</p>
        </div>

        {/* 2 Main Interactive Contact Channels */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider block">Choose Support Channel</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. WhatsApp Support Button */}
            <button
              onClick={handleOpenWhatsapp}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 hover:border-emerald-400 text-left space-y-2 transition-all btn-touch shadow-lg shadow-emerald-950/30 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  WhatsApp Chat <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">WhatsApp Support</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sysConfig?.supportWhatsapp || '+919876543210'}</p>
              </div>
            </button>

            {/* 2. Email Support Button */}
            <button
              onClick={handleOpenEmail}
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/40 hover:border-blue-400 text-left space-y-2 transition-all btn-touch shadow-lg shadow-blue-950/30 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                  Email Us <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">Email Desk</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{sysConfig?.supportEmail || 'support@colorpredictpro.com'}</p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" /> Frequently Asked Questions
          </span>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden text-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-3 text-left font-bold text-slate-200 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
