'use client';
import { create } from 'zustand';
import { MTGCard, ListEntry, Condition, Currency, RecentSearch } from './types';

interface AppStore {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  list: ListEntry[];
  addToList: (card: MTGCard, qty: number, condition: Condition, finish: 'foil' | 'nonfoil', vendor?: string, customPrice?: number, customPriceCurrency?: Currency) => void;
  removeFromList: (entry: ListEntry) => void;
  updateQuantity: (entry: ListEntry, qty: number) => void;
  clearList: () => void;
  recentSearches: RecentSearch[];
  addRecentSearch: (r: RecentSearch) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currency: 'CAD',
  setCurrency: (currency) => set({ currency }),
  list: [],
  addToList: (card, qty, condition, finish, vendor, customPrice, customPriceCurrency) =>
    set((state) => {
      const existing = state.list.find(e =>
        e.card.id === card.id &&
        e.condition === condition &&
        e.finish === finish &&
        e.selectedVendor === vendor &&
        e.customPrice === customPrice &&
        (customPrice === undefined || e.customPriceCurrency === (customPriceCurrency ?? state.currency))
      );
      const resolvedCustomPrice = customPrice ?? existing?.customPrice;
      const resolvedCustomPriceCurrency = customPrice !== undefined ? customPriceCurrency ?? state.currency : existing?.customPriceCurrency;
      const resolvedVendor = vendor ?? existing?.selectedVendor;

      if (existing) {
        return {
          list: state.list.map(e =>
            e.card.id === card.id &&
            e.condition === condition &&
            e.finish === finish &&
            e.selectedVendor === vendor &&
            e.customPrice === customPrice &&
            (customPrice === undefined || e.customPriceCurrency === (customPriceCurrency ?? state.currency))
              ? {
                  ...e,
                  quantity: e.quantity + qty,
                  condition,
                  finish,
                  selectedVendor: resolvedVendor,
                  customPrice: resolvedCustomPrice,
                  customPriceCurrency: resolvedCustomPriceCurrency,
                }
              : e
          ),
        };
      }
      return { list: [...state.list, { card, quantity: qty, condition, finish, selectedVendor: resolvedVendor, customPrice: resolvedCustomPrice, customPriceCurrency: resolvedCustomPriceCurrency }] };
    }),
  removeFromList: (entry) =>
    set((state) => ({
      list: state.list.filter(e =>
        !(e.card.id === entry.card.id &&
          e.condition === entry.condition &&
          e.finish === entry.finish &&
          e.selectedVendor === entry.selectedVendor &&
          e.customPrice === entry.customPrice &&
          e.customPriceCurrency === entry.customPriceCurrency)
      )
    })),
  updateQuantity: (entry, qty) =>
    set((state) => ({
      list: state.list.map(e =>
        e.card.id === entry.card.id &&
        e.condition === entry.condition &&
        e.finish === entry.finish &&
        e.selectedVendor === entry.selectedVendor &&
        e.customPrice === entry.customPrice &&
        e.customPriceCurrency === entry.customPriceCurrency
          ? { ...e, quantity: qty }
          : e
      )
    })),
  clearList: () => set({ list: [] }),
  recentSearches: [],
  addRecentSearch: (r) =>
    set((state) => ({
      recentSearches: [r, ...state.recentSearches.filter(s => s.name !== r.name)].slice(0, 10)
    })),
}));
