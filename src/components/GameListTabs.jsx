import React, { useState } from 'react';
import { Gamepad2, Zap, Clock } from 'lucide-react';
import { vibrateDevice } from './WebViewBridge';

export default function GameListTabs({ activeTab, onTabChange, activeDuration, onDurationChange }) {
  const gameModes = [
    { id: 'parity', label: 'Parity', subtitle: 'Standard' },
    { id: 'sapre', label: 'Sapre', subtitle: 'Fast' },
    { id: 'bcone', label: 'Bcone', subtitle: 'Pro' },
    { id: 'emerd', label: 'Emerd', subtitle: 'VIP' }
  ];

  const durations = [
    { seconds: 30, label: '30s' },
    { seconds: 60, label: '1Min' },
    { seconds: 180, label: '3Min' },
    { seconds: 300, label: '5Min' }
  ];

  return (
    <div className="space-y-3">
      {/* Game Mode Selector Tabs (Parity, Sapre, Bcone, Emerd) */}
      <div className="glass-card p-1.5 flex items-center justify-between gap-1.5 overflow-x-auto border border-slate-800 rounded-2xl">
        {gameModes.map(mode => {
          const isActive = activeTab === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                vibrateDevice(30);
                onTabChange(mode.id);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl transition-all btn-touch flex flex-col items-center justify-center min-w-[75px] ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 font-bold'
              }`}
            >
              <span className="text-xs uppercase tracking-wider block font-black">{mode.label}</span>
              <span className={`text-[9px] block ${isActive ? 'text-slate-950 font-extrabold' : 'text-slate-500'}`}>
                {mode.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Arena Timer Duration Selector (30s, 1Min, 3Min, 5Min) */}
      <div className="glass-card p-2 flex items-center justify-between gap-2 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Arena Mode:
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {durations.map(d => {
            const isActive = activeDuration === d.seconds;
            return (
              <button
                key={d.seconds}
                onClick={() => {
                  vibrateDevice(30);
                  onDurationChange(d.seconds);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all btn-touch ${
                  isActive
                    ? 'bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
