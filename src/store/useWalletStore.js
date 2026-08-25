import { create } from 'zustand';
import apiClient from '../api/axios';

export const useWalletStore = create((set, get) => ({
  recharging: false,
  withdrawing: false,
  withdrawalHistory: [],
  historyLoading: false,
  transactions: [],
  transactionsLoading: false,

  fetchWithdrawalHistory: async () => {
    set({ historyLoading: true });
    try {
      const res = await apiClient.get('/v1/wallet/history');
      if (res.data?.data?.requests) {
        set({ withdrawalHistory: res.data.data.requests, historyLoading: false });
      } else {
        set({ historyLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch user withdrawal history:', err);
      set({ historyLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ transactionsLoading: true });
    try {
      const res = await apiClient.get('/v1/wallet/transactions');
      if (res.data?.data?.transactions) {
        set({ transactions: res.data.data.transactions, transactionsLoading: false });
      } else {
        set({ transactionsLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch user transactions:', err);
      set({ transactionsLoading: false });
    }
  },

  submitRecharge: async (amount, utrNumber) => {
    set({ recharging: true });
    try {
      const res = await apiClient.post('/v1/wallet/deposit', { amount, utrNumber });
      set({ recharging: false });
      get().fetchTransactions();
      try {
        const { useAuthStore } = await import('./useAuthStore');
        useAuthStore.getState().fetchProfile();
      } catch (e) {}
      return { success: true, message: res.data?.message || 'Recharge request submitted successfully!' };
    } catch (err) {
      set({ recharging: false });
      return { success: false, error: err.response?.data?.message || 'Recharge request failed' };
    }
  },

  autoRechargeWallet: async (amount, txnId, approvalRefNo, responseCode) => {
    try {
      const res = await apiClient.post('/v1/wallet/auto-recharge', {
        amount,
        txnId,
        approvalRefNo,
        responseCode
      });
      get().fetchTransactions();
      try {
        const { useAuthStore } = await import('./useAuthStore');
        useAuthStore.getState().fetchProfile();
      } catch (e) {}
      return {
        success: true,
        message: res.data?.message || 'Wallet auto-recharged successfully!',
        newBalance: res.data?.data?.newBalance
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Auto-recharge failed'
      };
    }
  },

  submitWithdrawal: async (amount, upiId, bankDetails) => {
    set({ withdrawing: true });
    try {
      const details = (upiId || bankDetails || '').trim();
      const res = await apiClient.post('/v1/wallet/withdraw', {
        amount,
        upiId: details,
        bankInfo: details,
        bankDetails: details
      });
      set({ withdrawing: false });
      get().fetchWithdrawalHistory();
      get().fetchTransactions();
      try {
        const { useAuthStore } = await import('./useAuthStore');
        useAuthStore.getState().fetchProfile();
      } catch (e) {}
      return {
        success: true,
        message: res.data?.message || 'Withdrawal request submitted successfully!',
        newBalance: res.data?.data?.newBalance
      };
    } catch (err) {
      set({ withdrawing: false });
      return { success: false, error: err.response?.data?.message || 'Withdrawal request failed' };
    }
  },

  createPaymentOrder: async (amount, paymentMethod) => {
    try {
      const res = await apiClient.post('/v1/payment/create-order', { amount, paymentMethod });
      return { success: true, data: res.data?.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Payment order creation failed' };
    }
  },

  verifyRazorpayPayment: async (payload) => {
    try {
      const refNumber = payload?.txnId || payload?.razorpay_order_id || payload;
      const rzpPayId = payload?.razorpay_payment_id || payload;

      const res = await apiClient.post('/v1/payment/webhook/razorpay', {
        orderId: refNumber,
        utrNumber: refNumber,
        razorpayPaymentId: rzpPayId,
        status: 'APPROVED'
      });
      try {
        const { useAuthStore } = await import('./useAuthStore');
        useAuthStore.getState().fetchProfile();
      } catch (e) {}
      return { success: true, message: res.data?.message || 'Payment verified successfully!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Verification failed' };
    }
  }
}));
