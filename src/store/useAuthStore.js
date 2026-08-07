import { create } from 'zustand';
import apiClient from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('cp_token') || null,
  sysConfig: {
    appName: 'COLOR PREDICT PRO',
    appLogoUrl: '',
    withdrawalsEnabled: true,
    upiId: 'merchant@upi',
    qrCodeUrl: ''
  },
  isAuthenticated: false,
  isBackendOnline: true,
  loading: true,

  fetchSysConfig: async () => {
    try {
      const res = await apiClient.get('/v1/game/config');
      if (res.data?.data) {
        set((state) => ({
          sysConfig: { ...state.sysConfig, ...res.data.data },
          isBackendOnline: true
        }));
      }
    } catch (err) {
      set({ isBackendOnline: false });
    }
  },

  fetchProfile: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return;
    }

    try {
      const res = await apiClient.get('/v1/user/me');
      if (res.data?.data) {
        set({
          user: res.data.data,
          isAuthenticated: true,
          isBackendOnline: true,
          loading: false
        });
      }
    } catch (err) {
      localStorage.removeItem('cp_token');
      set({ token: null, user: null, isAuthenticated: false, loading: false });
    }
  },

  sendOtp: async (identifier, purpose = 'REGISTER') => {
    try {
      const res = await apiClient.post('/v1/auth/send-otp', { identifier, purpose });
      return { success: true, message: res.data?.message, otpCode: res.data?.data?.otpCode };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to send OTP' };
    }
  },

  register: async (userData) => {
    try {
      const res = await apiClient.post('/v1/auth/register', userData);
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem('cp_token', token);
        set({ token, user, isAuthenticated: true });
        return { success: true, message: 'Account registered successfully!' };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  },

  verifyOtpLogin: async (identifier, otpCode) => {
    try {
      const res = await apiClient.post('/v1/auth/verify-otp', { identifier, otpCode });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem('cp_token', token);
        set({ token, user, isAuthenticated: true });
        return { success: true, message: 'OTP verified! Logged in.' };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'OTP verification failed' };
    }
  },

  loginWithPassword: async (identifier, password) => {
    try {
      const res = await apiClient.post('/v1/auth/login', { identifier, password });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem('cp_token', token);
        set({ token, user, isAuthenticated: true });
        return { success: true, user };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Invalid credentials' };
    }
  },

  forgotPassword: async (identifier, otpCode, newPassword) => {
    try {
      const res = await apiClient.post('/v1/auth/forgot-password', { identifier, otpCode, newPassword });
      return { success: true, message: res.data?.message || 'Password reset successfully!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Password reset failed' };
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await apiClient.patch('/v1/user/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      get().fetchProfile();
      return { success: true, message: res.data?.message || 'Profile updated successfully!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await apiClient.post('/v1/user/change-password', { currentPassword, newPassword });
      return { success: true, message: res.data?.message || 'Password changed successfully!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to change password' };
    }
  },

  fetchLoginHistory: async (page = 1) => {
    try {
      const res = await apiClient.get(`/v1/auth/login-history?page=${page}&limit=5`);
      return { success: true, data: res.data?.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to fetch login history' };
    }
  },

  logout: () => {
    localStorage.removeItem('cp_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateBalance: (newBalance) => {
    set((state) => ({
      user: state.user ? { ...state.user, balance: newBalance } : null
    }));
  }
}));
