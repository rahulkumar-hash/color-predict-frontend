import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export default function MyBets({ refreshTrigger }) {
  const { myBets, fetchMyBets } = useGameStore();

  useEffect(() => {
    fetchMyBets();
  }, [refreshTrigger]);

  if (!myBets || myBets.length === 0) {
    return (
      <div className="glass-card text-center text-xs text-slate-400 py-8">
        No bet history found yet. Select a color or number to start playing!
      </div>
    );
  }

  return (
    <div className="glass-card space-y-3">
      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">My Bet History</h3>

      <div className="space-y-2">
        {myBets.map((bet) => {
          const isWon = bet.status === 'WON';
          const isPending = bet.status === 'PENDING';

          return (
            <div
              key={bet._id || bet.id}
              className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white">
                    {typeof bet.selection === 'string' ? `Color: ${bet.selection}` : `Number: ${bet.selection}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{bet.periodId}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Cost: <span className="text-amber-400 font-bold">₹{bet.totalCost ? bet.totalCost.toFixed(2) : (bet.amount * bet.multiplier).toFixed(2)}</span> (X{bet.multiplier})
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded border inline-block mb-1 ${
                    isPending
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : isWon
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {bet.status}
                </span>
                <div className={`text-xs font-black ${isWon ? 'text-emerald-400' : isPending ? 'text-slate-300' : 'text-slate-500'}`}>
                  {isWon ? `+₹${bet.payout?.toFixed(2)}` : isPending ? 'Calculating...' : '-₹' + (bet.totalCost || bet.amount).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
