import React from 'react';
import { Gift, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function DailyStreakCard({ onOpenDeposit }) {
  const { sysConfig } = useAuthStore();

  const streakRewards = (sysConfig?.dailyDepositRewards && sysConfig.dailyDepositRewards.length > 0)
    ? sysConfig.dailyDepositRewards
    : [
        { day: 1, minDeposit: 100, bonusType: 'FIXED', bonusValue: 10 },
        { day: 2, minDeposit: 200, bonusType: 'PERCENTAGE', bonusValue: 12 },
        { day: 3, minDeposit: 500, bonusType: 'PERCENTAGE', bonusValue: 15 },
        { day: 4, minDeposit: 1000, bonusType: 'PERCENTAGE', bonusValue: 18 },
        { day: 5, minDeposit: 2000, bonusType: 'PERCENTAGE', bonusValue: 20 },
        { day: 6, minDeposit: 3000, bonusType: 'PERCENTAGE', bonusValue: 22 },
        { day: 7, minDeposit: 5000, bonusType: 'PERCENTAGE', bonusValue: 25 }
      ];

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Daily Recharge & Task Streak Bonus
            </h3>
            <span className="text-[10px] text-slate-400 font-medium block">
              Complete daily deposit goals to unlock cash rewards!
            </span>
          </div>
        </div>

        <button
          onClick={onOpenDeposit}
          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-[11px] rounded-xl shadow-md flex items-center gap-1 btn-touch"
        >
          <Zap className="w-3.5 h-3.5" /> Deposit & Claim
        </button>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {streakRewards.map((item, idx) => {
          const isBonusPercent = item.bonusType === 'PERCENTAGE';
          const bonusText = isBonusPercent ? `${item.bonusValue}% Bonus` : `+₹${item.bonusValue}`;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                idx === 0
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <span className="text-[10px] font-mono font-black text-amber-400 block uppercase">
                DAY {item.day}
              </span>
              <span className="text-[11px] font-bold text-white block mt-1">
                Deposit ≥ ₹{item.minDeposit}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 block mt-1 bg-emerald-500/20 py-0.5 rounded border border-emerald-500/30">
                {bonusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
