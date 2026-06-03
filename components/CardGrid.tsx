'use client';
import { MTGCard } from '@/lib/types';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';

interface CardGridProps {
  cards: MTGCard[];
  onCardClick: (card: MTGCard) => void;
}

const RARITY_COLOR: Record<string, string> = {
  common: '#6B7280',
  uncommon: '#9CA3AF',
  rare: '#D4A017',
  mythic: '#E57C23',
};

export default function CardGrid({ cards, onCardClick }: CardGridProps) {
  const { currency, list } = useAppStore();

  const listCounts = list.reduce((acc, entry) => {
    acc[entry.card.id] = (acc[entry.card.id] || 0) + entry.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="stagger-children grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
      {cards.map((card) => {
        const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
        const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
        const listCount = listCounts[card.id] || 0;
        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={`bg-card rounded-xl overflow-hidden cursor-pointer text-left p-0 flex flex-col border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.75 hover:shadow-lg ${
              listCount > 0 ? 'border-crimson-ring' : 'border-line'
            }`}
          >
            <div className="relative pt-[139%] bg-cream-dark w-full">
              <Image
                src={card.imageUrl}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              {listCount > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(139,26,43,0.10) 0%, rgba(139,26,43,0.03) 35%, rgba(0,0,0,0) 100%)' }}
                />
              )}
              {listCount > 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-crimson-soft-strong text-white text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                  In list · x{listCount}
                </div>
              )}
              <div
                className="absolute top-2 left-2 w-2 h-2 rounded-full shadow-[0_0_4px_currentColor]"
                style={{ background: RARITY_COLOR[card.rarity] }}
              />
            </div>
            <div className="px-3 pt-2.5 pb-3">
              <div className="text-[13px] font-semibold text-ink leading-tight mb-1">{card.name}</div>
              <div className="text-[11px] text-ink-muted mb-1.5">{card.set}</div>
              <div className="text-[13px] font-bold text-crimson">
                {lowestNm !== null ? formatPrice(lowestNm, currency) : 'N/A'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
