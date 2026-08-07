import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Wallet, User, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Header({ onOpenDeposit, onOpenRules }) {
  const { user, sysConfig } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="glass-card mb-4 px-4 sm:px-6 lg:px-8 py-3  flex items-center justify-between sticky top-2 z-40 shadow-xl w-full">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-emerald-400 via-purple-500 to-rose-500 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-md shadow-emerald-500/20 shrink-0">
          {sysConfig.appLogoUrl ? (
            <img src={sysConfig.appLogoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          ) : (
            'C'
          )}
        </div>
        <div>
          <h1 className="font-extrabold text-xs sm:text-base tracking-tight leading-tight text-white">
            {sysConfig.appName || 'COLOR PREDICT PRO'}
          </h1>
          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold block">Provably Fair Arena</span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all ${
              isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          Game Arena
        </NavLink>
        <NavLink
          to="/trends"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all ${
              isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          Trends & History
        </NavLink>
        <NavLink
          to="/bets"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg transition-all ${
              isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          My Bets
        </NavLink>
      </nav>

      {/* Wallet Balance & Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet Balance Badge - Triggers Deposit Modal on Every Page */}
        <div
          onClick={onOpenDeposit}
          className="flex cursor-pointer items-center gap-1.5 bg-slate-900/90 px-3 sm:px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold transition-all hover:border-slate-700 hover:bg-slate-800/80 btn-touch"
          title="Click to Deposit"
        >
          <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-400 font-mono font-black text-xs sm:text-sm">₹{user?.balance?.toFixed(2) || '0.00'}</span>
        </div>

        <button
          onClick={onOpenRules}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl btn-touch"
          title="Game Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="p-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 rounded-xl btn-touch"
          title="My Profile"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
