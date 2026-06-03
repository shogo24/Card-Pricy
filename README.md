# Card Pricy

A Magic: The Gathering card price lookup tool built with Next.js. Search for any card, compare prices across vendors, and build a list with a running total.

## Features

- **Card search** — search by name with live autocomplete powered by Scryfall
- **Bulk search** — paste a list of card names (one per line, optional `N cardname` quantity prefix) to resolve many cards at once
- **Exact printing lookup** — find a specific printing with the `CardName (SET) 123 [F]` syntax (set code, collector number, optional foil flag)
- **Price comparison** — NM, Played, and Damaged prices from TCGPlayer (USD) and Cardmarket (EUR) via Scryfall
- **Currency display** — toggle between CAD, USD, and EUR in the navbar
- **Card list** — add cards with condition, finish, and optionally a custom price; view a running total, copy the list as text, or export as CSV

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Data

All card data and prices come from the [Scryfall API](https://scryfall.com/docs/api) (free, no API key required). Prices are sourced from TCGPlayer (USD) and Cardmarket (EUR); Played and Damaged prices are estimated at 75% and 40% of NM respectively. Currency conversion uses fixed exchange rates defined in `lib/currency.ts`.
