import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, TrendingUp, History, ArrowDownRight, User } from 'lucide-react';

export default function BottomNav({ onOpenDeposit }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-500 font-medium hover:text-slate-300'
            }`
          }
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Game</span>
        </NavLink>

        <NavLink
          to="/trends"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-500 font-medium hover:text-slate-300'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Trends</span>
        </NavLink>

        <button
          onClick={onOpenDeposit}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all btn-touch text-emerald-400 font-extrabold"
        >
          <div className="w-7 h-7 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px]">Deposit</span>
        </button>

        <NavLink
          to="/bets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-500 font-medium hover:text-slate-300'
            }`
          }
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Bets</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-500 font-medium hover:text-slate-300'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </div>
  );
}
