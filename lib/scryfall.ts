// Scryfall API integration
// Docs: https://scryfall.com/docs/api

import { MTGCard, VendorPrice, CardLegality } from './types';

const BASE = 'https://api.scryfall.com';

interface ScryfallPriceMap {
  usd?: string | null;
  usd_foil?: string | null;
  eur?: string | null;
  eur_foil?: string | null;
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

interface ParsedPrintingQuery {
  name: string;
  setCode?: string;
  collectorNumber?: string;
  foil?: boolean;
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
  const eurFoil = raw.prices?.eur_foil ? parseFloat(raw.prices.eur_foil) : null;

  if (usdNm !== null || usdFoil !== null) {
    prices.push({
      vendor: 'Scryfall (TCGPlayer)',
      logoColor: '#1a1a2e',
      nm: usdNm,
      // Scryfall doesn't give played/damaged prices, so we estimate
      played: usdNm ? parseFloat((usdNm * 0.75).toFixed(2)) : null,
      damaged: usdNm ? parseFloat((usdNm * 0.40).toFixed(2)) : null,
      foil: usdFoil,
      inStock: usdNm !== null,
      url: raw.purchase_uris?.tcgplayer || raw.scryfall_uri || '#',
    });
  }

  if (eurNm !== null || eurFoil !== null) {
    prices.push({
      vendor: 'Cardmarket (EUR)',
      logoColor: '#2563eb',
      nm: eurNm,
      played: eurNm ? parseFloat((eurNm * 0.75).toFixed(2)) : null,
      damaged: eurNm ? parseFloat((eurNm * 0.40).toFixed(2)) : null,
      foil: eurFoil,
      inStock: eurNm !== null || eurFoil !== null,
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

function parseExactPrintingQuery(query: string): ParsedPrintingQuery | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const exactMatch = trimmed.match(/^(.*?)(?:\s*\(([^)]+)\))?(?:\s+(\d+))(?:\s+([FN]{1,2}))?$/i);
  if (!exactMatch) return null;

  const name = exactMatch[1].trim();
  const setCode = exactMatch[2]?.trim().toLowerCase();
  const collectorNumber = exactMatch[3]?.trim();
  const finishToken = exactMatch[4]?.trim().toUpperCase();

  if (!name || !setCode || !collectorNumber) return null;

  return {
    name,
    setCode,
    collectorNumber,
    foil: finishToken ? finishToken.startsWith('F') : undefined,
  };
}

async function resolveExactPrintingQuery(query: string): Promise<MTGCard | null> {
  const parsed = parseExactPrintingQuery(query);
  if (!parsed) return null;

  const exactQuery = [
    `!"${parsed.name}"`,
    `set:${parsed.setCode}`,
    `cn:${parsed.collectorNumber}`,
    parsed.foil === true ? 'is:foil' : parsed.foil === false ? 'is:nonfoil' : '',
  ].filter(Boolean).join(' ');

  const exactRes = await rateLimitedFetch(`${BASE}/cards/search?q=${encodeURIComponent(exactQuery)}&order=released&unique=prints`);
  if (!exactRes.ok) return null;

  const exactData: ScryfallSearchResponse = await exactRes.json();
  return (exactData.data || []).map(scryfallToCard)[0] || null;
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
    const exactCard = await resolveExactPrintingQuery(query);
    if (exactCard) {
      return [exactCard];
    }

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
  const plainNames: string[] = [];

  for (const name of names) {
    if (parseExactPrintingQuery(name)) {
      const exactCard = await resolveExactPrintingQuery(name);
      if (exactCard) {
        found.push(exactCard);
      } else {
        missing.push(name);
      }
    } else {
      plainNames.push(name);
    }
  }

  // Scryfall collection endpoint allows up to 75 cards at once
  const chunks: string[][] = [];
  for (let i = 0; i < plainNames.length; i += 75) {
    chunks.push(plainNames.slice(i, i + 75));
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
      const cardsByName = new Map<string, ScryfallCard[]>();
      for (const card of (data.data || [])) {
        const key = card.name.toLowerCase();
        const cardsForName = cardsByName.get(key) || [];
        cardsForName.push(card);
        cardsByName.set(key, cardsForName);
      }

      for (const requestedName of chunk) {
        const exactCard = cardsByName.get(requestedName.toLowerCase())?.[0];
        if (exactCard) {
          found.push(scryfallToCard(exactCard));
        } else {
          const fallbackCard = await scryfallGetByExactName(requestedName);
          if (fallbackCard) {
            found.push(fallbackCard);
          } else {
            missing.push(requestedName);
          }
        }
      }
    } catch {
      missing.push(...chunk);
    }
  }

  return { found, missing };
}
