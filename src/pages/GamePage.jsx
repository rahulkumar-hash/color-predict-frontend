import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import Header from '../components/Header';
import TimerCard from '../components/TimerCard';
import ColorPicker from '../components/ColorPicker';
import BetModal from '../components/BetModal';
import TrendChart from '../components/TrendChart';
import HistoryTable from '../components/HistoryTable';
import DepositModal from '../components/DepositModal';
import RulesModal from '../components/RulesModal';
import SupportModal from '../components/SupportModal';
import BottomNav from '../components/BottomNav';
import { vibrateDevice } from '../components/WebViewBridge';

export default function GamePage() {
  const { user, updateBalance, fetchProfile } = useAuthStore();
  const {
    gameState,
    setGameState,
    history,
    fetchHistory,
    fetchMyBets,
    fetchPublicConfig,
    publicConfig,
    selectedBet,
    setSelectedBet
  } = useGameStore();

  const location = useLocation();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Real-Time Socket Connection
  useEffect(() => {
    fetchPublicConfig();
    fetchHistory();

    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const hostname = window.location.hostname || 'localhost';
      return `${protocol}//${hostname}:5000`;
    };

    const targetSocketUrl = getSocketUrl();
    console.log('🔌 Connecting Socket.IO to target URL:', targetSocketUrl);

    const socket = io(targetSocketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    const userId = user?._id || user?.id;

    const joinRoom = () => {
      if (userId) {
        console.log('🚪 [Socket] Joining User Room: user_' + userId);
        socket.emit('joinUserRoom', userId.toString());
      }
    };

    socket.on('connect', () => {
      console.log('✅ [Socket] Connected successfully with ID:', socket.id);
      joinRoom();
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [Socket] Connection Error:', err);
    });

    // Re-emit room join when user profile loads
    joinRoom();

    socket.on('gameTick', (data) => {
      if (data) setGameState(data);
    });

    socket.on('roundResult', (data) => {
      console.log('📢 [Socket] roundResult Event Received:', data);
      fetchHistory();
      fetchMyBets();
      fetchProfile();

      const num = data?.winningNumber ?? data?.result?.number;
      const colors = data?.colors || data?.result?.colors || [];

      if (num !== undefined && num !== null && data?.periodId) {
        vibrateDevice(300);
        toast(
          `🎯 Period #${data.periodId} Result: Number ${num} (${colors.join(' + ')})`,
          {
            icon: '🎲',
            duration: 5000,
            style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #6366f1' }
          }
        );
      }
    });

    socket.on('betResult', (payload) => {
      console.log('💰 [Socket] betResult Event Received:', payload);
      if (payload.isWin && payload.payout > 0) {
        // Party Popper Confetti + Win Celebration Toast ONLY when user wins!
        vibrateDevice(600);
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 WINNER! You won ₹${payload.payout.toFixed(2)} on Period #${payload.periodId}!`, { duration: 6000 });
      }

      if (payload.newBalance !== undefined) {
        updateBalance(payload.newBalance);
      }
    });

    socket.on('walletUpdate', (payload) => {
      console.log('💳 [Socket] walletUpdate Event Received:', payload);
      if (payload?.balance !== undefined) {
        updateBalance(payload.balance);
      }
    });

    return () => socket.disconnect();
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (location.state?.openDeposit) {
      setShowDepositModal(true);
    }
  }, [location.state]);

  const handleSelectOption = (selection) => {
    if (gameState.status === 'FROZEN') {
      toast.error('Betting is locked! Period calculation in progress.');
      return;
    }
    if (gameState.status === 'CLOSED') {
      toast.error('Arena is closed by Master Admin.');
      return;
    }
    setSelectedBet({ selection });
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center">
      <Header
        onOpenDeposit={() => setShowDepositModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      <main className="w-full max-w-7xl px-3 sm:px-6 space-y-4">
        {/* 2-Column Split Layout: Left = Bet Area, Right = Trend Analytics + History Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Side Column: Timer Card & Place Bet Color Picker */}
          <div className="lg:col-span-6 space-y-4">
            <TimerCard
              gameState={gameState}
              publicConfig={publicConfig}
            />

            <ColorPicker
              onSelect={handleSelectOption}
              isDisabled={gameState.status === 'FROZEN' || gameState.status === 'CLOSED'}
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <TrendChart history={history} limit={10} />

            <HistoryTable history={history} limit={5} />
          </div>
        </div>
      </main>

      {selectedBet && (
        <BetModal
          isOpen={!!selectedBet}
          betInfo={selectedBet}
          onClose={() => setSelectedBet(null)}
          onSuccess={() => setSelectedBet(null)}
        />
      )}

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      <BottomNav
        onOpenDeposit={() => setShowDepositModal(true)}
      />
    </div>
  );
}
