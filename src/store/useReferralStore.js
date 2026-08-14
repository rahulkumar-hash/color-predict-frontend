import { create } from 'zustand';
import apiClient from '../api/axios';

export const useReferralStore = create((set, get) => ({
  referralData: null,
  loading: false,
  applying: false,

  fetchReferralInfo: async () => {
    set({ loading: true });
    try {
      const res = await apiClient.get('/v1/referral/info');
      if (res.data?.data) {
        set({ referralData: res.data.data, loading: false });
      }
    } catch (err) {
      console.error('[Referral] Failed to fetch referral info:', err);
      set({ loading: false });
    }
  },

  applyReferralCode: async (referralCode) => {
    set({ applying: true });
    try {
      const res = await apiClient.post('/v1/referral/apply', { referralCode });
      set({ applying: false });
      return { success: true, message: res.data?.message || 'Referral code applied!' };
    } catch (err) {
      set({ applying: false });
      return { success: false, error: err.response?.data?.message || 'Invalid referral code' };
    }
  }
}));
