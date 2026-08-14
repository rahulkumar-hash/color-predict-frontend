import { create } from 'zustand';
import apiClient from '../api/axios';
import { useAuthStore } from './useAuthStore';

const defaultGameState = {
  periodId: 'Loading...',
  timer: null,
  status: 'BETTING',
  serverSeedHash: ''
};

export const useGameStore = create((set, get) => ({
  gameState: defaultGameState,
  publicConfig: null,
  history: [],
  myBets: [],
  selectedBet: null,

  setGameState: (state) => set({ gameState: state || defaultGameState }),
  setSelectedBet: (bet) => set({ selectedBet: bet }),

  fetchPublicConfig: async () => {
    try {
      const res = await apiClient.get('/v1/game/public-config');
      if (res.data?.data) {
        set({ publicConfig: res.data.data });
      }
    } catch (err) {
      console.warn('Falling back to /v1/game/config:', err?.message);
      try {
        const fallbackRes = await apiClient.get('/v1/game/config');
        if (fallbackRes.data?.data) {
          set({ publicConfig: fallbackRes.data.data });
        }
      } catch (e) {
        console.error('Failed to fetch public config:', e);
      }
    }
  },

  fetchHistory: async () => {
    try {
      const res = await apiClient.get('/v1/game/history');
      if (res.data?.data) {
        const raw = res.data.data;
        const historyList = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.history)
          ? raw.history
          : [];
        set({ history: historyList });
      }
    } catch (err) {
      console.error('Failed to fetch game history:', err);
      set({ history: [] });
    }
  },

  fetchMyBets: async () => {
    try {
      const res = await apiClient.get('/v1/game/my-bets');
      if (res.data?.data) {
        const raw = res.data.data;
        const betsList = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.bets)
          ? raw.bets
          : [];
        set({ myBets: betsList });
      }
    } catch (err) {
      console.error('Failed to fetch user bets:', err);
      set({ myBets: [] });
    }
  },

  placeBet: async (betData) => {
    try {
      const res = await apiClient.post('/v1/game/bet', betData);
      get().fetchMyBets();

      const newBal = res.data?.data?.newBalance;
      if (newBal !== undefined) {
        useAuthStore.getState().updateBalance(newBal);
      } else {
        useAuthStore.getState().fetchProfile();
      }

      return { success: true, message: res.data?.message || 'Bet placed successfully!', data: res.data?.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to place bet' };
    }
  }
}));
