import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import TrendsPage from './pages/TrendsPage';
import BetsPage from './pages/BetsPage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';

export default function App() {
  const { isAuthenticated, loading, fetchProfile, fetchSysConfig } = useAuthStore();

  useEffect(() => {
    fetchSysConfig();
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center min-w-[300px] bg-[#070b14]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-400 via-purple-500 to-rose-500 rounded-2xl animate-spin mx-auto"></div>
          <span className="text-xs font-extrabold text-slate-400 block tracking-widest uppercase">Initializing Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto bg-[#070b14] text-slate-100 antialiased">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#ffffff',
            border: '1px solid #374151',
            fontSize: '12px',
            borderRadius: '12px'
          }
        }}
      />
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/bets" element={<BetsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}
