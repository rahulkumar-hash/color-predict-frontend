import React from 'react';
import { Clock, ShieldCheck, Lock, Power } from 'lucide-react';

export default function TimerCard({ gameState = {}, publicConfig = {}, gameMode = 'parity' }) {
  const {
    periodId = '---',
    timer = 60,
    status = 'BETTING',
    serverSeedHash = '',
    roundDuration = 60,
    message = ''
  } = gameState || {};

  const minutes = String(Math.floor((timer || 0) / 60)).padStart(2, '0');
  const seconds = String((timer || 0) % 60).padStart(2, '0');
  const isFrozen = status === 'FROZEN';
  const isClosed = status === 'CLOSED';

  const durationMins = Math.round((roundDuration || 60) / 60);
  const arenaLabel = (roundDuration || 60) < 60 ? `${roundDuration}-SEC` : `${durationMins}-MIN`;
  const modeTitle = (gameMode || 'parity').toUpperCase();

  const startTime = publicConfig?.gameStartTime || '00:00';
  const endTime = publicConfig?.gameEndTime || '23:59';

  return (
    <div className="glass-card space-y-4 overflow-hidden w-full">
      {/* Arena Title & Betting Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs tracking-wider">
          <Clock className="w-4 h-4 shrink-0" /> {modeTitle} {arenaLabel} ARENA
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase border shrink-0 ${
          isClosed
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            : isFrozen
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
        }`}>
          {isClosed ? 'GAME CLOSED' : isFrozen ? 'BETTING CLOSED' : 'BETTING OPEN'}
        </span>
      </div>

      {/* Period Telemetry & Timer Countdown Box */}
      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
        <div className="min-w-0 flex-1 space-y-1 pr-1">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest block">PERIOD NUMBER</span>
            <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono tracking-tight block truncate">
              {periodId || '---'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-mono min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate block max-w-full">
              SHA-256 Hash: <span className="text-slate-300">{serverSeedHash ? `${serverSeedHash.slice(0, 12)}...` : '4a8f82fe5e34...'}</span>
            </span>
          </div>
        </div>

        {/* Green Large Countdown Box */}
        <div className={`px-3 sm:px-5 py-2 rounded-2xl border flex items-center gap-1.5 sm:gap-2 shadow-lg shrink-0 ${
          isClosed
            ? 'border-amber-500/50 bg-amber-950/30'
            : isFrozen
            ? 'border-rose-500/50 bg-rose-950/30'
            : 'border-emerald-500/40 bg-emerald-950/30'
        }`}>
          <Clock className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isClosed ? 'text-amber-400' : isFrozen ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
          <span className={`text-xl sm:text-2xl md:text-3xl font-black font-mono tracking-wider ${
            isClosed ? 'text-amber-400' : isFrozen ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {minutes}:{seconds}
          </span>
        </div>
      </div>

      {isClosed && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center space-y-1">
          <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-1.5 uppercase">
            <Power className="w-3.5 h-3.5" /> Arena Closed
          </span>
          <p className="text-[11px] text-amber-200/80">
            Official operational hours: <span className="font-mono font-bold text-amber-400">{startTime}</span> to <span className="font-mono font-bold text-amber-400">{endTime}</span>.
          </p>
        </div>
      )}

      {isFrozen && !isClosed && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-center space-y-1">
          <span className="text-xs font-black text-rose-400 flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <Lock className="w-3.5 h-3.5" /> Betting Locked (10s Calculation Window)
          </span>
          <p className="text-[11px] text-rose-200/80">
            Round results are currently being calculated by Provably Fair RNG.
          </p>
        </div>
      )}

      {message && !isFrozen && !isClosed && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-xl text-xs text-blue-300 text-center">
          {message}
        </div>
      )}
    </div>
  );
}
