import { create } from "zustand";
import {
  getFilteredExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../services/expenseService";

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  // Fetch expenses by group + optional filters
  fetchExpenses: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await getFilteredExpenses(filters);
      set({ expenses: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Add new expense and refresh
  createExpense: async (expenseData) => {
    try {
      await addExpense(expenseData);
      await get().fetchExpenses({ groupId: expenseData.groupId });
    } catch (err) {
      console.error(err.message);
      set({ error: err.message });
    }
  },

  // Delete expense
  removeExpense: async (expenseId, groupId) => {
    try {
      await deleteExpense(expenseId);
      await get().fetchExpenses({ groupId });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Update expense
  editExpense: async (expenseId, updates, groupId) => {
    try {
      await updateExpense(expenseId, updates);
      await get().fetchExpenses({ groupId });
    } catch (err) {
      set({ error: err.message });
    }
  },

  calculateBalances: () => {
    const expenses = get().expenses;
    const balances = {};

    expenses.forEach((expense) => {
      const { createdBy, amount, split } = expense;

      // Add to payer
      balances[createdBy] = (balances[createdBy] || 0) + amount;

      // Subtract from each participant
      split.forEach(({ userId, amount: share }) => {
        balances[userId] = (balances[userId] || 0) - share;
      });
    });

    return balances;
  },

  clearExpenses: () => set({ expenses: [], error: null }),

  getBalances: () => {
    const expenses = get().expenses;
    const balances = {};

    expenses.forEach((e) => {
      const { createdBy, amount, split } = e;
      balances[createdBy] = (balances[createdBy] || 0) + Number(amount);
      split.forEach(({ userId, amount: share }) => {
        balances[userId] = (balances[userId] || 0) - Number(share || 0);
      });
    });
    return balances;
  },
}));
