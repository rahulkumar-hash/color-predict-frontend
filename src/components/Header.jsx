import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Wallet, User, HelpCircle, LogOut, Gift, Headphones } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import ConfirmModal from './ConfirmModal';

export default function Header({ onOpenDeposit, onOpenRules, onOpenSupport }) {
  const { user, sysConfig, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 py-2.5 shadow-xl transition-all mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            {sysConfig.appLogoUrl ? (
              <img
                src={sysConfig.appLogoUrl}
                alt={sysConfig.appName || 'Logo'}
                className="h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[160px] object-contain shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-emerald-400 via-purple-500 to-rose-500 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-md shadow-emerald-500/20 shrink-0">
                C
              </div>
            )}
            <div className="flex flex-col justify-center">
              <h1 className="font-black text-xs sm:text-base tracking-tight leading-tight text-white drop-shadow-sm">
                {sysConfig.appName || 'COLOR PREDICT PRO'}
              </h1>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-extrabold block leading-none">
                Provably Fair Arena
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              Game Arena
            </NavLink>
            <NavLink
              to="/trends"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              Trends
            </NavLink>
            <NavLink
              to="/bets"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              My Bets
            </NavLink>
            <NavLink
              to="/referral"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  isActive ? 'bg-purple-600 text-white shadow-md font-black' : 'text-purple-400 hover:text-purple-300'
                }`
              }
            >
              <Gift className="w-3.5 h-3.5" /> Refer & Earn
            </NavLink>
          </nav>

          {/* Wallet Balance & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Wallet Balance Badge */}
            <div
              onClick={onOpenDeposit}
              className="flex cursor-pointer items-center gap-1.5 bg-slate-900/90 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-bold transition-all hover:border-amber-400 hover:bg-slate-800/80 btn-touch shadow-sm"
              title="Click to Deposit"
            >
              <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-400 font-mono font-black text-xs sm:text-sm">
                ₹{user?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>

            {/* Support Desk Button */}
            <button
              onClick={onOpenSupport}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-xl btn-touch"
              title="24/7 Help & Support Desk"
            >
              <Headphones className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={onOpenRules}
              className="hidden sm:flex p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl btn-touch"
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

            {/* Desktop & Tablet Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="hidden sm:flex p-2 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 rounded-xl btn-touch"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to log out of your account?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
