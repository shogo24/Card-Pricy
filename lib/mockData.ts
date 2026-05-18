import { MTGCard, RecentSearch } from './types';

export const MOCK_CARDS: MTGCard[] = [
  {
    id: 'lightning-bolt-m11',
    name: 'Lightning Bolt',
    set: 'Magic 2011',
    setCode: 'M11',
    collectorNumber: '149',
    imageUrl: 'https://cards.scryfall.io/normal/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg',
    typeLine: 'Instant',
    oracleText: 'Lightning Bolt deals 3 damage to any target.',
    releaseDate: '2010-07-16',
    rarity: 'common',
    finish: 'nonfoil',
    artist: 'Christopher Moeller',
    manaCost: '{R}',
    colors: ['R'],
    legalities: { commander: 'legal', modern: 'legal', legacy: 'legal', vintage: 'legal', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 26.00, played: 19.50, damaged: 10.00, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 24.99, played: 18.00, damaged: 9.50, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 27.50, played: 20.00, damaged: null, inStock: true, url: '#' },
    ],
  },
  {
    id: 'black-lotus-lea',
    name: 'Black Lotus',
    set: 'Limited Edition Alpha',
    setCode: 'LEA',
    collectorNumber: '232',
    imageUrl: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    typeLine: 'Artifact',
    oracleText: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
    releaseDate: '1993-08-05',
    rarity: 'rare',
    finish: 'nonfoil',
    artist: 'Christopher Rush',
    manaCost: '{0}',
    colors: [],
    legalities: { commander: 'banned', modern: 'not_legal', legacy: 'banned', vintage: 'restricted', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 176000.00, played: 95000.00, damaged: 45000.00, inStock: false, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 180000.00, played: 98000.00, damaged: null, inStock: false, url: '#' },
    ],
  },
  {
    id: 'counterspell-mmq',
    name: 'Counterspell',
    set: 'Commander Legends',
    setCode: 'CMR',
    collectorNumber: '87',
    imageUrl: 'https://cards.scryfall.io/normal/front/8/5/8567e0e5-a5a3-4839-ac2a-3006b39b37df.jpg',
    typeLine: 'Instant',
    oracleText: 'Counter target spell.',
    releaseDate: '2020-11-20',
    rarity: 'uncommon',
    finish: 'both',
    artist: 'Zack Stella',
    manaCost: '{U}{U}',
    colors: ['U'],
    legalities: { commander: 'legal', modern: 'legal', legacy: 'legal', vintage: 'legal', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 4.50, played: 3.00, damaged: 1.50, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 4.25, played: 2.80, damaged: 1.25, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 4.75, played: 3.20, damaged: 1.75, inStock: true, url: '#' },
    ],
  },
  {
    id: 'sol-ring-c11',
    name: 'Sol Ring',
    set: "Commander 2011",
    setCode: 'CMD',
    collectorNumber: '236',
    imageUrl: 'https://cards.scryfall.io/normal/front/3/2/32b87158-e729-4aad-b4fb-5dba14c68863.jpg',
    typeLine: 'Artifact',
    oracleText: '{T}: Add {C}{C}.',
    releaseDate: '2011-09-18',
    rarity: 'uncommon',
    finish: 'nonfoil',
    artist: 'Mike Bierek',
    manaCost: '{1}',
    colors: [],
    legalities: { commander: 'legal', modern: 'not_legal', legacy: 'banned', vintage: 'restricted', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 2.50, played: 1.80, damaged: 0.80, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 2.25, played: 1.60, damaged: 0.75, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 2.75, played: 2.00, damaged: null, inStock: true, url: '#' },
    ],
  },
  {
    id: 'teferi-hero',
    name: 'Teferi, Hero of Dominaria',
    set: 'Dominaria',
    setCode: 'DOM',
    collectorNumber: '207',
    imageUrl: 'https://cards.scryfall.io/normal/front/0/2/02ea5ddc-a6a7-4b9e-a670-b9f2a2db6199.jpg',
    typeLine: 'Legendary Planeswalker — Teferi',
    oracleText: '+1: Draw a card. At the beginning of the next end step, untap up to two lands.\n−3: Put target nonland permanent into its owner\'s library third from the top.\n−8: You get an emblem with "Whenever you draw a card, exile target permanent an opponent controls."',
    releaseDate: '2018-04-27',
    rarity: 'mythic',
    finish: 'both',
    artist: 'Chris Rallis',
    manaCost: '{3}{W}{U}',
    colors: ['W', 'U'],
    legalities: { commander: 'legal', modern: 'legal', legacy: 'legal', vintage: 'legal', pioneer: 'legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 28.00, played: 21.00, damaged: 10.00, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 26.50, played: 19.50, damaged: 9.00, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 29.00, played: 22.00, damaged: null, inStock: false, url: '#' },
    ],
  },
  {
    id: 'rhystic-study',
    name: 'Rhystic Study',
    set: 'Prophecy',
    setCode: 'PCY',
    collectorNumber: '48',
    imageUrl: 'https://cards.scryfall.io/normal/front/0/7/07b898c2-2fbc-4a2c-a60a-c7e2bddf4bb8.jpg',
    typeLine: 'Enchantment',
    oracleText: 'Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.',
    releaseDate: '2000-06-05',
    rarity: 'common',
    finish: 'nonfoil',
    artist: 'Christopher Moeller',
    manaCost: '{2}{U}',
    colors: ['U'],
    legalities: { commander: 'legal', modern: 'not_legal', legacy: 'legal', vintage: 'legal', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 48.00, played: 36.00, damaged: 18.00, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 46.50, played: 34.00, damaged: 16.00, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 50.00, played: 37.00, damaged: null, inStock: true, url: '#' },
    ],
  },
  {
    id: 'mana-crypt',
    name: 'Mana Crypt',
    set: 'Eternal Masters',
    setCode: 'EMA',
    collectorNumber: '4',
    imageUrl: 'https://cards.scryfall.io/normal/front/4/d/4d960186-4559-4af4-a5d9-a678f38abb43.jpg',
    typeLine: 'Artifact',
    oracleText: 'At the beginning of your upkeep, flip a coin. If you lose the flip, Mana Crypt deals 3 damage to you.\n{T}: Add {C}{C}.',
    releaseDate: '2016-06-10',
    rarity: 'mythic',
    finish: 'both',
    artist: 'Matt Stewart',
    manaCost: '{0}',
    colors: [],
    legalities: { commander: 'legal', modern: 'not_legal', legacy: 'legal', vintage: 'restricted', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 185.00, played: 140.00, damaged: 75.00, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 182.00, played: 138.00, damaged: 72.00, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 190.00, played: 145.00, damaged: null, inStock: false, url: '#' },
    ],
  },
  {
    id: 'snapcaster-mage',
    name: 'Snapcaster Mage',
    set: 'Innistrad',
    setCode: 'ISD',
    collectorNumber: '78',
    imageUrl: 'https://cards.scryfall.io/normal/front/0/2/02982b3c-b0f4-4b7a-9fe5-84b4ef4f4416.jpg',
    typeLine: 'Creature — Human Wizard',
    oracleText: 'Flash\nWhen Snapcaster Mage enters the battlefield, target instant or sorcery card in your graveyard gains flashback until end of turn.',
    releaseDate: '2011-09-30',
    rarity: 'rare',
    finish: 'nonfoil',
    artist: 'Volkan Baga',
    manaCost: '{1}{U}',
    colors: ['U'],
    legalities: { commander: 'legal', modern: 'legal', legacy: 'legal', vintage: 'legal', pioneer: 'not_legal', standard: 'not_legal' },
    prices: [
      { vendor: 'Scryfall', logoColor: '#1a1a2e', nm: 42.00, played: 31.00, damaged: 15.00, inStock: true, url: '#' },
      { vendor: 'TCGPlayer', logoColor: '#2563eb', nm: 40.50, played: 30.00, damaged: 14.00, inStock: true, url: '#' },
      { vendor: 'CardKingdom', logoColor: '#7c3aed', nm: 44.00, played: 32.50, damaged: null, inStock: true, url: '#' },
    ],
  },
];

export const RECENT_SEARCHES: RecentSearch[] = [
  { name: 'Lightning Bolt', price: 26.00, change: -1.3, timestamp: Date.now() - 600000 },
  { name: 'Black Lotus', price: 176.00, change: -1.2, timestamp: Date.now() - 1200000 },
  { name: "Urza's Saga", price: 15.00, change: -1.5, timestamp: Date.now() - 1800000 },
  { name: "Urza's Cryscal Printer", price: 13.00, change: -1.7, timestamp: Date.now() - 2400000 },
  { name: "Urza's Reveratic Printer", price: 20.00, change: -1.3, timestamp: Date.now() - 3000000 },
  { name: "Urza's Retain", price: 11.60, change: -1.0, timestamp: Date.now() - 3600000 },
];

export function searchCards(query: string): MTGCard[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return MOCK_CARDS.filter(c => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q));
}

export function getCardById(id: string): MTGCard | undefined {
  return MOCK_CARDS.find(c => c.id === id);
}

export function bulkSearch(names: string[]): { found: MTGCard[], missing: string[] } {
  const found: MTGCard[] = [];
  const missing: string[] = [];
  for (const name of names) {
    const n = name.trim();
    if (!n) continue;
    const card = MOCK_CARDS.find(c => c.name.toLowerCase() === n.toLowerCase());
    if (card) found.push(card);
    else missing.push(n);
  }
  return { found, missing };
}
