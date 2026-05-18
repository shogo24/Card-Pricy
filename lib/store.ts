'use client';
import { create } from 'zustand';
import { MTGCard, ListEntry, Condition, Currency, RecentSearch } from './types';

interface AppStore {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  list: ListEntry[];
  addToList: (card: MTGCard, qty: number, condition: Condition, vendor?: string, customPrice?: number, customPriceCurrency?: Currency) => void;
  removeFromList: (cardId: string) => void;
  updateQuantity: (cardId: string, qty: number) => void;
  recentSearches: RecentSearch[];
  addRecentSearch: (r: RecentSearch) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currency: 'CAD',
  setCurrency: (currency) => set({ currency }),
  list: [],
  addToList: (card, qty, condition, vendor, customPrice, customPriceCurrency) =>
    set((state) => {
      const existing = state.list.find(e => e.card.id === card.id);
      const resolvedCustomPrice = customPrice ?? existing?.customPrice;
      const resolvedCustomPriceCurrency = customPrice !== undefined ? customPriceCurrency ?? state.currency : existing?.customPriceCurrency;
      const resolvedVendor = vendor ?? existing?.selectedVendor;

      if (existing) {
        return {
          list: state.list.map(e =>
            e.card.id === card.id
              ? {
                  ...e,
                  quantity: e.quantity + qty,
                  condition,
                  selectedVendor: resolvedVendor,
                  customPrice: resolvedCustomPrice,
                  customPriceCurrency: resolvedCustomPriceCurrency,
                }
              : e
          ),
        };
      }
      return { list: [...state.list, { card, quantity: qty, condition, selectedVendor: resolvedVendor, customPrice: resolvedCustomPrice, customPriceCurrency: resolvedCustomPriceCurrency }] };
    }),
  removeFromList: (cardId) =>
    set((state) => ({ list: state.list.filter(e => e.card.id !== cardId) })),
  updateQuantity: (cardId, qty) =>
    set((state) => ({ list: state.list.map(e => e.card.id === cardId ? { ...e, quantity: qty } : e) })),
  recentSearches: [],
  addRecentSearch: (r) =>
    set((state) => ({
      recentSearches: [r, ...state.recentSearches.filter(s => s.name !== r.name)].slice(0, 10)
    })),
}));
