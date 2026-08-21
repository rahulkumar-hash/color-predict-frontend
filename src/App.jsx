import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from './store/useAuthStore';
import { useGameStore } from './store/useGameStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamePage from './pages/GamePage';
import TrendsPage from './pages/TrendsPage';
import BetsPage from './pages/BetsPage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import SecurityPage from './pages/SecurityPage';
import LoginHistoryPage from './pages/LoginHistoryPage';

export default function App() {
  const { user, isAuthenticated, loading, fetchProfile, fetchSysConfig, updateBalance } = useAuthStore();
  const { setGameState, fetchHistory, fetchMyBets } = useGameStore();

  useEffect(() => {
    fetchSysConfig();
    fetchProfile();
  }, []);

  // Global Real-Time Socket Connection for Instant Balance & Game Sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const hostname = window.location.hostname || 'localhost';
      return `${protocol}//${hostname}:5000`;
    };

    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    const userId = user?._id || user?.id;

    socket.on('connect', () => {
      if (userId) {
        socket.emit('joinUserRoom', userId.toString());
      }
    });

    socket.on('gameTick', (data) => {
      if (data) setGameState(data);
    });

    socket.on('walletUpdate', (payload) => {
      if (payload?.balance !== undefined) {
        updateBalance(payload.balance);
      }
      fetchProfile();
    });

    socket.on('balanceUpdate', (payload) => {
      if (payload?.balance !== undefined) {
        updateBalance(payload.balance);
      }
      fetchProfile();
    });

    socket.on('sysConfigUpdate', (payload) => {
      if (payload) {
        const updatedConfig = payload.config || payload;
        const cleanData = updatedConfig._doc || updatedConfig;
        useAuthStore.setState((state) => ({
          sysConfig: { ...state.sysConfig, ...cleanData }
        }));
      }
      fetchSysConfig();
    });

    socket.on('roundResult', () => {
      fetchHistory();
      fetchMyBets();
      fetchProfile();
    });

    return () => socket.disconnect();
  }, [isAuthenticated, user?._id, user?.id]);

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
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
            <Route path="/payouts" element={<WithdrawalsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/change-password" element={<SecurityPage />} />
            <Route path="/login-history" element={<LoginHistoryPage />} />
            <Route path="/sessions" element={<LoginHistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}
