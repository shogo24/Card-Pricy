export type Condition = 'nm' | 'played' | 'damaged';
export type Currency = 'CAD' | 'USD' | 'EUR';

export interface CardLegality {
  commander: string;
  modern: string;
  legacy: string;
  vintage: string;
  pioneer: string;
  standard: string;
}

export interface VendorPrice {
  vendor: string;
  logoColor: string;
  nm: number | null;
  played: number | null;
  damaged: number | null;
  inStock: boolean;
  url: string;
}

export interface MTGCard {
  id: string;
  name: string;
  set: string;
  setCode: string;
  collectorNumber: string;
  imageUrl: string;
  typeLine: string;
  oracleText: string;
  releaseDate: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  finish: 'foil' | 'nonfoil' | 'both';
  artist: string;
  manaCost: string;
  colors: string[];
  legalities: CardLegality;
  prices: VendorPrice[];
  alternateArt?: string;
}

export interface ListEntry {
  card: MTGCard;
  quantity: number;
  condition: Condition;
  selectedVendor?: string;
  customPrice?: number;
  customPriceCurrency?: Currency;
}

export interface RecentSearch {
  name: string;
  price: number;
  change: number;
  timestamp: number;
}
