import React from 'react';
import { vibrateDevice } from './WebViewBridge';

export default function ColorPicker({ onSelect, isFrozen, isClosed }) {
  const isDisabled = isFrozen || isClosed;

  const handlePick = (selection) => {
    if (isDisabled) return;
    vibrateDevice(40);
    onSelect(selection);
  };

  const getNumberStyle = (num) => {
    if (num === 0) return 'bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-purple-600/30 border-purple-500/50 text-white';
    if (num === 5) return 'bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-purple-600/30 border-purple-500/50 text-white';
    if ([1, 3, 7, 9].includes(num)) return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
    return 'bg-rose-500/10 border-rose-500/40 text-rose-400';
  };

  return (
    <div className={`glass-card transition-opacity duration-200 ${isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
        COLOR SELECTION (2X - 4.5X)
      </span>

      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => handlePick('Green')}
          disabled={isDisabled}
          className="h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 btn-touch flex flex-col items-center justify-center disabled:opacity-50"
        >
          <span>Join Green</span>
          <span className="text-[10px] font-bold opacity-80">2X Payout</span>
        </button>

        <button
          onClick={() => handlePick('Violet')}
          disabled={isDisabled}
          className="h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-black text-sm shadow-lg shadow-purple-600/20 btn-touch flex flex-col items-center justify-center disabled:opacity-50"
        >
          <span>Join Violet</span>
          <span className="text-[10px] font-bold opacity-80">4.5X Payout</span>
        </button>

        <button
          onClick={() => handlePick('Red')}
          disabled={isDisabled}
          className="h-14 bg-gradient-to-br from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-black text-sm shadow-lg shadow-rose-600/20 btn-touch flex flex-col items-center justify-center disabled:opacity-50"
        >
          <span>Join Red</span>
          <span className="text-[10px] font-bold opacity-80">2X Payout</span>
        </button>
      </div>

      <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-4 mb-2">
        DIRECT NUMBER PREDICT (9X PAYOUT)
      </span>

      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePick(num)}
            disabled={isDisabled}
            className={`h-12 border rounded-xl font-black text-lg btn-touch flex items-center justify-center shadow-md disabled:opacity-50 ${getNumberStyle(num)}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
