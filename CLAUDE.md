# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
```

No test suite exists.

## Architecture

**Card Pricy** is a Next.js 16 App Router app for searching and pricing Magic: The Gathering cards via the Scryfall API.

### Data flow

All card data comes from the public [Scryfall API](https://scryfall.com/docs/api) through `lib/scryfall.ts`. The API is called server-side via Next.js API routes — the client never hits Scryfall directly.

- `GET /api/search?q=` → `scryfallSearch()` — full-text search, supports exact printing syntax
- `GET /api/autocomplete?q=` → `scryfallAutocomplete()` — name suggestions
- `POST /api/bulk` (body: `{ names: string[] }`) → `scryfallBulkSearch()` — resolves up to 75 names per batch via Scryfall's collection endpoint
- `GET /api/card/[id]` → `scryfallGetCard()` — single card by Scryfall UUID

**Rate limiting**: `rateLimitedFetch()` in `lib/scryfall.ts` enforces 100ms between requests. All responses are cached 5 minutes via Next.js `next: { revalidate: 300 }`.

**Exact printing query format**: `CardName (SET) 123 [F|N]` — e.g., `Lightning Bolt (lea) 162`. Parsed by `parseExactPrintingQuery()` and resolved before falling back to general search.

### Prices

Scryfall provides USD and EUR prices only. Played = 75% of NM, damaged = 40% of NM (estimated). Currency conversion uses hardcoded exchange rates in `lib/currency.ts` (USD base). The store defaults to CAD.

### Client state

`lib/store.ts` is a Zustand store (`useAppStore`) holding:
- `currency: Currency` — active display currency (CAD/USD/EUR)
- `list: ListEntry[]` — the user's card list; entries are keyed by `(cardId, condition, finish, vendor, customPrice, customPriceCurrency)` for deduplication
- `recentSearches: RecentSearch[]` — last 10 search queries, stored by the search term the user typed (not canonical card name)

State is in-memory only (no persistence).

### Styling

**Tailwind CSS v4 (CSS-first config).** All design tokens are declared in `app/globals.css` inside `@theme { ... }` — no `tailwind.config.ts` is used (v4 reads the CSS directly via `@tailwindcss/postcss`).

Palette tokens (use as `bg-*`, `text-*`, `border-*`): `crimson`, `crimson-dark`, `crimson-light`, `crimson-soft` (active tint), `crimson-soft-strong` (badge bg), `crimson-ring` (highlighted border), `cream`, `cream-dark`, `parchment`, `ink` (primary text), `ink-secondary`, `ink-muted`, `line` (border), `card` (white card bg), `success`, `warning`.

Fonts: `font-sans` = DM Sans (default on `body`), `font-display` = Playfair Display (headings).

Animations (defined via `--animate-*` + `@keyframes` in `@theme`): `animate-fadeIn`, `animate-slideIn`, `animate-scaleIn`, `animate-spin`, `animate-shimmer`. The `stagger-children` utility (registered with `@utility`) cascades fade-in delays across direct children.

Components use Tailwind utility classes for layout/spacing/color. Inline `style={...}` is reserved for genuinely dynamic values that can't be expressed as classes — e.g. rarity dot color (`RARITY_COLOR[card.rarity]` in `CardGrid`), legality badge colors (`LEGALITY_COLORS` in `CardDetails`), and the rgba gradient overlay on in-list cards.

### Bulk input format

`/bulk` page parses lines as `[N] cardname` where the leading integer is optional quantity. The `parseBulkLine()` function in `app/bulk/page.tsx` handles this. Quantities expand to duplicate names before being sent to `/api/bulk`.
