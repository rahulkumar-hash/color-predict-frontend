import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gamepad2, TrendingUp, Receipt, ArrowDownRight, User } from 'lucide-react';

export default function BottomNav({ onOpenDeposit }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-t border-slate-800 px-1 py-1.5 shadow-2xl">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {/* Game Arena */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Game</span>
        </NavLink>

        {/* Trends */}
        <NavLink
          to="/trends"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px]">Trends</span>
        </NavLink>

        {/* Deposit Quick Action */}
        <button
          onClick={onOpenDeposit}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all btn-touch text-emerald-400 font-extrabold"
        >
          <div className="w-7 h-7 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center shadow-md shadow-emerald-500/10">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px]">Deposit</span>
        </button>

        {/* My Bets (Prominent Mobile Access) */}
        <NavLink
          to="/bets"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all btn-touch ${
              isActive ? 'text-amber-400 font-black scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">My Bets</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all btn-touch ${
              isActive ? 'text-emerald-400 font-black scale-105' : 'text-slate-400 font-medium hover:text-slate-200'
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
