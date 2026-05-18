// Scryfall API integration
// Docs: https://scryfall.com/docs/api

import { MTGCard, VendorPrice, CardLegality } from './types';

const BASE = 'https://api.scryfall.com';

interface ScryfallPriceMap {
  usd?: string | null;
  usd_foil?: string | null;
  eur?: string | null;
}

interface ScryfallLegalities {
  commander?: string;
  modern?: string;
  legacy?: string;
  vintage?: string;
  pioneer?: string;
  standard?: string;
}

interface ScryfallCard {
  id: string;
  name: string;
  set_name?: string;
  set?: string;
  collector_number?: string;
  image_uris?: { normal?: string };
  card_faces?: Array<{ image_uris?: { normal?: string }; oracle_text?: string; mana_cost?: string; colors?: string[] }>;
  type_line?: string;
  oracle_text?: string;
  released_at?: string;
  rarity?: MTGCard['rarity'];
  artist?: string;
  mana_cost?: string;
  colors?: string[];
  flavor_name?: string;
  prices?: ScryfallPriceMap;
  purchase_uris?: { tcgplayer?: string; cardmarket?: string };
  legalities?: ScryfallLegalities;
  foil?: boolean;
  nonfoil?: boolean;
  scryfall_uri?: string;
}

interface ScryfallSearchResponse {
  data?: ScryfallCard[];
}

interface ScryfallCollectionResponse {
  data?: ScryfallCard[];
  not_found?: Array<{ name?: string }>;
}

// Scryfall rate-limit: 50–100ms between requests. We add a small delay utility.
let lastCall = 0;
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const gap = now - lastCall;
  if (gap < 100) await new Promise(r => setTimeout(r, 100 - gap));
  lastCall = Date.now();
  const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5min
  return res;
}

// ------------------------------------------------------------------
// Shape a raw Scryfall card object into our MTGCard type
// ------------------------------------------------------------------
function scryfallToCard(raw: ScryfallCard): MTGCard {
  // Build prices array from Scryfall's USD/EUR prices
  const prices: VendorPrice[] = [];

  const usdNm = raw.prices?.usd ? parseFloat(raw.prices.usd) : null;
  const usdFoil = raw.prices?.usd_foil ? parseFloat(raw.prices.usd_foil) : null;
  const eurNm = raw.prices?.eur ? parseFloat(raw.prices.eur) : null;

  if (usdNm !== null || usdFoil !== null) {
    prices.push({
      vendor: 'Scryfall (TCGPlayer)',
      logoColor: '#1a1a2e',
      nm: usdNm,
      // Scryfall doesn't give played/damaged prices, so we estimate
      played: usdNm ? parseFloat((usdNm * 0.75).toFixed(2)) : null,
      damaged: usdNm ? parseFloat((usdNm * 0.40).toFixed(2)) : null,
      inStock: usdNm !== null,
      url: raw.purchase_uris?.tcgplayer || raw.scryfall_uri || '#',
    });
  }

  if (eurNm !== null) {
    prices.push({
      vendor: 'Cardmarket (EUR)',
      logoColor: '#2563eb',
      nm: eurNm,
      played: eurNm ? parseFloat((eurNm * 0.75).toFixed(2)) : null,
      damaged: eurNm ? parseFloat((eurNm * 0.40).toFixed(2)) : null,
      inStock: eurNm !== null,
      url: raw.purchase_uris?.cardmarket || raw.scryfall_uri || '#',
    });
  }

  // Fallback if no prices found
  if (prices.length === 0) {
    prices.push({
      vendor: 'Scryfall',
      logoColor: '#1a1a2e',
      nm: null, played: null, damaged: null,
      inStock: false,
      url: raw.scryfall_uri || '#',
    });
  }

  const legalities: CardLegality = {
    commander: raw.legalities?.commander || 'not_legal',
    modern: raw.legalities?.modern || 'not_legal',
    legacy: raw.legalities?.legacy || 'not_legal',
    vintage: raw.legalities?.vintage || 'not_legal',
    pioneer: raw.legalities?.pioneer || 'not_legal',
    standard: raw.legalities?.standard || 'not_legal',
  };

  const finish: MTGCard['finish'] = raw.foil && raw.nonfoil ? 'both' : raw.foil ? 'foil' : 'nonfoil';

  return {
    id: raw.id,
    name: raw.name,
    set: raw.set_name || '',
    setCode: raw.set?.toUpperCase() || '',
    collectorNumber: raw.collector_number || '',
    imageUrl: raw.image_uris?.normal || raw.card_faces?.[0]?.image_uris?.normal || '',
    typeLine: raw.type_line || '',
    oracleText: raw.oracle_text || raw.card_faces?.[0]?.oracle_text || '',
    releaseDate: raw.released_at || '',
    rarity: raw.rarity as MTGCard['rarity'],
    finish,
    artist: raw.artist || '',
    manaCost: raw.mana_cost || raw.card_faces?.[0]?.mana_cost || '',
    colors: raw.colors || raw.card_faces?.[0]?.colors || [],
    legalities,
    prices,
    alternateArt: raw.flavor_name || undefined,
  };
}

// ------------------------------------------------------------------
// Search cards by name (autocomplete)
// ------------------------------------------------------------------
export async function scryfallAutocomplete(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  try {
    const res = await rateLimitedFetch(`${BASE}/cards/autocomplete?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data: { data?: string[] } = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// Full text search — returns multiple printings
// ------------------------------------------------------------------
export async function scryfallSearch(query: string): Promise<MTGCard[]> {
  if (!query.trim()) return [];
  try {
    const res = await rateLimitedFetch(`${BASE}/cards/search?q=${encodeURIComponent(query)}&order=released&unique=prints`);
    if (!res.ok) return [];
    const data: ScryfallSearchResponse = await res.json();
    return (data.data || []).map(scryfallToCard);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// Search by exact name — returns cards grouped by name (unique art)
// ------------------------------------------------------------------
export async function scryfallSearchByName(query: string): Promise<MTGCard[]> {
  if (!query.trim()) return [];
  try {
    const encoded = encodeURIComponent(`"${query}"`);
    const res = await rateLimitedFetch(`${BASE}/cards/search?q=${encoded}&unique=prints&order=released`);
    if (!res.ok) {
      // Fallback to fuzzy
      const fuzzy = await rateLimitedFetch(`${BASE}/cards/search?q=${encodeURIComponent(query)}&unique=prints`);
      if (!fuzzy.ok) return [];
      const d: ScryfallSearchResponse = await fuzzy.json();
      return (d.data || []).map(scryfallToCard);
    }
    const data: ScryfallSearchResponse = await res.json();
    return (data.data || []).map(scryfallToCard);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// Get single card by Scryfall ID
// ------------------------------------------------------------------
export async function scryfallGetCard(id: string): Promise<MTGCard | null> {
  try {
    const res = await rateLimitedFetch(`${BASE}/cards/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return scryfallToCard(data);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Get single card by exact name (named endpoint)
// ------------------------------------------------------------------
export async function scryfallGetByExactName(name: string): Promise<MTGCard | null> {
  try {
    const res = await rateLimitedFetch(`${BASE}/cards/named?exact=${encodeURIComponent(name)}`);
    if (!res.ok) {
      // Try fuzzy
      const fuzzy = await rateLimitedFetch(`${BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`);
      if (!fuzzy.ok) return null;
      const data: ScryfallCard = await fuzzy.json();
      return scryfallToCard(data);
    }
    const data: ScryfallCard = await res.json();
    return scryfallToCard(data);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Bulk search — resolve a list of card names
// ------------------------------------------------------------------
export async function scryfallBulkSearch(names: string[]): Promise<{ found: MTGCard[], missing: string[] }> {
  const found: MTGCard[] = [];
  const missing: string[] = [];

  // Scryfall collection endpoint allows up to 75 cards at once
  const chunks: string[][] = [];
  for (let i = 0; i < names.length; i += 75) {
    chunks.push(names.slice(i, i + 75));
  }

  for (const chunk of chunks) {
    try {
      const identifiers = chunk.map(name => ({ name }));
      const res = await fetch(`${BASE}/cards/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiers }),
        next: { revalidate: 300 },
      });
      if (!res.ok) {
        missing.push(...chunk);
        continue;
      }
      const data: ScryfallCollectionResponse = await res.json();
      const foundNames = new Set<string>();
      for (const card of (data.data || [])) {
        found.push(scryfallToCard(card));
        foundNames.add(card.name.toLowerCase());
      }
      for (const notFound of (data.not_found || [])) {
        missing.push(notFound.name || 'Unknown');
      }
      void foundNames;
    } catch {
      missing.push(...chunk);
    }
  }

  return { found, missing };
}
